import Notification from "../modules/notifications/notification.model.js";
import { NOTIFICATION_TYPE, NOTIFICATION_CATEGORY } from "../constants/enums.js";

/**
 * Create a notification automatically
 * @param {Object} options - Notification options
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {string} options.type - Notification type (success, warning, info, error)
 * @param {string} options.category - Notification category (system, user, moderation, analytics)
 * @param {string|null} options.recipient_id - User ID to send notification to (null for system-wide/admin)
 * @param {string|null} options.related_entity_type - Type of related entity (user, statement, chain, challenge)
 * @param {string|null} options.related_entity_id - ID of related entity
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async ({
  title,
  message,
  type = NOTIFICATION_TYPE.INFO,
  category = NOTIFICATION_CATEGORY.SYSTEM,
  recipient_id = null,
  related_entity_type = null,
  related_entity_id = null,
}) => {
  try {
    const notification = await Notification.create({
      title,
      message,
      type,
      category,
      recipient_id,
      related_entity_type,
      related_entity_id,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw error to prevent breaking the main flow
    return null;
  }
};

/**
 * Create notification when a new user registers
 * @param {string} userId - New user ID
 * @param {string} username - New user username
 * @returns {Promise<Object>} Created notification
 */
export const notifyUserRegistration = async (userId, username) => {
  // System-wide notification for admins
  await createNotification({
    title: "New User Registered",
    message: `A new user "${username || "User"}" has successfully registered on the platform`,
    type: NOTIFICATION_TYPE.SUCCESS,
    category: NOTIFICATION_CATEGORY.USER,
    recipient_id: null, // System-wide for admins
    related_entity_type: "user",
    related_entity_id: userId,
  });

  // Welcome notification for the new user
  await createNotification({
    title: "Welcome to One Cap!",
    message: "Thank you for joining! Start creating and sharing your truth or cap challenges.",
    type: NOTIFICATION_TYPE.SUCCESS,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: userId,
    related_entity_type: "user",
    related_entity_id: userId,
  });
};

/**
 * Create notification when a new chain is created
 * @param {string} chainId - Chain ID
 * @param {string} chainTitle - Chain title
 * @param {string} userId - User ID who created the chain
 * @param {string} username - Username who created the chain
 * @returns {Promise<Object>} Created notification
 */
export const notifyChainCreated = async (chainId, chainTitle, userId, username) => {
  // System-wide notification for admins
  await createNotification({
    title: "New Chain Created",
    message: `User "${username || "User"}" has created a new chain: "${chainTitle}"`,
    type: NOTIFICATION_TYPE.INFO,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: null, // System-wide for admins
    related_entity_type: "chain",
    related_entity_id: chainId,
  });

  // Confirmation notification for the creator
  await createNotification({
    title: "Chain Created Successfully",
    message: `Your chain "${chainTitle}" has been created and is now live!`,
    type: NOTIFICATION_TYPE.SUCCESS,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: userId,
    related_entity_type: "chain",
    related_entity_id: chainId,
  });
};

/**
 * Create notification when a new challenge is created
 * @param {string} challengeId - Challenge ID
 * @param {string} chainId - Chain ID
 * @param {string} userId - User ID who created the challenge
 * @param {string} username - Username who created the challenge
 * @returns {Promise<Object>} Created notification
 */
export const notifyChallengeCreated = async (challengeId, chainId, userId, username) => {
  // System-wide notification for admins
  await createNotification({
    title: "New Challenge Created",
    message: `User "${username || "User"}" has created a new challenge in a chain`,
    type: NOTIFICATION_TYPE.INFO,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: null, // System-wide for admins
    related_entity_type: "challenge",
    related_entity_id: challengeId,
  });
};

/**
 * Create notification when a user is banned/shadow banned
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} status - New status (banned, shadow_banned)
 * @returns {Promise<Object>} Created notification
 */
export const notifyUserStatusChange = async (userId, username, status) => {
  const statusMessages = {
    banned: "has been banned from the platform",
    shadow_banned: "has been shadow banned",
    active: "account has been restored",
  };

  // System-wide notification for admins
  await createNotification({
    title: `User ${status === "active" ? "Restored" : "Status Changed"}`,
    message: `User "${username || "User"}" ${statusMessages[status] || "status has been changed"}`,
    type: status === "active" ? NOTIFICATION_TYPE.SUCCESS : NOTIFICATION_TYPE.WARNING,
    category: NOTIFICATION_CATEGORY.MODERATION,
    recipient_id: null, // System-wide for admins
    related_entity_type: "user",
    related_entity_id: userId,
  });

  // Notification for the affected user
  if (status !== "active") {
    await createNotification({
      title: "Account Status Update",
      message: `Your account ${statusMessages[status] || "status has been changed"}. Please contact support if you have any questions.`,
      type: NOTIFICATION_TYPE.WARNING,
      category: NOTIFICATION_CATEGORY.MODERATION,
      recipient_id: userId,
      related_entity_type: "user",
      related_entity_id: userId,
    });
  }
};

