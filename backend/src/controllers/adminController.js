const prisma = require('../config/prisma');
const AuditService = require('../services/auditService');

class AdminController {
  /**
   * GET /api/admin/users
   * List all platform users with role, status, verification
   */
  static async getUsers(req, res, next) {
    try {
      const { role, search, page = 1, limit = 20 } = req.query;

      const where = {};
      if (role && role !== 'ALL') {
        where.role = role;
      }
      if (search) {
        where.OR = [
          { fullName: { contains: search } },
          { email: { contains: search } }
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const take = parseInt(limit, 10);

      const [total, users] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({
          where,
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
            role: true,
            isVerified: true,
            lockedUntil: true,
            failedLoginAttempts: true,
            department: true,
            createdAt: true,
            alumniProfile: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
          users: users.map(u => ({
            ...u,
            isLocked: Boolean(u.lockedUntil && new Date(u.lockedUntil) > new Date())
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id/role
   * Assign/change user role
   */
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const allowedRoles = ['STUDENT', 'ALUMNI', 'FACULTY', 'COUNCIL', 'ADMIN'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}`
        });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role }
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'ROLE_CHANGED',
        entityType: 'USER',
        entityId: id,
        metadata: { oldRole: user.role, newRole: role, targetUser: user.fullName },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `User ${user.fullName} role updated to ${role}`,
        data: { id: updated.id, role: updated.role }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/users/:id/lock
   * Lock or unlock user account
   */
  static async toggleUserLock(req, res, next) {
    try {
      const { id } = req.params;
      const { lock, lockMinutes = 60 } = req.body;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      let updateData = {};
      if (lock) {
        updateData.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      } else {
        updateData.lockedUntil = null;
        updateData.failedLoginAttempts = 0;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: lock ? 'ACCOUNT_MANUALLY_LOCKED' : 'ACCOUNT_UNLOCKED',
        entityType: 'USER',
        entityId: id,
        metadata: { targetUser: user.fullName },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `Account has been ${lock ? 'locked' : 'unlocked'}.`,
        data: { id: updated.id, lockedUntil: updated.lockedUntil }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/audit-log
   * Filterable audit trail
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { actionType, entityType, search, page = 1, limit = 25 } = req.query;

      const where = {};
      if (actionType && actionType !== 'ALL') {
        where.actionType = actionType;
      }
      if (entityType && entityType !== 'ALL') {
        where.entityType = entityType;
      }
      if (search) {
        where.OR = [
          { actionType: { contains: search } },
          { user: { fullName: { contains: search } } },
          { user: { email: { contains: search } } },
          { metadata: { contains: search } }
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const take = parseInt(limit, 10);

      const [total, logs] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { id: true, fullName: true, email: true, role: true } }
          },
          orderBy: { timestamp: 'desc' },
          skip,
          take
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
          logs: logs.map(l => ({
            ...l,
            metadata: l.metadata ? JSON.parse(l.metadata) : null
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
