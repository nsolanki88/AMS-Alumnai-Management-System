const PDFDocument = require('pdfkit');

class PdfReportService {
  static async generateAnalyticsReport(analyticsData, stream) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        doc.pipe(stream);

        // Header
        doc.fillColor('#1e3a8a')
           .fontSize(22)
           .text('AMS+ — University Alumni System', { bold: true });
        doc.fillColor('#475569')
           .fontSize(14)
           .text('Executive Analytics & Engagement Report', { underline: true });
        doc.moveDown();

        doc.fillColor('#64748b')
           .fontSize(10)
           .text(`Generated On: ${new Date().toLocaleString()} | Scope: Master Institutional Overview`);
        doc.moveDown(1.5);

        // Divider
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1.5);

        // KPI Summary Box
        doc.fillColor('#0f172a').fontSize(14).text('1. Key Performance Indicators (KPIs)', { bold: true });
        doc.moveDown(0.5);

        const kpis = [
          ['Total Historical Alumni Records', analyticsData.totalRecords || 0],
          ['Unregistered Alumni Identified', analyticsData.unregisteredCount || 0],
          ['Verified Official Alumni Accounts', analyticsData.verifiedAlumniCount || 0],
          ['AI Discovered Profiles (Pending)', analyticsData.pendingMatchesCount || 0],
          ['AI Matches Verified by Council', analyticsData.verifiedMatchesCount || 0],
          ['AI Matches Rejected', analyticsData.rejectedMatchesCount || 0],
          ['Active Alumni Mentors', analyticsData.mentorCount || 0],
          ['Workshop-Ready Alumni', analyticsData.workshopReadyCount || 0],
          ['Total Student Doubts Raised', analyticsData.totalDoubtsCount || 0],
          ['Alumni Response Rate', `${analyticsData.responseRate || 0}%`]
        ];

        doc.fontSize(10);
        kpis.forEach(([label, value]) => {
          doc.fillColor('#334155').text(`${label}: `, { continued: true, bold: false });
          doc.fillColor('#1e40af').text(String(value), { bold: true });
          doc.moveDown(0.3);
        });

        doc.moveDown(1.5);

        // Funnel Summary
        doc.fillColor('#0f172a').fontSize(14).text('2. Discovery & Verification Funnel', { bold: true });
        doc.moveDown(0.5);
        doc.fillColor('#334155').fontSize(10);
        doc.text(`Stage 1 (Historical Records): ${analyticsData.totalRecords || 0}`);
        doc.text(`Stage 2 (Unregistered Alumni Identified): ${analyticsData.unregisteredCount || 0}`);
        doc.text(`Stage 3 (AI Potential Matches Generated): ${analyticsData.totalMatchesFound || 0}`);
        doc.text(`Stage 4 (Council Verified Alumni): ${analyticsData.verifiedMatchesCount || 0}`);
        doc.text(`Stage 5 (Engaged in Community/Mentorship): ${analyticsData.engagedAlumniCount || 0}`);

        doc.moveDown(1.5);

        // Batch Distribution
        doc.fillColor('#0f172a').fontSize(14).text('3. Batch-Wise Verified Alumni Breakdown', { bold: true });
        doc.moveDown(0.5);

        if (analyticsData.batchBreakdown && analyticsData.batchBreakdown.length > 0) {
          analyticsData.batchBreakdown.forEach(b => {
            doc.fillColor('#334155').fontSize(10).text(`Batch ${b.graduationYear}: ${b.count} alumni`);
          });
        } else {
          doc.fillColor('#64748b').fontSize(10).text('No batch breakdown data available.');
        }

        doc.moveDown(2);

        // Footer & Compliance Notice
        doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(1);
        doc.fillColor('#94a3b8').fontSize(8).text(
          'Compliance Notice: AMS+ operates strictly under university privacy standards. AI profile discovery signals require human council verification prior to record linkage.',
          { align: 'center' }
        );

        doc.end();
        stream.on('finish', resolve);
        stream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = PdfReportService;
