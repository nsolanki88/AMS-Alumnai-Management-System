const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/:id/read', NotificationController.markAsRead);
router.patch('/mark-all-read', NotificationController.markAllAsRead);

module.exports = router;
