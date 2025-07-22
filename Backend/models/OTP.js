const mongoose = require("mongoose");
const mailSender =require("../utils/MailSender");
const emailTemplate = require("../Template/EmailVerification");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

async function sendVerificationMail(email, otp) {
  try {
    console.log("Sending verification mail to:", email, "with OTP:", otp);
    await mailSender(email, "Verification Email", emailTemplate(otp));
    console.log("Mail sent!");
  } catch (error) {
    console.log("Mail sending error:", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  try {
    await sendVerificationMail(this.email, this.otp);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("OTP", OTPSchema);
