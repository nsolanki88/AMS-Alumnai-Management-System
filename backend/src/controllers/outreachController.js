const prisma = require('../config/prisma');
const AuditService = require('../services/auditService');

class OutreachController {
  /**
   * POST /api/outreach
   * Log outreach communication with an alumnus
   */
  static async logOutreach(req, res, next) {
    try {
      const { recordId, channel, status, notes, followUpDate } = req.body;

      if (!recordId || !channel || !status) {
        return res.status(400).json({
          success: false,
          message: 'Record ID, channel (email/phone/message), and status are required'
        });
      }

      const record = await prisma.alumniRecord.findUnique({
        where: { recordId }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Alumni record not found'
        });
      }

      const log = await prisma.outreachLog.create({
        data: {
          recordId,
          channel,
          status,
          notes: notes || '',
          loggedBy: req.user.id,
          followUpDate: followUpDate ? new Date(followUpDate) : null
        },
        include: {
          logger: { select: { fullName: true, email: true } }
        }
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'OUTREACH_LOGGED',
        entityType: 'ALUMNI_RECORD',
        entityId: recordId,
        metadata: { channel, status, alumnusName: record.fullName },
        ipAddress: req.ip
      });

      return res.status(201).json({
        success: true,
        message: 'Outreach activity logged successfully',
        data: log
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/outreach/:recordId
   * Fetch full outreach communication history for an alumnus
   */
  static async getHistoryForRecord(req, res, next) {
    try {
      const { recordId } = req.params;

      const history = await prisma.outreachLog.findMany({
        where: { recordId },
        include: {
          logger: { select: { fullName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/outreach
   * Get all outreach logs or find records requiring follow-up (> 90 days uncontacted/unverified)
   */
  static async getOutreachList(req, res, next) {
    try {
      const { filter = 'all', page = 1, limit = 20 } = req.query;

      if (filter === 'overdue') {
        // Records that are unregistered and haven't been contacted in 90 days (or never contacted)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

        const allUnregistered = await prisma.alumniRecord.findMany({
          where: { registrationStatus: 'unregistered' },
          include: {
            outreachLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
          }
        });

        const overdueRecords = allUnregistered.filter(record => {
          if (record.outreachLogs.length === 0) {
            // Created more than 90 days ago or never contacted
            return new Date(record.createdAt) < ninetyDaysAgo;
          }
          const lastContact = new Date(record.outreachLogs[0].createdAt);
          return lastContact < ninetyDaysAgo;
        });

        return res.status(200).json({
          success: true,
          data: {
            total: overdueRecords.length,
            records: overdueRecords
          }
        });
      }

      // Normal paginated list of recent outreach logs
      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const take = parseInt(limit, 10);

      const [total, logs] = await Promise.all([
        prisma.outreachLog.count(),
        prisma.outreachLog.findMany({
          include: {
            record: true,
            logger: { select: { fullName: true, email: true } }
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
          logs
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OutreachController;
