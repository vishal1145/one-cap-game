import * as NotificationService from "./notification.service.js";

export const createNotification = async (req, reply) => {
  try {
    const notification = await NotificationService.createNotification(req.body);

    return reply.send({
      success: true,
      notification,
      message: "Notification created successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getAllNotifications = async (req, reply) => {
  try {
    const notifications = await NotificationService.getNotifications({
      user: req.user,
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...notifications,
      message: "Notifications fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getNotificationById = async (req, reply) => {
  try {
    const notification = await NotificationService.getNotificationById({
      notificationId: req.params.id,
      user: req.user,
    });

    return reply.send({
      success: true,
      notification,
      message: "Notification fetched successfully",
    });
  } catch (err) {
    return reply.code(403).send({
      success: false,
      message: err.message,
    });
  }
};

export const updateNotification = async (req, reply) => {
  try {
    const notification = await NotificationService.updateNotification({
      notificationId: req.params.id,
      payload: req.body,
    });

    return reply.send({
      success: true,
      notification,
      message: "Notification updated successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const markAllAsRead = async (req, reply) => {
  try {
    const result = await NotificationService.markAllAsRead({
      userId: req.user.userId,
      user: req.user,
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...result,
      message: result.message || "All notifications marked as read",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const deleteNotification = async (req, reply) => {
  try {
    const result = await NotificationService.deleteNotification({
      notificationId: req.params.id,
    });

    return reply.send({
      success: true,
      message: result.message || "Notification deleted successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const deleteAllNotifications = async (req, reply) => {
  try {
    const result = await NotificationService.deleteAllNotifications({
      userId: req.user.userId,
      user: req.user,
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...result,
      message: result.message || "All notifications deleted successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};
