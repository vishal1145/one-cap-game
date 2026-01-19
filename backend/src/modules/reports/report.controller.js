import * as ReportService from "./report.service.js";

export const createReport = async (req, reply) => {
  try {
    const reporterId = req.user.userId;
    const { target_type, target_id, reason } = req.body;

    const report = await ReportService.createReport({
      reporterId,
      targetType: target_type,
      targetId: target_id,
      reason,
    });

    return reply.send({
      success: true,
      report,
      message: "Report created successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getGroupWiseReports = async (req, reply) => {
  try {
    const data = await ReportService.getGroupWiseReports({
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...data,
      message: "Reports fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getReportById = async (req, reply) => {
  try {
    const { reportId } = req.params;

    const report = await ReportService.getReportById({
      reportId,
    });

    return reply.send({
      success: true,
      report,
      message: "Report fetched successfully",
    });
  } catch (err) {
    return reply.code(404).send({
      success: false,
      message: err.message,
    });
  }
};

export const takeActionOnTargetReports = async (req, reply) => {
  try {
    const { target_type, target_id } = req.body;
    const adminId = req.user.userId;
    const { action, notes } = req.body;

    const result = await ReportService.takeActionOnTargetReports({
      targetType: target_type,
      targetId: target_id,
      adminId,
      action,
      notes,
    });

    return reply.send({
      success: true,
      ...result,
      message: "Action taken on reports successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};
