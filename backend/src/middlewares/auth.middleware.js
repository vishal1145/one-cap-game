export const authMiddleware = async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.status(401).send({
        message: "Unauthorized",
      });
    }
  };
  