const prisma = require('../config/prisma');

class NotificationController {
  /**
   * GET /api/notifications
   */
  static async getNotifications(req, res, next) {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return res.status(200).json({
        success: true,
        data: notifications.map(n => ({
          ...n,
          metadata: n.metadata ? JSON.parse(n.metadata) : null
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/unread-count
   */
  static async getUnreadCount(req, res, next) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false
        }
      });

      return res.status(200).json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  static async markAsRead(req, res, next) {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.findUnique({ where: { id } });
      if (!notification || notification.userId !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      const updated = await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });

      return res.status(200).json({
        success: true,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/mark-all-read
   */
  static async markAllAsRead(req, res, next) {
    try {
      await prisma.notification.updateMany({
        where: { userId: req.user.id, isRead: false },
        data: { isRead: true }
      });

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
