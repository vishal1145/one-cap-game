// import User from "./../users/user.model.js";
// import { generateToken } from "../../utils/token.js";

// export const appleLogin = async (req, reply) => {
//   const { appleSub, email } = req.body;

//   let user = await User.findOne({
//     auth_provider: "apple",
//     auth_provider_id: appleSub,
//   });

//   if (!user) {
//     user = await User.create({
//       email,
//       auth_provider: "apple",
//       auth_provider_id: appleSub,
//       username: `apple_${appleSub.slice(0, 6)}`,
//     });
//   }

//   user.last_login_at = new Date();
//   await user.save();

//   const token = generateToken({ userId: user._id, role: user.role });

//   return reply.send({ user, token });
// };