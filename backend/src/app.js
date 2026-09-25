const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const alumniRecordRoutes = require('./routes/alumniRecordRoutes');
const discoveryRoutes = require('./routes/discoveryRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const outreachRoutes = require('./routes/outreachRoutes');
const directoryRoutes = require('./routes/directoryRoutes');
const batchGroupRoutes = require('./routes/batchGroupRoutes');
const referralRoutes = require('./routes/referralRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const doubtRoutes = require('./routes/doubtRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const profileRoutes = require('./routes/profileRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Security & Parsing Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: '*', // Allow development frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general API rate limiting
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AMS+ Backend API is operational',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/alumni-records', alumniRecordRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/matches', verificationRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/outreach', outreachRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/batch-groups', batchGroupRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
