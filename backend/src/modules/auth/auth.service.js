import User from "../users/user.model.js";
import { comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/token.js";
import { USER_ROLES } from "../../constants/enums.js";
import { verifyGoogleToken } from "../../utils/google.js";
import { hashPassword } from "../../utils/password.js";
import Otp from "./otp.model.js";
import { notifyUserRegistration } from "../../utils/notifications.js";

export const registerUser = async ({ username, email, password, role }) => {
    const existing = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existing) {
        if (existing.email === email) {
            throw new Error("Email already in use");
        }
        if (existing.username === username) {
            throw new Error("Username already taken");
        }
    }

    try {

        const password_hash = await hashPassword(password);

        const user = await User.create({
            username,
            email,
            password_hash,
            role,
            auth_provider: "phone"
        });

        const token = generateToken({
            userId: user._id,
            role: user.role,
        });

        // Create notification for new user registration
        await notifyUserRegistration(user._id.toString(), user.username);

        return { user, token };
    } catch (err) {
        if (err.code === 11000) {
            if (err.keyPattern?.email) {
                throw new Error("Email already in use");
            }
            if (err.keyPattern?.username) {
                throw new Error("Username already taken");
            }
        }
        throw err;
    }
};

// export const loginUser = async ({ email, password }) => {
//     const user = await User.findOne({ email, role: USER_ROLES.USER });
//     if (!user) {
//         throw new Error("Invalid credentials");
//     }

//     if (user.status !== USER_STATUS.ACTIVE) {
//         throw new Error("Account is not active");
//     }

//     const isMatch = await comparePassword(password, user.password_hash);
//     if (!isMatch) {
//         throw new Error("Invalid credentials");
//     }

//     const token = generateToken({
//         userId: user._id,
//         role: user.role,
//     });

//     user.last_login_at = new Date();
//     await user.save();

//     return { user, token };
// };

export const adminLogin = async ({ email, password }) => {
    const user = await User.findOne({ email, role: USER_ROLES.ADMIN });
    if (!user) {
        throw new Error("Admin not found");
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    const token = generateToken({
        userId: user._id,
        role: USER_ROLES.ADMIN,
    });

    return { user, token };
};

export const googleLogin = async ({ idToken }) => {
    const googleUser = await verifyGoogleToken(idToken);

    let user = await User.findOne({
        auth_provider: "google",
        auth_provider_id: googleUser.sub,
    });

    if (!user) {
        user = await User.create({
            email: googleUser.email,
            username: googleUser.email.split("@")[0],
            avatar_url: googleUser.picture,
            auth_provider: "google",
            auth_provider_id: googleUser.sub,
        });

        // Create notification for new user registration
        await notifyUserRegistration(user._id.toString(), user.username);
    }

    user.last_login_at = new Date();
    await user.save();

    const token = generateToken({ userId: user._id, role: user.role });

    return { user, token };
};

export const appleLogin = async ({ appleSub, email }) => {
    let user = await User.findOne({
        auth_provider: "apple",
        auth_provider_id: appleSub,
    });

    if (!user) {
        user = await User.create({
            email,
            auth_provider: "apple",
            auth_provider_id: appleSub,
            username: `apple_${appleSub.slice(0, 6)}`,
            avatar_url: `${process.env.BASE_URL}/public/avatars/default-avatar.png`,
        });

        // Create notification for new user registration
        await notifyUserRegistration(user._id.toString(), user.username);
    }

    user.last_login_at = new Date();
    await user.save();

    const token = generateToken({ userId: user._id, role: user.role });

    return { user, token };
};

export const sendOtp = async ({ phone }) => {
    const code = "123456";//Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ phone });

    await Otp.create({
        phone,
        code,
        expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    // TODO: integrate SMS provider
    console.log("OTP:", code);

    return true;
};

export const verifyOtp = async ({ phone, code }) => {
    const otp = await Otp.findOne({ phone, code });

    if (!otp || otp.expires_at < new Date()) {
        throw new Error("Invalid or expired OTP");
    }

    let user = await User.findOne({ phone });

    if (!user) {
        user = await User.create({
            phone,
            auth_provider: "phone",
            username: `user_${phone.slice(-4)}`,
            avatar_url: `${process.env.BASE_URL}/public/avatars/default-avatar.png`,
        });

        // Create notification for new user registration
        await notifyUserRegistration(user._id.toString(), user.username);
    }

    user.last_login_at = new Date();
    await user.save();

    await Otp.deleteMany({ phone });

    const token = generateToken({ userId: user._id, role: user.role });

    return { user, token };
};
