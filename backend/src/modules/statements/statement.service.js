import Statement from "./statement.model.js";

export const createStatement = async (userId, payload) => {
  // Create statement
  const statement = await Statement.create({
    ...payload,
    created_by: userId,
  });

  // Populate creator data before returning
//   const populatedStatement = await Statement.findById(statement._id)
//     .populate("created_by", "username email")
//     .lean();

  return statement;
};

export const getStatements = async ({ user, filters }) => {
  const {
    page = 1,
    limit = 20,
    search,
    status,
    type,
    difficulty,
    category,
    creator_id,
  } = filters;

  const query = {};

  // Apply filters
  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (category) {
    query.category = category;
  }

  if (creator_id) {
    query.created_by = creator_id;
  }

  // Build search conditions
  const searchConditions = [];
  if (search) {
    searchConditions.push({
      text: { $regex: search, $options: "i" },
    });
    searchConditions.push({
      category: { $regex: search, $options: "i" },
    });
  }

  // Combine all conditions
  const allConditions = [];
  if (Object.keys(query).length > 0) {
    allConditions.push(query);
  }
  if (searchConditions.length > 0) {
    allConditions.push({ $or: searchConditions });
  }

  const finalQuery = allConditions.length > 1 ? { $and: allConditions } : allConditions[0] || {};

  const skip = (page - 1) * limit;

  const [statements, total] = await Promise.all([
    Statement.find(finalQuery)
      .populate("created_by", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),

    Statement.countDocuments(finalQuery),
  ]);

  return {
    statements,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getStatementById = async ({ statementId, user }) => {
  const statement = await Statement.findById(statementId)
    .populate("created_by", "username email")
    .lean();

  if (!statement) {
    throw new Error("Statement not found");
  }

  return statement;
};

export const updateStatement = async ({ statementId, payload }) => {
  // Check if statement exists
  const statement = await Statement.findById(statementId);
  if (!statement) {
    throw new Error("Statement not found");
  }

  // Update statement
  const updatedStatement = await Statement.findByIdAndUpdate(
    statementId,
    {
      ...payload,
    },
    { new: true, runValidators: true }
  )
    // .populate("created_by", "username email")
    .lean();

  return updatedStatement;
};

export const deleteStatement = async ({ statementId }) => {
  // Check if statement exists
  const statement = await Statement.findById(statementId);
  if (!statement) {
    throw new Error("Statement not found");
  }

  // Delete statement
  await Statement.findByIdAndDelete(statementId);

  return { message: "Statement deleted successfully" };
};
