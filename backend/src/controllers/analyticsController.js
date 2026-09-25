const prisma = require('../config/prisma');
const PdfReportService = require('../services/pdfReportService');

class AnalyticsController {
  /**
   * Helper to aggregate analytics
   */
  static async computeAnalytics(userRole, department = null) {
    // 1. Historical Alumni Records
    const totalRecords = await prisma.alumniRecord.count();
    const unregisteredCount = await prisma.alumniRecord.count({
      where: { registrationStatus: 'unregistered' }
    });
    const registeredCount = await prisma.alumniRecord.count({
      where: { registrationStatus: 'registered' }
    });
    const verifiedRecordsCount = await prisma.alumniRecord.count({
      where: { registrationStatus: 'verified' }
    });

    // 2. AI Matches
    const [totalMatchesFound, pendingMatchesCount, verifiedMatchesCount, rejectedMatchesCount, uncertainMatchesCount] = await Promise.all([
      prisma.potentialMatch.count(),
      prisma.potentialMatch.count({ where: { status: 'pending' } }),
      prisma.potentialMatch.count({ where: { status: 'verified' } }),
      prisma.potentialMatch.count({ where: { status: 'rejected' } }),
      prisma.potentialMatch.count({ where: { status: 'uncertain' } })
    ]);

    // 3. Verified Alumni Users
    const alumniFilter = { role: 'ALUMNI', isVerified: true };
    if (userRole === 'FACULTY' && department) {
      alumniFilter.department = department;
    }

    const verifiedAlumniCount = await prisma.user.count({ where: alumniFilter });

    // 4. Mentors & Workshops
    const mentorCount = await prisma.mentorshipProfile.count({
      where: { isActive: true, mentorshipAvailability: { in: ['available', 'limited'] } }
    });
    const workshopReadyCount = await prisma.alumniProfile.count({
      where: { workshopReady: true }
    });

    // 5. Doubts & Response Rate
    const totalDoubtsCount = await prisma.doubtQuestion.count();
    const answeredDoubtsCount = await prisma.doubtQuestion.count({
      where: { status: { in: ['answered', 'closed'] } }
    });
    const responseRate = totalDoubtsCount > 0 ? Math.round((answeredDoubtsCount / totalDoubtsCount) * 100) : 0;

    // 6. Batch distribution
    const batchData = await prisma.alumniProfile.groupBy({
      by: ['graduationYear'],
      _count: { userId: true },
      orderBy: { graduationYear: 'asc' }
    });

    const batchBreakdown = batchData.map(b => ({
      graduationYear: b.graduationYear,
      count: b._count.userId
    }));

    // 7. Discovery Funnel
    const engagedAlumniCount = await prisma.user.count({
      where: {
        role: 'ALUMNI',
        OR: [
          { posts: { some: {} } },
          { doubtAnswers: { some: {} } },
          { receivedInvitations: { some: { status: 'accepted' } } }
        ]
      }
    });

    const discoveryFunnel = [
      { stage: 'Imported Records', count: totalRecords },
      { stage: 'Unregistered', count: unregisteredCount },
      { stage: 'AI Potential Matches', count: totalMatchesFound },
      { stage: 'Verified Alumni', count: verifiedMatchesCount },
      { stage: 'Engaged Alumni', count: Math.max(engagedAlumniCount, verifiedMatchesCount > 0 ? 1 : 0) }
    ];

    return {
      totalRecords,
      unregisteredCount,
      registeredCount,
      verifiedRecordsCount,
      totalMatchesFound,
      pendingMatchesCount,
      verifiedMatchesCount,
      rejectedMatchesCount,
      uncertainMatchesCount,
      verifiedAlumniCount,
      mentorCount,
      workshopReadyCount,
      totalDoubtsCount,
      answeredDoubtsCount,
      responseRate,
      engagedAlumniCount,
      batchBreakdown,
      discoveryFunnel,
      department: department || 'All Departments'
    };
  }

  /**
   * GET /api/analytics/summary
   */
  static async getSummary(req, res, next) {
    try {
      const userRole = req.user.role;
      const department = userRole === 'FACULTY' ? req.user.department : null;

      const data = await AnalyticsController.computeAnalytics(userRole, department);

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/analytics/export-pdf
   * Generates and downloads official PDF analytics report
   */
  static async exportPdf(req, res, next) {
    try {
      const userRole = req.user.role;
      const department = userRole === 'FACULTY' ? req.user.department : null;

      const analyticsData = await AnalyticsController.computeAnalytics(userRole, department);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="AMS_Plus_Analytics_Report.pdf"');

      await PdfReportService.generateAnalyticsReport(analyticsData, res);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
