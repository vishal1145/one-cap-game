import * as AuthController from "./auth.controller.js";

const authRoutes = async (app) => {
  app.post("/auth/register", {
    preHandler: [],
    schema: {
      tags: ["Auth"],
      summary: "Register new user",
      body: {
        type: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          role: { type: "string", enum: ["user", "admin"], default: "user" },
        },
      },
    },
  }, AuthController.register);

  // app.post("/auth/login", AuthController.login);
  app.post("/auth/admin/login", {
    preHandler: [],
    schema: {
      tags: ["Auth"],
      summary: "Admin Login",
      body: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
          password: {
            type: "string",
          },
        },
      },
    },
  }, AuthController.adminLogin);

  app.post("/auth/send-otp", {
    preHandler: [],
    schema: {
      tags: ["Auth"],
      summary: "User Send OTP",
      body: {
        type: "object",
        required: ["phone"],
        properties: {
          phone: { type: "string" },
        },
      },
    },
  }, AuthController.sendOtp);

  app.post("/auth/verify-otp", {
    preHandler: [],
    schema: {
      tags: ["Auth"],
      summary: "User Verify OTP",
      body: {
        type: "object",
        required: ["phone", "code"],
        properties: {
          phone: { type: "string" },
          code: { type: "string" },
        },
      },
    },
  }, AuthController.verifyOtp);

  app.post("/auth/google", {
    preHandler: [],
    schema: {
      tags: ["Auth"],
      summary: "User Google Login/Signup",
      body: {
        type: "object",
        required: ["idToken"],
        properties: {
          idToken: { type: "string" },
        },
      },
    },
  }, AuthController.googleLogin);

  app.post("/auth/apple", {
    preHandler: [],
    schema: {
      tags: ["Auth"],
      summary: "User Apple Login/Signup",
      body: {
        type: "object",
        required: ["appleSub", "email"],
        properties: {
          appleSub: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
    },
  }, AuthController.appleLogin);
};

export default authRoutes;
