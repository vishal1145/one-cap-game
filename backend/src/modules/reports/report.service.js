import Report from "./report.model.js";
import User from "../users/user.model.js";
import Chain from "../chains/chain.model.js";
import Challenge from "../challenges/challenge.model.js";
import { REPORT_STATUS, REPORT_ACTION, USER_STATUS, CHALLENGE_STATUS } from "../../constants/enums.js";
import { notifyChallengeReported } from "../../utils/notifications.js";

export const createReport = async ({ reporterId, targetType, targetId, reason }) => {

    let targetExists = false;
    const map = {
        user: User,
        chain: Chain,
        challenge: Challenge,
    };

    if (map[targetType]) {
        const target = await map[targetType].findById(targetId);
        targetExists = !!target;
    }

    if (!targetExists) {
        throw new Error("Target not found");
    }

    const existingReport = await Report.findOne({
        reporter_id: reporterId,
        target_type: targetType,
        target_id: targetId,
        status: REPORT_STATUS.PENDING,
    });

    if (existingReport) {
        throw new Error("You have already reported this item");
    }

    const report = await Report.create({
        reporter_id: reporterId,
        target_type: targetType,
        target_id: targetId,
        reason,
        status: REPORT_STATUS.PENDING,
    });

    if (map[targetType]) {
        await map[targetType].findByIdAndUpdate(targetId, {
            $inc: { reported_count: 1 },
            $set: { is_reported: true },
        });
    }

    // Create notification if challenge is reported
    if (targetType === "challenge") {
        const challenge = await Challenge.findById(targetId).populate("creator_id", "username").lean();
        const reporter = await User.findById(reporterId).select("username").lean();
        
        if (challenge && challenge.creator_id && reporter) {
            await notifyChallengeReported(
                targetId,
                reporterId,
                reporter.username || "User",
                reason,
                challenge.creator_id._id?.toString() || challenge.creator_id.toString(),
                challenge.creator_id.username || "User"
            );
        }
    }

    return await Report.findById(report._id)
        .populate("reporter_id", "username email")
        .lean();
};

export const getGroupWiseReports = async ({ filters }) => {
    const { page = 1, limit = 20, status, target_type } = filters;

    const matchStage = {};
    if (status) matchStage.status = status;
    if (target_type) matchStage.target_type = target_type;

    const skip = (page - 1) * limit;

    const pipeline = [
        { $match: matchStage },

        {
            $group: {
                _id: {
                    target_type: "$target_type",
                    target_id: "$target_id",
                },
                report_count: { $sum: 1 },
                reasons: { $addToSet: "$reason" },
                last_reported_at: { $max: "$createdAt" },
                statuses: { $addToSet: "$status" },
            },
        },

        {
            $addFields: {
                group_status: {
                    $cond: [
                        { $in: ["pending", "$statuses"] },
                        "pending",
                        {
                            $cond: [
                                { $in: ["actioned", "$statuses"] },
                                "actioned",
                                "reviewed",
                            ],
                        },
                    ],
                },
            },
        },

        // Lookup user target
        {
            $lookup: {
                from: "users",
                let: { targetId: "$_id.target_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$targetId"],
                            },
                        },
                    },
                    {
                        $project: {
                            username: 1,
                            email: 1,
                            avatar_url: 1,
                            status: 1,
                            reported_count: 1,
                            is_reported: 1,
                        },
                    },
                ],
                as: "target_user",
            },
        },

        // Lookup chain target
        {
            $lookup: {
                from: "chains",
                let: { targetId: "$_id.target_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$targetId"],
                            },
                        },
                    },
                    {
                        $project: {
                            title: 1,
                            visibility: 1,
                            status: 1,
                            starter_id: 1,
                            reported_count: 1,
                            is_reported: 1,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "starter_id",
                            foreignField: "_id",
                            as: "starter",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        email: 1,
                                        avatar_url: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            starter: { $arrayElemAt: ["$starter", 0] },
                        },
                    },
                ],
                as: "target_chain",
            },
        },

        // Lookup challenge target
        {
            $lookup: {
                from: "challenges",
                let: { targetId: "$_id.target_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$_id", "$$targetId"],
                            },
                        },
                    },
                    {
                        $project: {
                            chain_id: 1,
                            creator_id: 1,
                            visibility: 1,
                            status: 1,
                            reported_count: 1,
                            is_reported: 1,
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "creator_id",
                            foreignField: "_id",
                            as: "creator",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        email: 1,
                                        avatar_url: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            creator: { $arrayElemAt: ["$creator", 0] },
                        },
                    },
                ],
                as: "target_challenge",
            },
        },

        // Combine target data based on target_type
        {
            $addFields: {
                target: {
                    $cond: [
                        { $eq: ["$_id.target_type", "user"] },
                        { $arrayElemAt: ["$target_user", 0] },
                        {
                            $cond: [
                                { $eq: ["$_id.target_type", "chain"] },
                                { $arrayElemAt: ["$target_chain", 0] },
                                { $arrayElemAt: ["$target_challenge", 0] },
                            ],
                        },
                    ],
                },
            },
        },

        // Remove individual target arrays
        {
            $project: {
                target_user: 0,
                target_chain: 0,
                target_challenge: 0,
            },
        },

        { $sort: { report_count: -1 } },

        // pagination
        { $skip: skip },
        { $limit: Number(limit) },
    ];

    const reports = await Report.aggregate(pipeline);

    return {
        reports,
        pagination: {
            total: reports.length,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(reports.length / limit),
        },
    };
};


