import { USER_ROLES } from "../constants/enums.js";

export const adminOnly = async (req, reply) => {
    if (req.user?.role !== USER_ROLES.ADMIN) {
      return reply.status(403).send({
        message: "Admin access required",
      });
    }
  };
  