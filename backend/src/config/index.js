require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'ams_plus_jwt_secret_dev_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'ams_plus_refresh_secret_dev_2026',
  jwtExpiry: process.env.JWT_EXPIRY || '8h',
  refreshTokenExpiryDays: parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS, 10) || 30,
  resetTokenExpiryMinutes: parseInt(process.env.RESET_TOKEN_EXPIRY_MINUTES, 10) || 30,
  maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS, 10) || 5,
  lockTimeMinutes: parseInt(process.env.LOCK_TIME_MINUTES, 10) || 15,
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromEmail: process.env.FROM_EMAIL || 'no-reply@amsplus.edu'
  }
};
