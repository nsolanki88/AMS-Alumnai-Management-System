const prisma = require('../config/prisma');

class AuditService {
  static async log({
    userId = null,
    actionType,
    entityType,
    entityId = null,
    metadata = null,
    ipAddress = null
  }) {
    try {
      const log = await prisma.auditLog.create({
        data: {
          userId,
          actionType,
          entityType,
          entityId: entityId ? String(entityId) : null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ipAddress
        }
      });
      return log;
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Non-blocking: audit failure should not break user operations
      return null;
    }
  }
}

module.exports = AuditService;
