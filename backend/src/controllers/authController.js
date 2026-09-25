const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const config = require('../config');
const OtpService = require('../services/otpService');
const AuditService = require('../services/auditService');

class AuthController {
  /**
   * Helper to generate JWT access & refresh tokens
   */
  static generateTokens(user) {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: `${config.refreshTokenExpiryDays}d` }
    );

    return { accessToken, refreshToken };
  }

  /**
   * Register a new user
   */
  static async register(req, res, next) {
    try {
      const { fullName, email, password, phoneNumber, role, department } = req.body;

      if (!fullName || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Full name, email, and password are required'
        });
      }

      // Check if user already exists
      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userRole = ['STUDENT', 'ALUMNI', 'FACULTY', 'COUNCIL', 'ADMIN'].includes(role)
        ? role
        : 'STUDENT';

      const user = await prisma.user.create({
        data: {
          fullName,
          email: email.toLowerCase().trim(),
          passwordHash,
          phoneNumber: phoneNumber || null,
          role: userRole,
          department: department || null,
          isVerified: false // Needs OTP verification
        }
      });

      // Send OTP for email verification
      await OtpService.createAndSendOtp(user.email);

      await AuditService.log({
        userId: user.id,
        actionType: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: user.id,
        metadata: { email: user.email, role: user.role },
        ipAddress: req.ip
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully. Please verify the OTP sent to your email.',
        data: {
          userId: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email via OTP
   */
  static async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required'
        });
      }

      const isValid = await OtpService.verifyOtp(email.toLowerCase().trim(), otp.trim());
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP verification code'
        });
      }

      const user = await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: { isVerified: true }
      });

      // If Alumni, check if there is an official AlumniRecord to link
      if (user.role === 'ALUMNI') {
        const record = await prisma.alumniRecord.findFirst({
          where: { contactEmail: user.email }
        });
        if (record) {
          await prisma.alumniRecord.update({
            where: { recordId: record.recordId },
            data: { registrationStatus: 'registered' }
          });
        }
      }

      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + config.refreshTokenExpiryDays * 24 * 60 * 60 * 1000)
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Email successfully verified',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend OTP
   */
  static async resendOtp(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      await OtpService.createAndSendOtp(email.toLowerCase().trim());
      return res.status(200).json({
        success: true,
        message: 'A fresh OTP has been sent to your email.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login with lockout protection after 5 consecutive failed attempts
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { alumniProfile: true, mentorshipProfile: true }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Check account lockout
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const waitMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
        return res.status(403).json({
          success: false,
          message: `Account is locked due to multiple failed login attempts. Try again in ${waitMinutes} minute(s).`
        });
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);

      if (!passwordMatch) {
        const attempts = user.failedLoginAttempts + 1;
        let updateData = { failedLoginAttempts: attempts };

        if (attempts >= config.maxLoginAttempts) {
          updateData.lockedUntil = new Date(Date.now() + config.lockTimeMinutes * 60 * 1000);
          updateData.failedLoginAttempts = 0; // reset for after lock expires
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData
        });

        if (attempts >= config.maxLoginAttempts) {
          await AuditService.log({
            userId: user.id,
            actionType: 'ACCOUNT_LOCKED',
            entityType: 'USER',
            entityId: user.id,
            metadata: { reason: 'Exceeded max failed login attempts' },
            ipAddress: req.ip
          });
          return res.status(403).json({
            success: false,
            message: `Account has been locked for ${config.lockTimeMinutes} minutes due to 5 consecutive failed attempts.`
          });
        }

        return res.status(401).json({
          success: false,
          message: `Invalid email or password. Attempt ${attempts} of ${config.maxLoginAttempts}.`
        });
      }

      // Successful password: reset failed attempts
      if (user.failedLoginAttempts > 0 || user.lockedUntil) {
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0, lockedUntil: null }
        });
      }

      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      // Persist refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + config.refreshTokenExpiryDays * 24 * 60 * 60 * 1000)
        }
      });

      await AuditService.log({
        userId: user.id,
        actionType: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        metadata: { role: user.role },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            department: user.department,
            alumniProfile: user.alumniProfile,
            mentorshipProfile: user.mentorshipProfile
          },
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh JWT access token
   */
  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      let decoded;
      try {
        decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
      } catch (err) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken }
      });

      if (!storedToken || storedToken.isRevoked || new Date(storedToken.expiresAt) < new Date()) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has been revoked or expired'
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User associated with refresh token no longer exists'
        });
      }

      const tokens = AuthController.generateTokens(user);

      // Invalidate old refresh token and store new one (token rotation)
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true }
      });

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + config.refreshTokenExpiryDays * 24 * 60 * 60 * 1000)
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset token (expires in 30 minutes)
   */
  static async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + config.resetTokenExpiryMinutes * 60 * 1000);

        await prisma.passwordReset.create({
          data: {
            email: user.email,
            token,
            expiresAt
          }
        });

        console.log(`\n[PASSWORD RESET] Email: ${user.email} | Token: ${token}\n`);
      }

      // Always return 200 to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been dispatched.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password with reset token
   */
  static async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Reset token and new password are required'
        });
      }

      const resetRecord = await prisma.passwordReset.findFirst({
        where: {
          token,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token'
        });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email: resetRecord.email },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          lockedUntil: null
        }
      });

      await prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { isUsed: true }
      });

      return res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You may now log in.'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get currently authenticated user details
   */
  static async getMe(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          alumniProfile: true,
          mentorshipProfile: true
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isVerified: user.isVerified,
          department: user.department,
          alumniProfile: user.alumniProfile,
          mentorshipProfile: user.mentorshipProfile,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
