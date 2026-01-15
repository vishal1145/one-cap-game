import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  phone: { type: String, index: true },
  code: String,
  expires_at: Date,
}, { timestamps: true });

export default mongoose.model("Otp", OtpSchema);