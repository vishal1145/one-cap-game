import * as SubscriptionService from "./subscription.service.js";
import { notifySubscriptionFailed } from "../../utils/notifications.js";
import User from "../users/user.model.js";

export const createSubscription = async (req, reply) => {
  try {
    const userId = req.user.userId;
    const { plan, payment_provider } = req.body;

    const subscription = await SubscriptionService.createSubscription({
      userId,
      plan,
      paymentProvider: payment_provider,
    });

    return reply.send({
      success: true,
      subscription,
      message: "Subscription created successfully",
    });
  } catch (err) {
    // Create notification for subscription failure
    try {
      const user = await User.findById(req.user.userId).select("username").lean();
      if (user) {
        await notifySubscriptionFailed(
          req.user.userId,
          user.username || "User",
          req.body.plan || "unknown",
          req.body.payment_provider || "unknown",
          err.message || "Unknown error"
        );
      }
    } catch (notifError) {
      console.error("Error creating failure notification:", notifError);
    }

    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getSubscriptions = async (req, reply) => {
  try {
    const data = await SubscriptionService.getSubscriptions({
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...data,
      message: "Subscriptions fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getSubscriptionById = async (req, reply) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await SubscriptionService.getSubscriptionById({
      subscriptionId,
    });

    return reply.send({
      success: true,
      subscription,
      message: "Subscription fetched successfully",
    });
  } catch (err) {
    return reply.code(404).send({
      success: false,
      message: err.message,
    });
  }
};

export const getMySubscription = async (req, reply) => {
  try {
    const userId = req.user.userId;

    const subscription = await SubscriptionService.getUserActiveSubscription({
      userId,
    });

    return reply.send({
      success: true,
      subscription,
      message: "Subscription fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const cancelMySubscription = async (req, reply) => {
  try {
    const userId = req.user.userId;

    const activeSubscription = await SubscriptionService.getUserActiveSubscription({
      userId,
    });

    if (!activeSubscription) {
      return reply.code(404).send({
        success: false,
        message: "No active subscription found",
      });
    }

    const subscription = await SubscriptionService.cancelSubscription({
      subscriptionId: activeSubscription._id,
    });

    return reply.send({
      success: true,
      subscription,
      message: "Subscription cancelled successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

