const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../config/prisma');

const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token is required',
        data: null
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Access token expired. Please refresh token or log in again.',
          data: null
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        data: null
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        alumniProfile: true,
        mentorshipProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found',
        data: null
      });
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const waitMinutes = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked. Try again in ${waitMinutes} minute(s).`,
        data: null
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      data: null
    });
  }
};

module.exports = { authenticateJWT };
