const multer = require('multer');
const prisma = require('../config/prisma');
const AuditService = require('../services/auditService');

// Multer memory storage for parsing CSV / file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

class AlumniRecordController {
  /**
   * 1. Parse uploaded CSV buffer into structured rows and preview
   */
  static parseCSVText(text) {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };

    // Simple robust CSV line splitter handling quoted strings
    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const rawHeaders = parseLine(lines[0]);
    const headers = rawHeaders.map(h => h.trim());

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length > 0 && values.some(v => v !== '')) {
        const rowObj = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] || '';
        });
        rows.push(rowObj);
      }
    }

    return { headers, rows };
  }

  /**
   * POST /api/alumni-records/upload
   * Accepts uploaded file, detects headers, previews first 10 rows
   */
  static async uploadAndPreview(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please upload a CSV file'
        });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const { headers, rows } = AlumniRecordController.parseCSVText(fileContent);

      if (rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'The uploaded file is empty or missing data rows'
        });
      }

      // Recommend default column mappings based on common names
      const suggestedMapping = {};
      headers.forEach(h => {
        const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (lower.includes('name')) suggestedMapping['fullName'] = h;
        else if (lower.includes('roll') || lower.includes('studentid') || lower.includes('id')) suggestedMapping['rollNumber'] = h;
        else if (lower.includes('batch') || lower.includes('year') || lower.includes('grad')) suggestedMapping['graduationYear'] = h;
        else if (lower.includes('branch') || lower.includes('dept') || lower.includes('major')) suggestedMapping['branch'] = h;
        else if (lower.includes('email')) suggestedMapping['contactEmail'] = h;
        else if (lower.includes('phone') || lower.includes('mobile')) suggestedMapping['phoneNumber'] = h;
        else if (lower.includes('company') || lower.includes('org')) suggestedMapping['company'] = h;
        else if (lower.includes('role') || lower.includes('job') || lower.includes('title')) suggestedMapping['jobRole'] = h;
        else if (lower.includes('city') || lower.includes('country') || lower.includes('location')) suggestedMapping['cityCountry'] = h;
      });

      return res.status(200).json({
        success: true,
        message: 'File parsed successfully for preview',
        data: {
          filename: req.file.originalname,
          totalRows: rows.length,
          headers,
          suggestedMapping,
          previewRows: rows.slice(0, 10),
          allRows: rows // Frontend can inspect or modify
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/alumni-records/import
   * Validates mapped rows, checks duplicates against database and batch, imports valid, flags errors
   */
  static async importRecords(req, res, next) {
    try {
      const { rows, columnMapping } = req.body;

      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No records provided for import'
        });
      }

      const mapping = columnMapping || {};
      const validRecords = [];
      const duplicateRecords = [];
      const invalidRecords = [];

      // Existing roll numbers in database for duplicate detection
      const existingDbRecords = await prisma.alumniRecord.findMany({
        select: { rollNumber: true }
      });
      const dbRollSet = new Set(existingDbRecords.map(r => r.rollNumber.toLowerCase().trim()));
      const batchRollSet = new Set();

      rows.forEach((row, index) => {
        const fullName = (row[mapping.fullName] || row.fullName || row.name || '').trim();
        const rollNumber = (row[mapping.rollNumber] || row.rollNumber || row.roll_number || '').trim();
        const gradYearRaw = (row[mapping.graduationYear] || row.graduationYear || row.batch || '').toString().trim();
        const branch = (row[mapping.branch] || row.branch || 'CSE').trim();
        const contactEmail = (row[mapping.contactEmail] || row.contactEmail || row.email || '').trim() || null;
        const phoneNumber = (row[mapping.phoneNumber] || row.phoneNumber || row.phone || '').trim() || null;
        const company = (row[mapping.company] || row.company || '').trim() || null;
        const jobRole = (row[mapping.jobRole] || row.jobRole || '').trim() || null;
        const cityCountry = (row[mapping.cityCountry] || row.cityCountry || '').trim() || null;

        const rowNum = index + 1;

        // Validation checks
        if (!fullName || !rollNumber) {
          invalidRecords.push({
            row: rowNum,
            data: row,
            reason: 'Full Name and Roll Number are mandatory.'
          });
          return;
        }

        const gradYear = parseInt(gradYearRaw, 10);
        if (isNaN(gradYear) || gradYear < 1950 || gradYear > 2035) {
          invalidRecords.push({
            row: rowNum,
            data: row,
            reason: `Invalid graduation year: "${gradYearRaw}"`
          });
          return;
        }

        const lowerRoll = rollNumber.toLowerCase();

        // Check for duplicates in DB
        if (dbRollSet.has(lowerRoll)) {
          duplicateRecords.push({
            row: rowNum,
            rollNumber,
            fullName,
            reason: `Roll Number "${rollNumber}" already exists in historical alumni records.`
          });
          return;
        }

        // Check for duplicate roll numbers within the current file batch
        if (batchRollSet.has(lowerRoll)) {
          duplicateRecords.push({
            row: rowNum,
            rollNumber,
            fullName,
            reason: `Duplicate Roll Number "${rollNumber}" found within the uploaded batch.`
          });
          return;
        }

        batchRollSet.add(lowerRoll);

        validRecords.push({
          source: 'BULK_IMPORT',
          fullName,
          rollNumber,
          graduationYear: gradYear,
          branch,
          contactEmail,
          phoneNumber,
          company,
          jobRole,
          cityCountry,
          registrationStatus: 'unregistered' // Identified as Unregistered Alumni by default
        });
      });

      // Insert valid records in a transaction
      let importedCount = 0;
      if (validRecords.length > 0) {
        // SQLite supports createMany in Prisma 5+
        const result = await prisma.alumniRecord.createMany({
          data: validRecords
        });
        importedCount = result.count;
      }

      // Log to audit log
      await AuditService.log({
        userId: req.user ? req.user.id : null,
        actionType: 'ALUMNI_IMPORT',
        entityType: 'ALUMNI_RECORD',
        metadata: {
          totalSubmitted: rows.length,
          importedCount,
          duplicatesCount: duplicateRecords.length,
          invalidCount: invalidRecords.length,
          uploader: req.user ? req.user.fullName : 'Council/Admin'
        },
        ipAddress: req.ip
      });

      return res.status(200).json({
        success: true,
        message: `Successfully imported ${importedCount} alumni records.`,
        data: {
          totalProcessed: rows.length,
          importedCount,
          duplicatesCount: duplicateRecords.length,
          invalidCount: invalidRecords.length,
          duplicateRecords,
          invalidRecords
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alumni-records/unregistered
   * Fetch unregistered alumni with filters and pagination
   */
  static async getUnregistered(req, res, next) {
    try {
      const { batch, branch, search, page = 1, limit = 20 } = req.query;

      const where = {
        registrationStatus: 'unregistered'
      };

      if (batch) {
        where.graduationYear = parseInt(batch, 10);
      }
      if (branch) {
        where.branch = { contains: branch };
      }
      if (search) {
        where.OR = [
          { fullName: { contains: search } },
          { rollNumber: { contains: search } },
          { company: { contains: search } }
        ];
      }

      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      const take = parseInt(limit, 10);

      const [total, records] = await Promise.all([
        prisma.alumniRecord.count({ where }),
        prisma.alumniRecord.findMany({
          where,
          include: {
            potentialMatches: true,
            outreachLogs: { orderBy: { createdAt: 'desc' }, take: 1 }
          },
          orderBy: { graduationYear: 'desc' },
          skip,
          take
        })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          total,
          page: parseInt(page, 10),
          limit: take,
          totalPages: Math.ceil(total / take),
          records
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/alumni-records/:id
   */
  static async getRecordById(req, res, next) {
    try {
      const { id } = req.params;
      const record = await prisma.alumniRecord.findUnique({
        where: { recordId: id },
        include: {
          potentialMatches: true,
          outreachLogs: { orderBy: { createdAt: 'desc' } }
        }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Alumni record not found'
        });
      }

      return res.status(200).json({ success: true, data: record });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AlumniRecordController, upload };
