const prisma = require('../config/prisma');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

class MentorshipController {
  /**
   * POST /api/mentorship/profile
   * Alumni sets/updates mentorship profile & availability
   */
  static async upsertMentorshipProfile(req, res, next) {
    try {
      const {
        bio,
        currentCompany,
        currentRole,
        yearsOfExperience,
        skills,
        expertiseAreas,
        workshopTopics,
        mentorshipAvailability = 'available',
        isActive = true
      } = req.body;

      const profile = await prisma.mentorshipProfile.upsert({
        where: { userId: req.user.id },
        update: {
          bio,
          currentCompany,
          currentRole,
          yearsOfExperience: parseInt(yearsOfExperience || 0, 10),
          skills: JSON.stringify(skills || []),
          expertiseAreas: JSON.stringify(expertiseAreas || []),
          workshopTopics: JSON.stringify(workshopTopics || []),
          mentorshipAvailability,
          isActive
        },
        create: {
          userId: req.user.id,
          bio,
          currentCompany,
          currentRole,
          yearsOfExperience: parseInt(yearsOfExperience || 0, 10),
          skills: JSON.stringify(skills || []),
          expertiseAreas: JSON.stringify(expertiseAreas || []),
          workshopTopics: JSON.stringify(workshopTopics || []),
          mentorshipAvailability,
          isActive
        }
      });

      // Also update AlumniProfile flags
      await prisma.alumniProfile.updateMany({
        where: { userId: req.user.id },
        data: {
          isMentor: isActive && mentorshipAvailability !== 'unavailable',
          workshopReady: Boolean(workshopTopics && workshopTopics.length > 0)
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Mentorship profile updated successfully',
        data: profile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mentorship/mentors
   * List available mentors with filters
   */
  static async getMentors(req, res, next) {
    try {
      const { skill, company, search } = req.query;

      const where = {
        isActive: true,
        mentorshipAvailability: { in: ['available', 'limited'] }
      };

      if (company) {
        where.currentCompany = { contains: company };
      }
      if (skill) {
        where.skills = { contains: skill };
      }

      const mentors = await prisma.mentorshipProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              alumniProfile: true,
              receivedEndorsements: {
                include: { faculty: { select: { fullName: true } } }
              }
            }
          }
        },
        orderBy: { yearsOfExperience: 'desc' }
      });

      const formatted = mentors.map(m => ({
        id: m.id,
        userId: m.userId,
        fullName: m.user.fullName,
        bio: m.bio,
        currentCompany: m.currentCompany,
        currentRole: m.currentRole,
        yearsOfExperience: m.yearsOfExperience,
        skills: JSON.parse(m.skills || '[]'),
        expertiseAreas: JSON.parse(m.expertiseAreas || '[]'),
        workshopTopics: JSON.parse(m.workshopTopics || '[]'),
        mentorshipAvailability: m.mentorshipAvailability,
        graduationYear: m.user.alumniProfile?.graduationYear,
        branch: m.user.alumniProfile?.branch,
        endorsements: m.user.receivedEndorsements.map(e => e.skillName)
      }));

      return res.status(200).json({
        success: true,
        data: formatted
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/mentorship/invitations
   * Student/Faculty/Council creates invitation for workshop, guest lecture, or mentorship
   */
  static async createInvitation(req, res, next) {
    try {
      const { alumniId, topic, sessionType = 'workshop', date, time, notes, meetingLink } = req.body;

      if (!alumniId || !topic || !date) {
        return res.status(400).json({
          success: false,
          message: 'Alumni ID, topic, and date are required'
        });
      }

      const targetAlumnus = await prisma.user.findUnique({
        where: { id: alumniId }
      });

      if (!targetAlumnus || targetAlumnus.role !== 'ALUMNI') {
        return res.status(404).json({
          success: false,
          message: 'Target alumnus not found'
        });
      }

      const invitation = await prisma.workshopInvitation.create({
        data: {
          requesterId: req.user.id,
          alumniId,
          topic,
          sessionType,
          date: new Date(date),
          time: time || '10:00 AM',
          notes,
          meetingLink,
          status: 'pending'
        },
        include: {
          requester: { select: { fullName: true, role: true, department: true } },
          alumnus: { select: { fullName: true, email: true } }
        }
      });

      // Send notification to target alumnus
      await NotificationService.notify({
        userId: alumniId,
        title: `New Session Invitation: ${topic}`,
        message: `${req.user.fullName} (${req.user.role}) has invited you to conduct a ${sessionType} on "${topic}" scheduled for ${new Date(date).toLocaleDateString()}.`,
        type: 'mentorship',
        email: targetAlumnus.email,
        sendEmail: true
      });

      await AuditService.log({
        userId: req.user.id,
        actionType: 'WORKSHOP_INVITATION_SENT',
        entityType: 'WORKSHOP_INVITATION',
        entityId: invitation.id,
        metadata: {
          alumnusName: targetAlumnus.fullName,
          topic,
          sessionType
        },
        ipAddress: req.ip
      });

      return res.status(201).json({
        success: true,
        message: 'Invitation sent successfully',
        data: invitation
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mentorship/invitations
   */
  static async getInvitations(req, res, next) {
    try {
      const userRole = req.user.role;
      let where = {};

      if (['COUNCIL', 'ADMIN'].includes(userRole)) {
        where = {}; // Council/Admin sees all
      } else if (userRole === 'ALUMNI') {
        where = { alumniId: req.user.id };
      } else {
        where = { requesterId: req.user.id };
      }

      const invitations = await prisma.workshopInvitation.findMany({
        where,
        include: {
          requester: { select: { id: true, fullName: true, role: true, department: true } },
          alumnus: { select: { id: true, fullName: true, email: true, alumniProfile: true } }
        },
        orderBy: { date: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: invitations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/mentorship/invitations/:id
   * Alumni accepts, declines, or reschedules
   */
  static async updateInvitationStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, date, time, notes, meetingLink } = req.body;

      if (!['accepted', 'declined', 'rescheduled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be accepted, declined, or rescheduled'
        });
      }

      const invitation = await prisma.workshopInvitation.findUnique({
        where: { id },
        include: { requester: true, alumnus: true }
      });

      if (!invitation) {
        return res.status(404).json({ success: false, message: 'Invitation not found' });
      }

      // Ensure alumnus or Council/Admin is making the change
      if (invitation.alumniId !== req.user.id && !['COUNCIL', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Unauthorized to update this invitation' });
      }

      const updateData = { status };
      if (notes) updateData.notes = notes;
      if (meetingLink) updateData.meetingLink = meetingLink;
      if (status === 'rescheduled' && date) {
        updateData.date = new Date(date);
        if (time) updateData.time = time;
      }

      const updated = await prisma.workshopInvitation.update({
        where: { id },
        data: updateData
      });

      // Notify requester
      await NotificationService.notify({
        userId: invitation.requesterId,
        title: `Invitation ${status.toUpperCase()}: ${invitation.topic}`,
        message: `${invitation.alumnus.fullName} has ${status} the invitation for "${invitation.topic}".`,
        type: 'mentorship',
        email: invitation.requester.email,
        sendEmail: true
      });

      return res.status(200).json({
        success: true,
        message: `Invitation marked as ${status}`,
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/mentorship/calendar
   * Returns all accepted upcoming sessions for students, faculty, and alumni
   */
  static async getCalendar(req, res, next) {
    try {
      const sessions = await prisma.workshopInvitation.findMany({
        where: {
          status: 'accepted'
        },
        include: {
          requester: { select: { fullName: true, role: true, department: true } },
          alumnus: {
            select: {
              fullName: true,
              alumniProfile: { select: { currentCompany: true, currentRole: true } }
            }
          }
        },
        orderBy: { date: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MentorshipController;
