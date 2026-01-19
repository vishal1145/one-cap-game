// USER
export const USER_ROLES = {
    USER: "user",
    ADMIN: "admin",
};

export const USER_STATUS = {
    ACTIVE: "active",
    BANNED: "banned",
    SHADOW_BANNED: "shadow_banned",
};

// CHAIN
export const CHAIN_VISIBILITY = {
    PRIVATE: "private",
    FRIENDS: "friends",
    PUBLIC: "public",
};

export const CHAIN_STATUS = {
    ACTIVE: "active",
    EXPIRED: "expired",
    MUTED: "muted",
};

// CHALLENGE
export const CHALLENGE_VISIBILITY = {
    DIRECT: "direct",
    STORY: "story",
};

export const CHALLENGE_STATUS = {
    ACTIVE: "active",
    REPORTED: "reported",
    REMOVED: "removed",
    DRAFT: "draft",
    MUTED: "muted",
};

// SUBSCRIPTION
export const SUBSCRIPTION_PLAN = {
    FREE: "free",
    PRO: "pro",
    TRIAL: "trial",
};

export const SUBSCRIPTION_PLAN_TYPE = {
    MONTHLY: "monthly",
    YEARLY: "yearly",
};

export const SUBSCRIPTION_STATUS = {
    ACTIVE: "active",
    CANCELLED: "cancelled",
    EXPIRED: "expired",
};

export const PAYMENT_PROVIDER = {
    PLAYSTORE: "playstore",
    APPSTORE: "appstore",
    STRIPE: "stripe",
};

// ADMIN / MODERATION
export const REPORT_REASON = {
    INAPPROPRIATE: "inappropriate",
    SPAM: "spam",
    HARASSMENT: "harassment",
    MISINFORMATION: "misinformation",
};

export const REPORT_STATUS = {
    PENDING: "pending",
    REVIEWED: "reviewed",
    ACTIONED: "actioned",
};

export const REPORT_ACTION = {
    BAN: "ban",
    MUTE: "mute",
    DELETE: "delete",
    WARNING: "warning",
    IGNORE: "ignore",
};

export const REPORT_TARGET_TYPE = {
    USER: "user",
    CHAIN: "chain",
    CHALLENGE: "challenge",
};

// STATEMENT
export const STATEMENT_TYPE = {
    TRUTH: "truth",
    CAP: "cap",
};

export const STATEMENT_DIFFICULTY = {
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
};

export const STATEMENT_STATUS = {
    LIVE: "live",
    DRAFT: "draft",
    RETIRED: "retired",
};

// NOTIFICATION
export const NOTIFICATION_TYPE = {
    SUCCESS: "success",
    WARNING: "warning",
    INFO: "info",
    ERROR: "error",
};

export const NOTIFICATION_CATEGORY = {
    SYSTEM: "system",
    USER: "user",
    MODERATION: "moderation",
    ANALYTICS: "analytics",
};

// GAME
export const GAME_STATUS = {
    DRAFT: "draft",
    LIVE: "live",
    ENDED: "ended",
};