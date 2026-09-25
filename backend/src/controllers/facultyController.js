const prisma = require('../config/prisma');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

class FacultyController {
  /**
   * POST /api/faculty/endorse
   * Faculty endorses an alumnus's skill with institutional comment
   */
  static async endorseAlumnus(req, res, next) {
    try {
      const { alumniId, skillName, comment } = req.body;

      if (!alumniId || !skillName) {
        return res.status(400).json({
          success: false,
          message: 'Alumni ID and skill name are required'
        });
      }

      const alumnus = await prisma.user.findUnique({
        where: { id: alumniId },
        include: { alumniProfile: true }
      });

      if (!alumnus || alumnus.role !== 'ALUMNI') {
        return res.status(404).json({ success: false, message: 'Alumnus not found' });
      }

      const endorsement = await prisma.facultyEndorsement.upsert({
        where: {
          facultyId_alumniId_skillName: {
            facultyId: req.user.id,
            alumniId,
            skillName
          }
        },
        update: {
          comment: comment || ''
        },
        create: {
          facultyId: req.user.id,
          alumniId,
          skillName,
          comment: comment || ''
        },
        include: {
          faculty: { select: { fullName: true, department: true } },
          alumnus: { select: { fullName: true, email: true } }
        }
      });

      // Notify the alumnus
      await NotificationService.notify({
        userId: alumniId,
        title: 'Faculty Skill Endorsement Received',
        message: `Prof. ${req.user.fullName} (${req.user.department || 'Faculty'}) has officially endorsed your skill in "${skillName}".`,
        type: 'verification',
        email: alumnus.email,
        sendEmail: true
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'EXPERTISE_ENDORSED',
        entityType: 'USER',
        entityId: alumniId,
        metadata: {
          skillName,
          alumnusName: alumnus.fullName,
          facultyName: req.user.fullName
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `Successfully endorsed ${alumnus.fullName} for ${skillName}`,
        data: endorsement
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/faculty/endorsements
   * Get endorsements given by faculty member
   */
  static async getMyEndorsements(req, res, next) {
    try {
      const endorsements = await prisma.facultyEndorsement.findMany({
        where: { facultyId: req.user.id },
        include: {
          alumnus: {
            select: {
              id: true,
              fullName: true,
              alumniProfile: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: endorsements
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/faculty/department-alumni
   */
  static async getDepartmentAlumni(req, res, next) {
    try {
      const department = req.user.department || 'Computer Science & Engineering';

      const alumni = await prisma.user.findMany({
        where: {
          role: 'ALUMNI',
          isVerified: true,
          OR: [
            { department: { contains: department } },
            { alumniProfile: { branch: { contains: department.substring(0, 3) } } }
          ]
        },
        include: {
          alumniProfile: true,
          mentorshipProfile: true,
          receivedEndorsements: true
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          department,
          count: alumni.length,
          alumni: alumni.map(a => ({
            id: a.id,
            fullName: a.fullName,
            email: a.email,
            company: a.alumniProfile?.currentCompany,
            role: a.alumniProfile?.currentRole,
            batch: a.alumniProfile?.graduationYear,
            isMentor: a.alumniProfile?.isMentor,
            workshopReady: a.alumniProfile?.workshopReady,
            endorsements: a.receivedEndorsements.map(e => e.skillName)
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FacultyController;
