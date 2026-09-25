const prisma = require('../config/prisma');
const AiGatewayService = require('../services/aiGatewayService');
const NotificationService = require('../services/notificationService');
const AuditService = require('../services/auditService');

class DoubtController {
  /**
   * POST /api/doubts
   * Student creates a career or academic doubt
   */
  static async createDoubt(req, res, next) {
    try {
      const { title, description, category = 'Career Guidance' } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Doubt title and detailed description are required'
        });
      }

      // Step 1: Run AI classification and topic/skill extraction
      const aiAnalysis = await AiGatewayService.classifyQuestion(title, description);

      const doubt = await prisma.doubtQuestion.create({
        data: {
          studentId: req.user.id,
          title,
          description,
          category,
          aiClassifiedCategory: aiAnalysis.category || category,
          extractedSkills: JSON.stringify(aiAnalysis.extractedSkills || [])
        },
        include: {
          student: { select: { fullName: true, department: true } }
        }
      });

      // Step 2: Fetch verified alumni candidate pool for recommendations
      const verifiedAlumni = await prisma.user.findMany({
        where: {
          role: 'ALUMNI',
          isVerified: true,
          alumniProfile: { isNot: null }
        },
        include: {
          alumniProfile: true,
          mentorshipProfile: true
        },
        take: 30
      });

      // Step 3: Run AI alumni ranking algorithm
      const recommendationResult = await AiGatewayService.recommendAlumni(doubt, verifiedAlumni);
      const recommendations = recommendationResult.recommendations || [];

      // Step 4: Dispatch in-app notifications to top 3 recommended alumni
      recommendations.slice(0, 3).forEach(rec => {
        NotificationService.notify({
          userId: rec.alumniId,
          title: `New Student Doubt: ${doubt.title.substring(0, 40)}...`,
          message: `You were recommended by AMS+ AI to answer a doubt on "${doubt.title}" based on your skills: ${rec.reasons.join(', ')}.`,
          type: 'doubt'
        }).catch(err => console.error('Doubt notify error:', err));
      });

      return res.status(201).json({
        success: true,
        message: 'Doubt posted successfully and routed to relevant alumni mentors.',
        data: {
          doubt: {
            ...doubt,
            extractedSkills: JSON.parse(doubt.extractedSkills || '[]')
          },
          aiRecommendations: recommendations
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/doubts
   * List doubts with filters for category, status, search
   */
  static async getDoubts(req, res, next) {
    try {
      const { category, status, search, myDoubts, page = 1, limit = 15 } = req.query;

      const where = {};

      if (category && category !== 'All') {
        where.category = category;
      }
      if (status && status !== 'All') {
        where.status = status;
      }
      if (myDoubts === 'true') {
        where.studentId = req.user.id;
      }
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } },
          { extractedSkills: { contains: search } }
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const take = parseInt(limit, 10);

      const [total, doubts] = await Promise.all([
        prisma.doubtQuestion.count({ where }),
        prisma.doubtQuestion.findMany({
          where,
          include: {
            student: { select: { id: true, fullName: true, department: true } },
            answers: {
              include: {
                alumnus: {
                  select: {
                    id: true,
                    fullName: true,
                    alumniProfile: { select: { currentCompany: true, currentRole: true } }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        })
      ]);

      const formatted = doubts.map(d => ({
        ...d,
        extractedSkills: JSON.parse(d.extractedSkills || '[]'),
        answerCount: d.answers.length,
        hasHelpfulAnswer: d.answers.some(a => a.isHelpful)
      }));

      return res.status(200).json({
        success: true,
        data: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
          doubts: formatted
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/doubts/:id
   */
  static async getDoubtById(req, res, next) {
    try {
      const { id } = req.params;

      const doubt = await prisma.doubtQuestion.findUnique({
        where: { id },
        include: {
          student: { select: { id: true, fullName: true, department: true } },
          answers: {
            include: {
              alumnus: {
                select: {
                  id: true,
                  fullName: true,
                  alumniProfile: {
                    select: { currentCompany: true, currentRole: true, graduationYear: true, branch: true }
                  }
                }
              }
            },
            orderBy: [{ isHelpful: 'desc' }, { createdAt: 'asc' }]
          }
        }
      });

      if (!doubt) {
        return res.status(404).json({ success: false, message: 'Doubt not found' });
      }

      // Fetch AI recommendations for this doubt
      const verifiedAlumni = await prisma.user.findMany({
        where: { role: 'ALUMNI', isVerified: true },
        include: { alumniProfile: true },
        take: 15
      });
      const recommendationResult = await AiGatewayService.recommendAlumni(doubt, verifiedAlumni);

      return res.status(200).json({
        success: true,
        data: {
          ...doubt,
          extractedSkills: JSON.parse(doubt.extractedSkills || '[]'),
          aiRecommendations: recommendationResult.recommendations || []
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/doubts/:id/recommendations
   */
  static async getRecommendations(req, res, next) {
    try {
      const { id } = req.params;
      const doubt = await prisma.doubtQuestion.findUnique({ where: { id } });

      if (!doubt) {
        return res.status(404).json({ success: false, message: 'Doubt not found' });
      }

      const verifiedAlumni = await prisma.user.findMany({
        where: { role: 'ALUMNI', isVerified: true },
        include: { alumniProfile: true },
        take: 20
      });

      const result = await AiGatewayService.recommendAlumni(doubt, verifiedAlumni);

      return res.status(200).json({
        success: true,
        data: result.recommendations || []
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/doubts/:id/answers
   * Alumni answers a doubt
   */
  static async createAnswer(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'Answer content is required' });
      }

      const doubt = await prisma.doubtQuestion.findUnique({
        where: { id },
        include: { student: true }
      });

      if (!doubt) {
        return res.status(404).json({ success: false, message: 'Doubt not found' });
      }

      const answer = await prisma.doubtAnswer.create({
        data: {
          doubtId: id,
          alumniId: req.user.id,
          content: content.trim()
        },
        include: {
          alumnus: {
            select: {
              id: true,
              fullName: true,
              alumniProfile: { select: { currentCompany: true, currentRole: true } }
            }
          }
        }
      });

      // Update question status to answered
      await prisma.doubtQuestion.update({
        where: { id },
        data: { status: 'answered' }
      });

      // Notify student
      await NotificationService.notify({
        userId: doubt.studentId,
        title: 'New Answer to Your Question',
        message: `${req.user.fullName} answered your question: "${doubt.title}".`,
        type: 'doubt',
        email: doubt.student.email,
        sendEmail: true
      });

      return res.status(201).json({
        success: true,
        message: 'Answer posted successfully',
        data: answer
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/doubts/:id/answers/:answerId/helpful
   * Student marks an answer as the most helpful
   */
  static async markHelpful(req, res, next) {
    try {
      const { id, answerId } = req.params;

      const doubt = await prisma.doubtQuestion.findUnique({ where: { id } });
      if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

      // Only the author student or admin can mark helpful
      if (doubt.studentId !== req.user.id && req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, message: 'Only the question author can mark an answer helpful' });
      }

      // Reset any previous helpful flags on this doubt
      await prisma.doubtAnswer.updateMany({
        where: { doubtId: id },
        data: { isHelpful: false }
      });

      const updated = await prisma.doubtAnswer.update({
        where: { id: answerId },
        data: { isHelpful: true },
        include: { alumnus: true }
      });

      // Notify alumni
      await NotificationService.notify({
        userId: updated.alumniId,
        title: 'Your Answer Was Marked Helpful!',
        message: `The student marked your answer on "${doubt.title}" as the most helpful solution. Thank you for giving back!`,
        type: 'doubt'
      });

      return res.status(200).json({
        success: true,
        message: 'Answer marked as most helpful',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/doubts/:id
   * Council/Admin moderation
   */
  static async deleteDoubt(req, res, next) {
    try {
      const { id } = req.params;
      const doubt = await prisma.doubtQuestion.findUnique({ where: { id } });

      if (!doubt) return res.status(404).json({ success: false, message: 'Doubt not found' });

      const isAuthor = doubt.studentId === req.user.id;
      const isPrivileged = ['COUNCIL', 'ADMIN'].includes(req.user.role);

      if (!isAuthor && !isPrivileged) {
        return res.status(403).json({ success: false, message: 'Unauthorized to delete this doubt' });
      }

      await prisma.doubtQuestion.delete({ where: { id } });

      return res.status(200).json({ success: true, message: 'Doubt deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DoubtController;
