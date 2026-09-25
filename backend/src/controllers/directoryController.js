const prisma = require('../config/prisma');

class DirectoryController {
  /**
   * GET /api/directory
   * Search verified alumni with strict privacy enforcement based on viewer role & visibility settings
   */
  static async getDirectory(req, res, next) {
    try {
      const viewerRole = req.user.role;
      const viewerBatch = req.user.alumniProfile?.graduationYear || null;

      const {
        batch,
        branch,
        company,
        jobRole,
        cityCountry,
        skill,
        search,
        page = 1,
        limit = 12
      } = req.query;

      // Base query: only verified alumni
      const where = {
        role: 'ALUMNI',
        isVerified: true,
        alumniProfile: { isNot: null }
      };

      // Visibility filter based on viewer's role
      if (viewerRole === 'STUDENT' || viewerRole === 'FACULTY') {
        // Students and Faculty only see PUBLIC profiles
        where.alumniProfile.visibility = 'PUBLIC';
      } else if (viewerRole === 'ALUMNI') {
        // Alumni see PUBLIC + BATCH_ONLY (if in same batch)
        if (viewerBatch) {
          where.alumniProfile.OR = [
            { visibility: 'PUBLIC' },
            { AND: [{ visibility: 'BATCH_ONLY' }, { graduationYear: viewerBatch }] }
          ];
        } else {
          where.alumniProfile.visibility = 'PUBLIC';
        }
      }
      // Council and Admin can see all verified profiles (PUBLIC, BATCH_ONLY, PRIVATE)

      // Apply search filters
      if (batch) {
        where.alumniProfile.graduationYear = parseInt(batch, 10);
      }
      if (branch) {
        where.alumniProfile.branch = { contains: branch };
      }
      if (company) {
        where.alumniProfile.currentCompany = { contains: company };
      }
      if (jobRole) {
        where.alumniProfile.currentRole = { contains: jobRole };
      }
      if (cityCountry) {
        where.alumniProfile.cityCountry = { contains: cityCountry };
      }
      if (skill) {
        where.alumniProfile.skills = { contains: skill };
      }
      if (search) {
        where.OR = [
          { fullName: { contains: search } },
          { alumniProfile: { currentCompany: { contains: search } } },
          { alumniProfile: { currentRole: { contains: search } } },
          { alumniProfile: { skills: { contains: search } } }
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
            department: true,
            alumniProfile: true,
            mentorshipProfile: true,
            receivedEndorsements: {
              include: { faculty: { select: { fullName: true, department: true } } }
            }
          },
          orderBy: { fullName: 'asc' },
          skip,
          take
        })
      ]);

      // Strip sensitive information for Students and Faculty
      const sanitizedUsers = users.map(u => {
        const isPrivileged = ['COUNCIL', 'ADMIN'].includes(viewerRole);
        const isSelf = u.id === req.user.id;
        const canViewContact = isPrivileged || isSelf || (u.alumniProfile && u.alumniProfile.visibility === 'PUBLIC');

        return {
          id: u.id,
          fullName: u.fullName,
          // Hide email & phone from students/faculty unless explicitly permitted
          email: canViewContact ? u.email : undefined,
          phoneNumber: canViewContact ? u.phoneNumber : undefined,
          role: u.role,
          department: u.department,
          alumniProfile: u.alumniProfile ? {
            id: u.alumniProfile.id,
            graduationYear: u.alumniProfile.graduationYear,
            branch: u.alumniProfile.branch,
            currentCompany: u.alumniProfile.currentCompany,
            currentRole: u.alumniProfile.currentRole,
            cityCountry: u.alumniProfile.cityCountry,
            bio: u.alumniProfile.bio,
            linkedinUrl: u.alumniProfile.linkedinUrl,
            githubUrl: u.alumniProfile.githubUrl,
            visibility: u.alumniProfile.visibility,
            isMentor: u.alumniProfile.isMentor,
            workshopReady: u.alumniProfile.workshopReady,
            skills: JSON.parse(u.alumniProfile.skills || '[]'),
            experienceYears: u.alumniProfile.experienceYears
          } : null,
          mentorshipProfile: u.mentorshipProfile ? {
            bio: u.mentorshipProfile.bio,
            currentCompany: u.mentorshipProfile.currentCompany,
            currentRole: u.mentorshipProfile.currentRole,
            yearsOfExperience: u.mentorshipProfile.yearsOfExperience,
            skills: JSON.parse(u.mentorshipProfile.skills || '[]'),
            expertiseAreas: JSON.parse(u.mentorshipProfile.expertiseAreas || '[]'),
            workshopTopics: JSON.parse(u.mentorshipProfile.workshopTopics || '[]'),
            mentorshipAvailability: u.mentorshipProfile.mentorshipAvailability,
            isActive: u.mentorshipProfile.isActive
          } : null,
          endorsements: u.receivedEndorsements.map(e => ({
            skill: e.skillName,
            comment: e.comment,
            facultyName: e.faculty.fullName,
            department: e.faculty.department
          }))
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
          alumni: sanitizedUsers
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/directory/:id
   */
  static async getAlumniById(req, res, next) {
    try {
      const { id } = req.params;
      const viewerRole = req.user.role;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          alumniProfile: true,
          mentorshipProfile: true,
          receivedEndorsements: {
            include: { faculty: { select: { fullName: true, department: true } } }
          }
        }
      });

      if (!user || user.role !== 'ALUMNI' || !user.isVerified) {
        return res.status(404).json({
          success: false,
          message: 'Verified alumni profile not found'
        });
      }

      // Check visibility constraints
      if (viewerRole === 'STUDENT' || viewerRole === 'FACULTY') {
        if (user.alumniProfile?.visibility === 'PRIVATE') {
          return res.status(403).json({
            success: false,
            message: 'This profile is set to private by the alumnus.'
          });
        }
      }

      const isPrivileged = ['COUNCIL', 'ADMIN'].includes(viewerRole);
      const isSelf = user.id === req.user.id;
      const canViewContact = isPrivileged || isSelf || (user.alumniProfile && user.alumniProfile.visibility === 'PUBLIC');

      return res.status(200).json({
        success: true,
        data: {
          id: user.id,
          fullName: user.fullName,
          email: canViewContact ? user.email : null,
          phoneNumber: canViewContact ? user.phoneNumber : null,
          role: user.role,
          department: user.department,
          alumniProfile: user.alumniProfile ? {
            ...user.alumniProfile,
            skills: JSON.parse(user.alumniProfile.skills || '[]')
          } : null,
          mentorshipProfile: user.mentorshipProfile ? {
            ...user.mentorshipProfile,
            skills: JSON.parse(user.mentorshipProfile.skills || '[]'),
            expertiseAreas: JSON.parse(user.mentorshipProfile.expertiseAreas || '[]'),
            workshopTopics: JSON.parse(user.mentorshipProfile.workshopTopics || '[]')
          } : null,
          endorsements: user.receivedEndorsements.map(e => ({
            id: e.id,
            skill: e.skillName,
            comment: e.comment,
            facultyName: e.faculty.fullName,
            department: e.faculty.department
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DirectoryController;
