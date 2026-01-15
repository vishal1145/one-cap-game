import * as UserService from "./user.service.js";

export const getUsersList = async (req, reply) => {
  try {
    const data = await UserService.fetchUsers(req.query);
    reply.send({
      success: true,
      ...data,
      message: "Users list fetched successfully",
    });
  } catch (err) {
    reply.status(500).send({
      success: false,
      message: err.message,
    });
  }
};

export const updateMyProfile = async (req, reply) => {
  try {
    const userId = req.user.userId;
    console.log("userId", req.user);
    const user = await UserService.updateMyProfile(userId, req.body);

    return reply.send({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (err) {
    return reply.code(400).send({ success: false, message: err.message });
  }
};

export const updateUserStatus = async (req, reply) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const user = await UserService.updateUserStatus(userId, status);

    if (!user) {
      return reply.code(404).send({ message: "User not found" });
    }

    return reply.send({
      success: true,
      user,
      message: "User status updated successfully",
    });
  } catch (err) {
    return reply.code(400).send({ success: false, message: err.message });
  }
};

export const getUserById = async (req, reply) => {
  try {
    const { userId } = req.params;

    const user = await UserService.getUserById({
      requester: req.user,
      targetUserId: userId,
    });

    return reply.send({
      success: true,
      user,
      message: "User fetched successfully",
    });
  } catch (err) {
    return reply.code(403).send({
      success: false,
      message: err.message,
    });
  }
};