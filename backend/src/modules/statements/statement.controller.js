import * as StatementService from "./statement.service.js";

export const createStatement = async (req, reply) => {
  try {
    const userId = req.user.userId;
    const statement = await StatementService.createStatement(userId, req.body);

    return reply.send({
      success: true,
      statement,
      message: "Statement created successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getAllStatements = async (req, reply) => {
  try {
    const statements = await StatementService.getStatements({
      user: req.user,
      filters: req.query,
    });

    return reply.send({
      success: true,
      ...statements,
      message: "Statements fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getMyStatements = async (req, reply) => {
  try {
    const statements = await StatementService.getStatements({
      user: req.user,
      filters: { ...req.query, creator_id: req.user.userId },
    });

    return reply.send({
      success: true,
      ...statements,
      message: "My statements fetched successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const getStatementById = async (req, reply) => {
  try {
    const statement = await StatementService.getStatementById({
      statementId: req.params.id,
      user: req.user,
    });

    return reply.send({
      success: true,
      statement,
      message: "Statement fetched successfully",
    });
  } catch (err) {
    return reply.code(403).send({
      success: false,
      message: err.message,
    });
  }
};

export const updateStatement = async (req, reply) => {
  try {
    const statement = await StatementService.updateStatement({
      statementId: req.params.id,
      payload: req.body,
    });

    return reply.send({
      success: true,
      statement,
      message: "Statement updated successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};

export const deleteStatement = async (req, reply) => {
  try {
    const result = await StatementService.deleteStatement({
      statementId: req.params.id,
    });

    return reply.send({
      success: true,
      message: result.message || "Statement deleted successfully",
    });
  } catch (err) {
    return reply.code(400).send({
      success: false,
      message: err.message,
    });
  }
};
