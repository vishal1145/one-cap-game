import Subscription from "./subscription.model.js";
import User from "../users/user.model.js";
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_PLAN } from "../../constants/enums.js";
import { notifySubscriptionCreated } from "../../utils/notifications.js";

export const createSubscription = async ({ userId, plan, paymentProvider }) => {
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Calculate started_at and expires_at automatically based on plan type
  const startDate = new Date();
  const endDate = new Date(startDate);

  if (plan === "monthly") {
    endDate.setDate(endDate.getDate() + 30); // 30 days from start
  } else if (plan === "yearly") {
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year from start
  } else {
    throw new Error("Invalid plan type. Must be 'monthly' or 'yearly'");
  }

  // Cancel any existing active subscriptions for this user
  await Subscription.updateMany(
    {
      user_id: userId,
      status: SUBSCRIPTION_STATUS.ACTIVE,
    },
    {
      $set: {
        status: SUBSCRIPTION_STATUS.CANCELLED,
      },
    }
  );

  // Create new subscription
  const subscription = await Subscription.create({
    user_id: userId,
    plan,
    payment_provider: paymentProvider,
    started_at: startDate,
    expires_at: endDate,
    status: SUBSCRIPTION_STATUS.ACTIVE,
  });

  // Update user's subscription reference
  await User.findByIdAndUpdate(userId, {
    subscription: subscription._id,
    subscription_type: SUBSCRIPTION_PLAN.PRO,
  });

  // Create notification for subscription creation
  await notifySubscriptionCreated(
    subscription._id.toString(),
    userId,
    user.username || "User",
    plan,
    paymentProvider
  );

  return await Subscription.findById(subscription._id)
    .populate("user_id", "username email")
    .lean();
};

export const getSubscriptions = async ({ filters }) => {
  const { page = 1, limit = 20, status, plan, payment_provider, user_id, search } = filters;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (plan) {
    query.plan = plan;
  }

  if (payment_provider) {
    query.payment_provider = payment_provider;
  }

  if (user_id) {
    query.user_id = user_id;
  }

  const skip = (page - 1) * limit;

  let subscriptions = await Subscription.find(query)
    .populate("user_id", "username email avatar_url")
    .sort({ createdAt: -1 })
    .lean();

  // Apply search filter after population if search is provided
  if (search) {
    subscriptions = subscriptions.filter((sub) => {
      const user = sub.user_id;
      if (!user) return false;
      const username = user.username || "";
      const email = user.email || "";
      return (
        username.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }

  const total = subscriptions.length;
  subscriptions = subscriptions.slice(skip, skip + Number(limit));

  return {
    subscriptions,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSubscriptionById = async ({ subscriptionId }) => {
  const subscription = await Subscription.findById(subscriptionId)
    .populate("user_id", "username email avatar_url")
    .lean();

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  return subscription;
};

export const getUserActiveSubscription = async ({ userId }) => {
  const subscription = await Subscription.findOne({
    user_id: userId,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    expires_at: { $gt: new Date() },
  })
    .populate("user_id", "username email avatar_url")
    .lean();

  return subscription;
};

export const cancelSubscription = async ({ subscriptionId }) => {
  const subscription = await Subscription.findById(subscriptionId);

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  if (subscription.status === SUBSCRIPTION_STATUS.CANCELLED) {
    throw new Error("Subscription is already cancelled");
  }

  const updatedSubscription = await Subscription.findByIdAndUpdate(
    subscriptionId,
    {
      $set: {
        status: SUBSCRIPTION_STATUS.CANCELLED,
      },
    },
    { new: true }
  )
    .populate("user_id", "username email avatar_url")
    .lean();

  // Update user's subscription_type
  await User.findByIdAndUpdate(subscription.user_id, {
    subscription_type: SUBSCRIPTION_PLAN.FREE,
    subscription: null,
  });

  return updatedSubscription;
};

