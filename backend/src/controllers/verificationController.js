const prisma = require('../config/prisma');
const AuditService = require('../services/auditService');
const NotificationService = require('../services/notificationService');

class VerificationController {
  /**
   * GET /api/verification/dashboard
   * Returns verification candidates grouped or filtered by status
   */
  static async getDashboard(req, res, next) {
    try {
      const { status = 'pending', search, page = 1, limit = 15 } = req.query;

      // Status counts for tabs
      const [pendingCount, verifiedCount, rejectedCount, uncertainCount] = await Promise.all([
        prisma.potentialMatch.count({ where: { status: 'pending' } }),
        prisma.potentialMatch.count({ where: { status: 'verified' } }),
        prisma.potentialMatch.count({ where: { status: 'rejected' } }),
        prisma.potentialMatch.count({ where: { status: 'uncertain' } })
      ]);

      const where = {};
      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { record: { fullName: { contains: search } } },
          { record: { rollNumber: { contains: search } } }
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const take = parseInt(limit, 10);

      const [total, matches] = await Promise.all([
        prisma.potentialMatch.count({ where }),
        prisma.potentialMatch.findMany({
          where,
          include: {
            record: {
              include: { outreachLogs: { take: 1, orderBy: { createdAt: 'desc' } } }
            }
          },
          orderBy: { confidenceScore: 'desc' },
          skip,
          take
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          counts: {
            pending: pendingCount,
            verified: verifiedCount,
            rejected: rejectedCount,
            uncertain: uncertainCount,
            total: pendingCount + verifiedCount + rejectedCount + uncertainCount
          },
          pagination: {
            total,
            page: parseInt(page, 10),
            limit: take,
            totalPages: Math.ceil(total / take)
          },
          matches: matches.map(m => ({
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
   * PATCH /api/matches/:id/verify
   * Council marks potential match as VERIFIED
   */
  static async verifyMatch(req, res, next) {
    try {
      const { id } = req.params;

      const match = await prisma.potentialMatch.findUnique({
        where: { id },
        include: { record: true }
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Potential match not found'
        });
      }

      // 1. Update match record to VERIFIED
      const updatedMatch = await prisma.potentialMatch.update({
        where: { id },
        data: {
          status: 'verified',
          reviewedBy: req.user.fullName,
          reviewedAt: new Date()
        }
      });

      // 2. Link discovered profile & update AlumniRecord to verified
      await prisma.alumniRecord.update({
        where: { recordId: match.recordId },
        data: {
          registrationStatus: 'verified',
          company: match.record.company || 'Verified Professional',
          jobRole: match.record.jobRole || 'Alumnus'
        }
      });

      // 3. Auto-create Batch Group if first alumnus of this graduation year is verified
      const gradYear = match.record.graduationYear;
      let batchGroup = await prisma.batchGroup.findUnique({
        where: { graduationYear: gradYear }
      });

      if (!batchGroup) {
        batchGroup = await prisma.batchGroup.create({
          data: {
            graduationYear: gradYear,
            name: `Batch ${gradYear}`,
            description: `Official batch community and network for graduates of Class of ${gradYear}.`
          }
        });

        // Add an initial welcome announcement post
        await prisma.groupPost.create({
          data: {
            groupId: batchGroup.id,
            authorId: req.user.id,
            title: `Welcome to the Batch ${gradYear} Official Community!`,
            content: `The official Batch ${gradYear} group has been activated following alumni verification. Connect with your peers, share opportunities, and organize meetups!`,
            postType: 'announcement'
          }
        });
      }

      // 4. Activate or link User account if user already registered with matching contact email
      let activatedUser = null;
      if (match.record.contactEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: match.record.contactEmail.toLowerCase().trim() },
          include: { alumniProfile: true }
        });

        if (existingUser) {
          activatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: { isVerified: true, role: 'ALUMNI' }
          });

          // Ensure AlumniProfile exists
          if (!existingUser.alumniProfile) {
            await prisma.alumniProfile.create({
              data: {
                userId: existingUser.id,
                graduationYear: match.record.graduationYear,
                branch: match.record.branch,
                rollNumber: match.record.rollNumber,
                currentCompany: match.record.company,
                currentRole: match.record.jobRole,
                cityCountry: match.record.cityCountry,
                linkedinUrl: match.profileUrl,
                visibility: 'PUBLIC'
              }
            });
          }

          // Send activation notification
          await NotificationService.notify({
            userId: existingUser.id,
            title: 'Official Alumni Verification Complete',
            message: `Congratulations! Your alumni identity has been verified by the Council for Class of ${gradYear} (${match.record.branch}). You have been added to the Batch ${gradYear} community.`,
            type: 'verification',
            email: existingUser.email,
            sendEmail: true
          });
        }
      }

      // 5. Create Audit Log
      await AuditService.log({
        userId: req.user.id,
        actionType: 'MATCH_VERIFIED',
        entityType: 'POTENTIAL_MATCH',
        entityId: match.id,
        metadata: {
          alumnusName: match.record.fullName,
          rollNumber: match.record.rollNumber,
          graduationYear: gradYear,
          profileUrl: match.profileUrl,
          confidenceScore: match.confidenceScore,
          verifiedBy: req.user.fullName
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `Match successfully verified. Record linked and Batch ${gradYear} community updated.`,
        data: {
          match: updatedMatch,
          batchGroup,
          activatedUser: activatedUser ? { id: activatedUser.id, email: activatedUser.email } : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/matches/:id/reject
   * Council marks potential match as REJECTED with reason
   */
  static async rejectMatch(req, res, next) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const match = await prisma.potentialMatch.findUnique({
        where: { id },
        include: { record: true }
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Potential match not found'
        });
      }

      const updatedMatch = await prisma.potentialMatch.update({
        where: { id },
        data: {
          status: 'rejected',
          rejectionReason,
          reviewedBy: req.user.fullName,
          reviewedAt: new Date()
        }
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'MATCH_REJECTED',
        entityType: 'POTENTIAL_MATCH',
        entityId: match.id,
        metadata: {
          alumnusName: match.record.fullName,
          rejectionReason,
          rejectedBy: req.user.fullName
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: 'Match marked as rejected with reason recorded',
        data: updatedMatch
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/matches/:id/uncertain
   * Council marks potential match as UNCERTAIN
   */
  static async markUncertain(req, res, next) {
    try {
      const { id } = req.params;

      const match = await prisma.potentialMatch.findUnique({
        where: { id },
        include: { record: true }
      });

      if (!match) {
        return res.status(404).json({
          success: false,
          message: 'Potential match not found'
        });
      }

      const updatedMatch = await prisma.potentialMatch.update({
        where: { id },
        data: {
          status: 'uncertain',
          reviewedBy: req.user.fullName,
          reviewedAt: new Date()
        }
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'MATCH_MARKED_UNCERTAIN',
        entityType: 'POTENTIAL_MATCH',
        entityId: match.id,
        metadata: {
          alumnusName: match.record.fullName,
          reviewedBy: req.user.fullName
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: 'Match flagged as uncertain for future council investigation',
        data: updatedMatch
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VerificationController;
