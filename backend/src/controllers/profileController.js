const prisma = require('../config/prisma');

class ProfileController {
  /**
   * GET /api/profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          alumniProfile: true,
          mentorshipProfile: true,
          receivedEndorsements: {
            include: { faculty: { select: { fullName: true, department: true } } }
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          ...user,
          alumniProfile: user.alumniProfile ? {
            ...user.alumniProfile,
            skills: JSON.parse(user.alumniProfile.skills || '[]')
          } : null,
          mentorshipProfile: user.mentorshipProfile ? {
            ...user.mentorshipProfile,
            skills: JSON.parse(user.mentorshipProfile.skills || '[]'),
            expertiseAreas: JSON.parse(user.mentorshipProfile.expertiseAreas || '[]'),
            workshopTopics: JSON.parse(user.mentorshipProfile.workshopTopics || '[]')
          } : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/profile
   * Update profile, professional information, and visibility settings
   */
  static async updateProfile(req, res, next) {
    try {
      const {
        fullName,
        phoneNumber,
        department,
        // Alumni fields
        graduationYear,
        branch,
        currentCompany,
        currentRole,
        cityCountry,
        bio,
        linkedinUrl,
        githubUrl,
        visibility = 'PUBLIC',
        skills = [],
        experienceYears = 0,
        isMentor = false,
        workshopReady = false
      } = req.body;

      // Update User table
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          fullName: fullName || req.user.fullName,
          phoneNumber: phoneNumber !== undefined ? phoneNumber : req.user.phoneNumber,
          department: department || req.user.department
        }
      });

      // If ALUMNI, upsert AlumniProfile
      let alumniProfile = null;
      if (req.user.role === 'ALUMNI') {
        const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
        alumniProfile = await prisma.alumniProfile.upsert({
          where: { userId: req.user.id },
          update: {
            graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
            branch: branch || undefined,
            currentCompany,
            currentRole,
            cityCountry,
            bio,
            linkedinUrl,
            githubUrl,
            visibility: ['PUBLIC', 'BATCH_ONLY', 'PRIVATE'].includes(visibility) ? visibility : 'PUBLIC',
            skills: skillsJson,
            experienceYears: parseInt(experienceYears || 0, 10),
            isMentor: Boolean(isMentor),
            workshopReady: Boolean(workshopReady)
          },
          create: {
            userId: req.user.id,
            graduationYear: parseInt(graduationYear || 2023, 10),
            branch: branch || 'Computer Science',
            currentCompany,
            currentRole,
            cityCountry,
            bio,
            linkedinUrl,
            githubUrl,
            visibility: ['PUBLIC', 'BATCH_ONLY', 'PRIVATE'].includes(visibility) ? visibility : 'PUBLIC',
            skills: skillsJson,
            experienceYears: parseInt(experienceYears || 0, 10),
            isMentor: Boolean(isMentor),
            workshopReady: Boolean(workshopReady)
          }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          ...updatedUser,
          alumniProfile: alumniProfile ? {
            ...alumniProfile,
            skills: JSON.parse(alumniProfile.skills || '[]')
          } : null
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfileController;
