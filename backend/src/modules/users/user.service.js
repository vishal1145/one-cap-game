import User from "./user.model.js";
import { USER_STATUS, USER_ROLES } from "../../constants/enums.js";

export const fetchUsers = async ({
    page = 1,
    limit = 20,
    status,
    role,
    search,
}) => {
    const query = {};

    if (status) query.status = status;
    if (role) query.role = role;

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    const skip = (page - 1) * limit;

    const [users, total, statusStats] = await Promise.all([
        User.find(query)
            .select("-password_hash")
            .populate({
                path: "chains",
                select: "_id title visibility createdAt",
                // options: { limit: 3, sort: { createdAt: -1 } }
            })
            .populate({
                path: "challenges",
                select: "_id chainId createdAt",
                // options: { limit: 3, sort: { createdAt: -1 } }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),

        User.countDocuments(query),

        User.aggregate([
            {
                $match: {
                    role: "user", 
                },
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 },
                },
            },
        ]),
    ]);

    const stats = {
        total: 0,
        active: 0,
        banned: 0,
        shadow_banned: 0,
    };

    statusStats.forEach((item) => {
        stats[item._id] = item.count;
        stats.total += item.count;
    });

    return {
        users,
        stats,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const updateMyProfile = async (userId, payload) => {
  const allowedFields = ["username", "email", "avatar_url", "phone"];
  const updates = {};

  for (const key of allowedFields) {
    if (payload[key] !== undefined) {
      updates[key] = payload[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error("No valid fields to update");
  }

  return User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true }
  ).select("-password_hash");
};

export const updateUserStatus = async (userId, status) => {
  if (!Object.values(USER_STATUS).includes(status)) {
    throw new Error("Invalid status");
  }

  return User.findByIdAndUpdate(
    userId,
    { status },
    { new: true }
  ).select("-password_hash");
};

export const getUserById = async ({ requester, targetUserId }) => {
  console.log("requester", requester);
  console.log("targetUserId", targetUserId);
  if (requester.role !== USER_ROLES.ADMIN && requester.userId !== targetUserId) {
    throw new Error("Unauthorized access");
  }

  const user = await User.findById(targetUserId)
    .select("-password_hash")
    .populate("chains", "_id title visibility createdAt")
    .populate("challenges", "_id chainId createdAt")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  // If normal user → hide admin-only fields
  if (requester.role !== USER_ROLES.ADMIN) {
    delete user.role;
  }

  return user;
};