// export const takeActionOnReport = async ({ reportId, adminId, action, notes }) => {
//     const report = await Report.findById(reportId);

//     if (!report) {
//         throw new Error("Report not found");
//     }

//     if (report.status === REPORT_STATUS.ACTIONED) {
//         throw new Error("Action has already been taken on this report");
//     }

//     // Determine status based on action
//     let finalStatus = REPORT_STATUS.ACTIONED;
//     if (action === REPORT_ACTION.IGNORE) {
//         finalStatus = REPORT_STATUS.REVIEWED;
//     }

//     // Update report
//     const updatedReport = await Report.findByIdAndUpdate(
//         reportId,
//         {
//             status: finalStatus,
//             action_taken: action,
//             reviewed_by: adminId,
//         },
//         { new: true }
//     )
//         .populate("reporter_id", "username email")
//         .populate("reviewed_by", "username email")
//         .lean();

//     // Take action on the target based on action type
//     if (action === REPORT_ACTION.BAN && report.target_type === "user") {
//         await User.findByIdAndUpdate(report.target_id, {
//             status: USER_STATUS.BANNED,
//         });
//     } else if (action === REPORT_ACTION.MUTE && report.target_type === "user") {
//         await User.findByIdAndUpdate(report.target_id, {
//             status: USER_STATUS.SHADOW_BANNED,
//         });
//     } else if (action === REPORT_ACTION.MUTE) {
//         if (report.target_type === "chain") {
//             await Chain.findByIdAndUpdate(report.target_id, {
//                 is_muted: true,
//                 muted_reason: notes,
//                 muted_by: adminId,
//             });
//         } else if (report.target_type === "challenge") {
//             await Challenge.findByIdAndUpdate(report.target_id, {
//                 status: CHALLENGE_STATUS.MUTED,
//             });
//         }
//     }
//     // For WARNING and IGNORE actions, we just record the action without modifying the target

//     return updatedReport;
// };

export const takeActionOnTargetReports = async ({ targetType, targetId, adminId, action, notes }) => {
    // Find all pending reports for this target
    const pendingReports = await Report.find({
        target_type: targetType,
        target_id: targetId,
        status: REPORT_STATUS.PENDING,
    });

    if (pendingReports.length === 0) {
        throw new Error("No pending reports found for this target");
    }

    // Determine status based on action
    let finalStatus = REPORT_STATUS.ACTIONED;
    if (action === REPORT_ACTION.IGNORE) {
        finalStatus = REPORT_STATUS.REVIEWED;
    }

    // Update all pending reports for this target
    await Report.updateMany(
        {
            target_type: targetType,
            target_id: targetId,
            status: REPORT_STATUS.PENDING,
        },
        {
            $set: {
                status: finalStatus,
                action_taken: action,
                reviewed_by: adminId,
            },
        }
    );

    // Take action on the target based on action type
    if (action === REPORT_ACTION.BAN && targetType === "user") {
        await User.findByIdAndUpdate(targetId, {
            status: USER_STATUS.BANNED,
        });
    } else if (action === REPORT_ACTION.MUTE && targetType === "user") {
        await User.findByIdAndUpdate(targetId, {
            status: USER_STATUS.SHADOW_BANNED,
        });
    } else if (action === REPORT_ACTION.MUTE) {
        if (targetType === "chain") {
            await Chain.findByIdAndUpdate(targetId, {
                is_muted: true,
                muted_reason: notes,
                muted_by: adminId,
            });
        } else if (targetType === "challenge") {
            await Challenge.findByIdAndUpdate(targetId, {
                status: CHALLENGE_STATUS.MUTED,
            });
        }
    } else if (action === REPORT_ACTION.DELETE) {
        if (targetType === "chain") {
            await Chain.findByIdAndUpdate(targetId, {
                is_muted: true,
                muted_reason: notes,
                muted_by: adminId,
            });
        } else if (targetType === "challenge") {
            await Challenge.findByIdAndUpdate(targetId, {
                status: CHALLENGE_STATUS.MUTED,
            });
        }
    }

    return {
        message: `Action ${action} taken on ${pendingReports.length} report(s)`,
        reportsUpdated: pendingReports.length,
    };
};

export const getReportById = async ({ reportId }) => {
    const report = await Report.findById(reportId)
        .populate("reporter_id", "username email")
        .populate("reviewed_by", "username email")
        .lean();

    if (!report) {
        throw new Error("Report not found");
    }

    return report;
};
