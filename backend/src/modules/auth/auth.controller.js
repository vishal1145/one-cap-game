import * as AuthService from "./auth.service.js";

export const register = async (req, reply) => {
  try {
    const { user, token } = await AuthService.registerUser(req.body);
    reply.send({ success: true, user, token, message: "User registered successfully" });
  } catch (err) {
    reply.code(400).send({ success: false, message: err.message });
  }
};

// export const login = async (req, reply) => {
//   try {
//     const { user, token } = await AuthService.loginUser(req.body);
//     reply.send({ success: true, user, token, message: "Login successful" });
//   } catch (err) {
//     reply.code(401).send({ success: false, message: err.message });
//   }
// };

export const adminLogin = async (req, reply) => {
  try {
    const { user, token } = await AuthService.adminLogin(req.body);
    reply.send({ success: true, user, token, message: "Admin login successful" });
  } catch (err) {
    reply.code(401).send({ success: false, message: err.message });
  }
};

export const googleLogin = async (req, reply) => {
  try {
    const { user, token } = await AuthService.googleLogin(req.body);
    reply.send({ success: true, user, token, message: "Google login successful" });
  } catch (err) {
    reply.code(401).send({ success: false, message: err.message });
  }
};

export const appleLogin = async (req, reply) => {
  try {
    const { user, token } = await AuthService.appleLogin(req.body);
    reply.send({ success: true, user, token, message: "Apple login successful" });
  } catch (err) {
    reply.code(401).send({ success: false, message: err.message });
  }
};

export const sendOtp = async (req, reply) => {
    try {
        await AuthService.sendOtp(req.body);
        reply.send({ success: true, message: "OTP sent successfully" });
    } catch (err) {
        reply.code(401).send({ success: false, message: err.message });
    }
};

export const verifyOtp = async (req, reply) => {
    try {
        const { user, token } = await AuthService.verifyOtp(req.body);
        reply.send({ success: true, user, token, message: "OTP verified successfully" });
    } catch (err) {
        reply.code(401).send({ success: false, message: err.message });
    }
};