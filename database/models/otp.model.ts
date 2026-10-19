import { Schema, model, models } from "mongoose";

const OTPSchema = new Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }, // Automatically delete after expiry
  createdAt: { type: Date, default: Date.now },
});

const OTP = models?.OTP || model("OTP", OTPSchema);

export default OTP;
