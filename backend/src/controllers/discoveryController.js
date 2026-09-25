const prisma = require('../config/prisma');
const AiGatewayService = require('../services/aiGatewayService');
const AuditService = require('../services/auditService');

class DiscoveryController {
  /**
   * POST /api/discovery/run
   * Council/Admin triggers AI Discovery for an unregistered alumni record
   */
  static async runDiscovery(req, res, next) {
    try {
      const { recordId } = req.body;

      if (!recordId) {
        return res.status(400).json({
          success: false,
          message: 'Alumni record ID is required'
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

      // Trigger AI discovery engine
      const discoveryResult = await AiGatewayService.discoverProfiles(record);
      const matches = discoveryResult.matches || [];

      // Save generated potential matches into database with status "pending"
      const createdMatches = [];
      for (const m of matches) {
        const potentialMatch = await prisma.potentialMatch.create({
          data: {
            recordId: record.recordId,
            name: m.name,
            platform: m.platform,
            profileUrl: m.profileUrl,
            confidenceScore: m.confidenceScore,
            reasons: JSON.stringify(m.reasons || []),
            matchingAttributes: JSON.stringify(m.matchingAttributes || {}),
            status: 'pending' // Mandatory: Never auto-verify!
          }
        });
        createdMatches.push(potentialMatch);
      }

      await AuditService.log({
        userId: req.user.id,
        actionType: 'AI_DISCOVERY_STARTED',
        entityType: 'ALUMNI_RECORD',
        entityId: record.recordId,
        metadata: {
          alumnusName: record.fullName,
          matchesFound: createdMatches.length,
          highestScore: createdMatches.length ? Math.max(...createdMatches.map(m => m.confidenceScore)) : 0
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `AI discovery completed. Found ${createdMatches.length} potential public profile matches. Council verification required.`,
        data: {
          record,
          matches: createdMatches.map(m => ({
            ...m,
            reasons: JSON.parse(m.reasons || '[]'),
            matchingAttributes: JSON.parse(m.matchingAttributes || '{}')
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/discovery/matches/:recordId
   */
  static async getMatchesForRecord(req, res, next) {
    try {
      const { recordId } = req.params;

      const matches = await prisma.potentialMatch.findMany({
        where: { recordId },
        orderBy: { confidenceScore: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: matches.map(m => ({
          ...m,
          reasons: JSON.parse(m.reasons || '[]'),
          matchingAttributes: JSON.parse(m.matchingAttributes || '{}')
        }))
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DiscoveryController;
