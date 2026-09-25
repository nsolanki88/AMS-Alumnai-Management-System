const prisma = require('../config/prisma');
const AuditService = require('../services/auditService');
const NotificationService = require('../services/notificationService');

class ReferralController {
  /**
   * POST /api/referrals
   * Alumni submits a referral for another alumnus
   */
  static async createReferral(req, res, next) {
    try {
      const {
        referredName,
        referredEmail,
        graduationYear,
        branch,
        company,
        jobRole,
        linkedinUrl,
        notes
      } = req.body;

      if (!referredName || !referredEmail || !graduationYear || !branch) {
        return res.status(400).json({
          success: false,
          message: 'Referred Name, Email, Graduation Year, and Branch are required'
        });
      }

      // Check if user is verified alumni
      if (req.user.role !== 'ALUMNI') {
        return res.status(403).json({
          success: false,
          message: 'Only verified Alumni can submit alumni referrals'
        });
      }

      const referral = await prisma.referralConnection.create({
        data: {
          referrerAlumniId: req.user.id,
          referredName,
          referredEmail: referredEmail.toLowerCase().trim(),
          graduationYear: parseInt(graduationYear, 10),
          branch,
          company,
          jobRole,
          linkedinUrl,
          notes,
          status: 'pending' // Mandatory: Referral must pass Council verification
        },
        include: {
          referrer: { select: { id: true, fullName: true, email: true } }
        }
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'REFERRAL_SUBMITTED',
        entityType: 'REFERRAL',
        entityId: referral.id,
        metadata: {
          referrerName: req.user.fullName,
          referredName,
          referredEmail
        },
        ipAddress: req.ip
      });

      return res.status(201).json({
        success: true,
        message: 'Alumni referral submitted successfully. Pending Council verification.',
        data: referral
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/referrals
   * List referrals. Council/Admin sees all; Alumni sees their own submissions.
   */
  static async getReferrals(req, res, next) {
    try {
      const isPrivileged = ['COUNCIL', 'ADMIN'].includes(req.user.role);
      const where = isPrivileged ? {} : { referrerAlumniId: req.user.id };

      const referrals = await prisma.referralConnection.findMany({
        where,
        include: {
          referrer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              alumniProfile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Build chain data if applicable (A -> B -> C)
      const referralsWithChain = referrals.map(ref => {
        return {
          ...ref,
          referralChain: [
            { name: ref.referrer.fullName, role: 'Referrer' },
            { name: ref.referredName, role: 'Referred Candidate', status: ref.status }
          ]
        };
      });

      return res.status(200).json({
        success: true,
        data: referralsWithChain
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/referrals/:id/verify
   * Council verifies or rejects the referral
   */
  static async verifyReferral(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body; // 'verified' or 'rejected'

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "verified" or "rejected"'
        });
      }

      const referral = await prisma.referralConnection.findUnique({
        where: { id },
        include: { referrer: true }
      });

      if (!referral) {
        return res.status(404).json({ success: false, message: 'Referral record not found' });
      }

      const updated = await prisma.referralConnection.update({
        where: { id },
        data: {
          status,
          notes: notes || referral.notes,
          reviewedBy: req.user.fullName
        }
      });

      // If verified, also create or update official AlumniRecord if not existing
      if (status === 'verified') {
        const existingRecord = await prisma.alumniRecord.findFirst({
          where: { contactEmail: referral.referredEmail }
        });

        if (!existingRecord) {
          await prisma.alumniRecord.create({
            data: {
              source: `REFERRAL_BY_${referral.referrer.fullName}`,
              fullName: referral.referredName,
              graduationYear: referral.graduationYear,
              branch: referral.branch,
              rollNumber: `REF-${Date.now().toString().slice(-6)}`,
              contactEmail: referral.referredEmail,
              company: referral.company,
              jobRole: referral.jobRole,
              registrationStatus: 'verified'
            }
          });
        }
      }

      // Notify the referring alumnus of the decision
      await NotificationService.notify({
        userId: referral.referrerAlumniId,
        title: `Referral Status Update: ${referral.referredName}`,
        message: `Your alumni referral for ${referral.referredName} (Class of ${referral.graduationYear}) was reviewed by the Council and marked as "${status.toUpperCase()}".`,
        type: 'referral',
        email: referral.referrer.email,
        sendEmail: true
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'REFERRAL_VERIFIED',
        entityType: 'REFERRAL',
        entityId: referral.id,
        metadata: {
          referredName: referral.referredName,
          status,
          reviewedBy: req.user.fullName
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `Referral successfully marked as ${status}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReferralController;
