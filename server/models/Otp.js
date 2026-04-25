const mongoose =require('mongoose');
const mailSender =require('../utils/mailSender');
const otpTemplate =require('../mailTemplate/emailverificationtemplate');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60,
  },
});

otpSchema.index({ email: 1 });

async function sendVerificationEmail(email, otp) {
  await mailSender(
    email,
    "Verification Email",
    otpTemplate(otp)
  );
}

otpSchema.pre("save", async function () {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
});

module.exports = mongoose.model("Otp", otpSchema);