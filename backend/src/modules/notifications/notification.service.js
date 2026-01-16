import Notification from "./notification.model.js";

export const createNotification = async (payload) => {
  const notification = await Notification.create(payload);
  return notification;
};

export const getNotifications = async ({ user, filters }) => {
  const {
    page = 1,
    limit = 20,
    category,
    type,
    read,
    search,
  } = filters;

  const query = {};

  if (user.role === "admin") {
    if (filters.recipient_id) {
      query.recipient_id = filters.recipient_id;
    } else {
      query.$or = [
        { recipient_id: null },
        { recipient_id: { $exists: false } },
      ];
    }
  } else {
    query.$or = [
      { recipient_id: user.userId },
      { recipient_id: null },
      { recipient_id: { $exists: false } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (type) {
    query.type = type;
  }

  if (read !== undefined) {
    query.read = read === "true" || read === true;
  }

  const searchConditions = [];
  if (search) {
    searchConditions.push({
      title: { $regex: search, $options: "i" },
    });
    searchConditions.push({
      message: { $regex: search, $options: "i" },
    });
  }

  const allConditions = [];
  if (Object.keys(query).length > 0) {
    allConditions.push(query);
  }
  if (searchConditions.length > 0) {
    allConditions.push({ $or: searchConditions });
  }

  const finalQuery = allConditions.length > 1 ? { $and: allConditions } : allConditions[0] || {};

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find(finalQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Notification.countDocuments(finalQuery),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getNotificationById = async ({ notificationId, user }) => {
  const notification = await Notification.findById(notificationId).lean();

  if (!notification) {
    throw new Error("Notification not found");
  }

  if (user.role !== "admin") {
    if (notification.recipient_id && notification.recipient_id.toString() !== user.userId) {
      throw new Error("Access denied");
    }
  }

  return notification;
};

export const updateNotification = async ({ notificationId, payload }) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error("Notification not found");
  }

  if (payload.read === true && !notification.read) {
    payload.read_at = new Date();
  }

  const updatedNotification = await Notification.findByIdAndUpdate(
    notificationId,
    payload,
    { new: true, runValidators: true }
  ).lean();

  return updatedNotification;
};

export const markAllAsRead = async ({ userId, user, filters = {} }) => {
  const query = {
    read: false,
  };

  if (user && user.role === "admin") {
    if (filters.recipient_id) {
      query.recipient_id = filters.recipient_id;
    } else {
      query.$or = [
        { recipient_id: null },
        { recipient_id: { $exists: false } },
      ];
    }
  } else {
    query.$or = [
      { recipient_id: userId },
      { recipient_id: null },
      { recipient_id: { $exists: false } },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.type) {
    query.type = filters.type;
  }

  const result = await Notification.updateMany(
    query,
    {
      $set: {
        read: true,
        read_at: new Date(),
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
    message: `${result.modifiedCount} notifications marked as read`,
  };
};

export const deleteNotification = async ({ notificationId }) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error("Notification not found");
  }

  await Notification.findByIdAndDelete(notificationId);

  return { message: "Notification deleted successfully" };
};

export const deleteAllNotifications = async ({ userId, user, filters = {} }) => {
  const query = {};

  if (user && user.role === "admin") {
    if (filters.recipient_id) {
      query.recipient_id = filters.recipient_id;
    } else {
      query.$or = [
        { recipient_id: null },
        { recipient_id: { $exists: false } },
      ];
    }
  } else {
    query.$or = [
      { recipient_id: userId },
      { recipient_id: null },
      { recipient_id: { $exists: false } },
    ];
  }

  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.type) {
    query.type = filters.type;
  }
  if (filters.read !== undefined) {
    query.read = filters.read === "true" || filters.read === true;
  }

  const result = await Notification.deleteMany(query);

  return {
    deletedCount: result.deletedCount,
    message: `${result.deletedCount} notifications deleted successfully`,
  };
};
