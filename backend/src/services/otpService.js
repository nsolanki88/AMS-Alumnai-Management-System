const prisma = require('../config/prisma');
const NotificationService = require('./notificationService');

class OtpService {
  static generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async createAndSendOtp(email) {
    // Invalidate previous unexpired OTPs
    await prisma.otpVerification.updateMany({
      where: { email, isUsed: false },
      data: { isUsed: true }
    });

    const otp = this.generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await prisma.otpVerification.create({
      data: {
        email,
        otp,
        expiresAt
      }
    });

    // Send email / log
    console.log(`\n========================================`);
    console.log(`[OTP VERIFICATION] Email: ${email} | Code: ${otp}`);
    console.log(`========================================\n`);

    const transporter = NotificationService.getTransporter();
    await transporter.sendMail({
      from: `"AMS+ Security" <no-reply@amsplus.edu>`,
      to: email,
      subject: 'Your AMS+ Verification Code',
      text: `Your OTP verification code is: ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; text-align: center;">
          <h2 style="color: #1e3a8a;">AMS+ Account Verification</h2>
          <p>Please enter the 6-digit verification code below to verify your account:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #2563eb; padding: 15px; background: #eff6ff; border-radius: 8px; display: inline-block; margin: 15px 0;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 13px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
        </div>
      `
    });

    return otp;
  }

  static async verifyOtp(email, otp) {
    const record = await prisma.otpVerification.findFirst({
      where: {
        email,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      return false;
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { isUsed: true }
    });

    return true;
  }
}

module.exports = OtpService;