/**
 * Create notification when a statement is published
 * @param {string} statementId - Statement ID
 * @param {string} statementText - Statement text (truncated)
 * @returns {Promise<Object>} Created notification
 */
export const notifyStatementPublished = async (statementId, statementText) => {
  const truncatedText = statementText.length > 50 
    ? statementText.substring(0, 50) + "..." 
    : statementText;

  // System-wide notification for admins
  await createNotification({
    title: "Statement Published",
    message: `A new statement has been published: "${truncatedText}"`,
    type: NOTIFICATION_TYPE.SUCCESS,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: null, // System-wide for admins
    related_entity_type: "statement",
    related_entity_id: statementId,
  });
};

/**
 * Create notification for high report count
 * @param {string} userId - User ID with high reports
 * @param {string} username - Username
 * @param {number} reportCount - Number of reports
 * @returns {Promise<Object>} Created notification
 */
export const notifyHighReportCount = async (userId, username, reportCount) => {
  await createNotification({
    title: "High Report Count",
    message: `User "${username || "User"}" has received ${reportCount} reports in the last 24 hours`,
    type: NOTIFICATION_TYPE.WARNING,
    category: NOTIFICATION_CATEGORY.MODERATION,
    recipient_id: null, // System-wide for admins
    related_entity_type: "user",
    related_entity_id: userId,
  });
};

/**
 * Create notification when a challenge is reported
 * @param {string} challengeId - Challenge ID
 * @param {string} reporterId - User ID who reported
 * @param {string} reporterUsername - Username who reported
 * @param {string} reason - Report reason
 * @param {string} challengeCreatorId - Challenge creator ID
 * @param {string} challengeCreatorUsername - Challenge creator username
 * @returns {Promise<Object>} Created notification
 */
export const notifyChallengeReported = async (challengeId, reporterId, reporterUsername, reason, challengeCreatorId, challengeCreatorUsername) => {
  // System-wide notification for admins
  await createNotification({
    title: "Challenge Reported",
    message: `User "${reporterUsername || "User"}" has reported a challenge created by "${challengeCreatorUsername || "User"}". Reason: ${reason}`,
    type: NOTIFICATION_TYPE.WARNING,
    category: NOTIFICATION_CATEGORY.MODERATION,
    recipient_id: null, // System-wide for admins
    related_entity_type: "challenge",
    related_entity_id: challengeId,
  });

  // Notification for challenge creator
  await createNotification({
    title: "Your Challenge Has Been Reported",
    message: `Your challenge has been reported for: ${reason}. Our team will review it shortly.`,
    type: NOTIFICATION_TYPE.WARNING,
    category: NOTIFICATION_CATEGORY.MODERATION,
    recipient_id: challengeCreatorId,
    related_entity_type: "challenge",
    related_entity_id: challengeId,
  });
};

/**
 * Create notification when subscription is created successfully
 * @param {string} subscriptionId - Subscription ID
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} plan - Plan type (monthly/yearly)
 * @param {string} paymentProvider - Payment provider
 * @returns {Promise<Object>} Created notification
 */
export const notifySubscriptionCreated = async (subscriptionId, userId, username, plan, paymentProvider) => {
  // System-wide notification for admins
  await createNotification({
    title: "New Subscription Purchase",
    message: `User "${username || "User"}" has purchased a ${plan} subscription via ${paymentProvider}`,
    type: NOTIFICATION_TYPE.SUCCESS,
    category: NOTIFICATION_CATEGORY.ANALYTICS,
    recipient_id: null, // System-wide for admins
    related_entity_type: "user",
    related_entity_id: userId,
  });

  // Notification for the user
  await createNotification({
    title: "Subscription Activated",
    message: `Your ${plan} subscription has been activated successfully! Enjoy all premium features.`,
    type: NOTIFICATION_TYPE.SUCCESS,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: userId,
    related_entity_type: "user",
    related_entity_id: userId,
  });
};

/**
 * Create notification when subscription creation fails
 * @param {string} userId - User ID
 * @param {string} username - Username
 * @param {string} plan - Plan type (monthly/yearly)
 * @param {string} paymentProvider - Payment provider
 * @param {string} errorMessage - Error message
 * @returns {Promise<Object>} Created notification
 */
export const notifySubscriptionFailed = async (userId, username, plan, paymentProvider, errorMessage) => {
  // System-wide notification for admins
  await createNotification({
    title: "Subscription Purchase Failed",
    message: `User "${username || "User"}" attempted to purchase a ${plan} subscription via ${paymentProvider} but it failed. Error: ${errorMessage}`,
    type: NOTIFICATION_TYPE.ERROR,
    category: NOTIFICATION_CATEGORY.ANALYTICS,
    recipient_id: null, // System-wide for admins
    related_entity_type: "user",
    related_entity_id: userId,
  });

  // Notification for the user
  await createNotification({
    title: "Subscription Purchase Failed",
    message: `Your ${plan} subscription purchase was unsuccessful. Please try again or contact support if the issue persists.`,
    type: NOTIFICATION_TYPE.ERROR,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    recipient_id: userId,
    related_entity_type: "user",
    related_entity_id: userId,
  });
};
