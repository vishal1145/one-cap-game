import Chain from "./chain.model.js";
import User from "../users/user.model.js";

export const createChain = async (userId, payload) => {
  const chain = await Chain.create({
    ...payload,
    starter_id: userId,
  });

  await User.findByIdAndUpdate(userId, { $push: { chains: chain._id } });
  return chain;
};

export const getChains = async ({ user, filters }) => {
  const {
    page = 1,
    limit = 20,
    search,
    visibility,
  } = filters;

  const query = {};

  // user ke liye sirf uski chains
  if (user.role !== "admin") {
    query.starter_id = user.userId;
    query.visibility = { $ne: "private" };
  }

  if (visibility) {
    query.visibility = visibility;
  }

  if (search) {
    query.title = {
      $regex: search,
      $options: "i", // case-insensitive
    };
  }

  const skip = (page - 1) * limit;

  const [chains, total] = await Promise.all([
    Chain.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Chain.countDocuments(query),
  ]);

  return {
    chains,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getChainById = async ({ chainId, user }) => {
  const chain = await Chain.findById(chainId).lean();
  if (!chain) throw new Error("Chain not found");

  // user access control
  if (
    user.role !== "admin" &&
    chain.starter_id.toString() !== user.userId
  ) {
    throw new Error("Unauthorized");
  }

  return chain;
};