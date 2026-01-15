import { USER_STATUS } from "../constants/enums.js";

export const userStatusCheck = async (req, reply) => {
    const status = req.user.status;
  
    if (status === USER_STATUS.BANNED) {
      return reply.status(403).send({
        message: "Your account is banned",
      });
    }
  
    // shadow_banned → allow but silently ignore later
  };
  