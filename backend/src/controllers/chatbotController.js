const prisma = require('../config/prisma');
const AiGatewayService = require('../services/aiGatewayService');

class ChatbotController {
  /**
   * POST /api/chatbot/query
   * Processes natural language query with strict RBAC enforcement
   */
  static async processQuery(req, res, next) {
    try {
      const { query } = req.body;
      const userRole = req.user.role;

      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Chatbot query is required'
        });
      }

      // Step 1: Extract intent & entities via AI Gateway
      const nlpResult = await AiGatewayService.extractChatIntent(query.trim(), userRole);
      const { intent, entities, confidence } = nlpResult;

      let replyMessage = '';
      let replyData = null;
      let wasAnswered = true;

      // Step 2: RBAC Check
      if (intent === 'restricted_council_intent' || (intent === 'council_discover_profiles' && !['COUNCIL', 'ADMIN'].includes(userRole))) {
        replyMessage = 'Security Policy Notice: Potential match data and historical unregistered profiles are strictly restricted to Council and Admin members.';
        wasAnswered = false;
      } else {
        // Step 3: Execute query against database based on intent
        switch (intent) {
          case 'find_alumni_by_company': {
            const company = entities.company || 'Google';
            const alumni = await prisma.user.findMany({
              where: {
                role: 'ALUMNI',
                isVerified: true,
                alumniProfile: {
                  currentCompany: { contains: company },
                  visibility: userRole === 'STUDENT' ? 'PUBLIC' : undefined
                }
              },
              include: { alumniProfile: true },
              take: 5
            });

            if (alumni.length > 0) {
              replyMessage = `Found ${alumni.length} verified alumni working at or associated with ${company}:`;
              replyData = alumni.map(a => ({
                id: a.id,
                name: a.fullName,
                role: a.alumniProfile?.currentRole || 'Engineer',
                company: a.alumniProfile?.currentCompany,
                batch: a.alumniProfile?.graduationYear,
                branch: a.alumniProfile?.branch
              }));
            } else {
              replyMessage = `I could not find any verified alumni currently listed at "${company}". Try searching for another firm like Amazon, Microsoft, or Uber.`;
            }
            break;
          }

          case 'workshop_inquiry': {
            const skill = entities.skill || 'technology';
            const workshopAlumni = await prisma.user.findMany({
              where: {
                role: 'ALUMNI',
                isVerified: true,
                alumniProfile: {
                  workshopReady: true,
                  skills: { contains: skill }
                }
              },
              include: { alumniProfile: true, mentorshipProfile: true },
              take: 5
            });

            if (workshopAlumni.length > 0) {
              replyMessage = `Here are verified alumni ready to conduct workshops on or related to "${skill}":`;
              replyData = workshopAlumni.map(a => ({
                id: a.id,
                name: a.fullName,
                role: a.alumniProfile?.currentRole,
                company: a.alumniProfile?.currentCompany,
                topics: JSON.parse(a.mentorshipProfile?.workshopTopics || '["Tech Workshops"]')
              }));
            } else {
              replyMessage = `No specific alumni marked workshop-ready for "${skill}" yet. You can invite other alumni via the Faculty/Mentorship portal.`;
            }
            break;
          }

          case 'filter_batch_alumni': {
            const batch = entities.batch;
            const branch = entities.branch;

            const where = {
              role: 'ALUMNI',
              isVerified: true,
              alumniProfile: {}
            };
            if (batch) where.alumniProfile.graduationYear = batch;
            if (branch) where.alumniProfile.branch = { contains: branch };
            if (userRole === 'STUDENT') where.alumniProfile.visibility = 'PUBLIC';

            const alumni = await prisma.user.findMany({
              where,
              include: { alumniProfile: true },
              take: 6
            });

            const filterDesc = [branch ? `${branch}` : '', batch ? `Class of ${batch}` : ''].filter(Boolean).join(' ');
            if (alumni.length > 0) {
              replyMessage = `Here are verified alumni from ${filterDesc || 'requested batches'}:`;
              replyData = alumni.map(a => ({
                id: a.id,
                name: a.fullName,
                batch: a.alumniProfile?.graduationYear,
                branch: a.alumniProfile?.branch,
                company: a.alumniProfile?.currentCompany
              }));
            } else {
              replyMessage = `No verified alumni records matched ${filterDesc || 'your criteria'}.`;
            }
            break;
          }

          case 'find_mentors_by_skill': {
            const skill = entities.skill || 'machine learning';
            const mentors = await prisma.mentorshipProfile.findMany({
              where: {
                isActive: true,
                skills: { contains: skill }
              },
              include: {
                user: { select: { id: true, fullName: true, alumniProfile: true } }
              },
              take: 5
            });

            if (mentors.length > 0) {
              replyMessage = `Found ${mentors.length} active mentors offering guidance in "${skill}":`;
              replyData = mentors.map(m => ({
                id: m.userId,
                name: m.user.fullName,
                company: m.currentCompany,
                role: m.currentRole,
                skills: JSON.parse(m.skills || '[]')
              }));
            } else {
              replyMessage = `No active mentors found specifically for "${skill}". Check out the general Mentorship directory.`;
            }
            break;
          }

          case 'council_discover_profiles': {
            // Council / Admin query
            const unregistered = await prisma.alumniRecord.findMany({
              where: { registrationStatus: 'unregistered' },
              include: { potentialMatches: true },
              take: 4
            });

            replyMessage = `[Council Portal] Found ${unregistered.length} unregistered alumni records available for AI profile discovery:`;
            replyData = unregistered.map(u => ({
              recordId: u.recordId,
              name: u.fullName,
              batch: u.graduationYear,
              branch: u.branch,
              pendingMatches: u.potentialMatches.filter(m => m.status === 'pending').length
            }));
            break;
          }

          default:
            replyMessage = `I can help you search verified alumni, find mentors by skill, explore upcoming workshops, or filter by batch. Ask me something like "Find alumni working in Google" or "Which alumni can conduct a Python workshop?".`;
            wasAnswered = false;
        }
      }

      // Step 4: Log query to ChatbotLog
      await prisma.chatbotLog.create({
        data: {
          userId: req.user.id,
          userRole: req.user.role,
          query: query.trim(),
          intent,
          confidence,
          entities: JSON.stringify(entities || {}),
          wasAnswered
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          reply: replyMessage,
          data: replyData,
          intent,
          entities,
          confidence
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chatbot/logs
   * Admin inspection of query logs
   */
  static async getLogs(req, res, next) {
    try {
      const logs = await prisma.chatbotLog.findMany({
        take: 50,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { fullName: true, role: true } }
        }
      });

      return res.status(200).json({
        success: true,
        data: logs.map(l => ({
          ...l,
          entities: JSON.parse(l.entities || '{}')
        }))
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ChatbotController;
