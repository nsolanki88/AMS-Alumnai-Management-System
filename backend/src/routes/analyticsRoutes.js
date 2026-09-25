const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);
router.use(authorizeRoles('FACULTY', 'COUNCIL', 'ADMIN'));

router.get('/summary', AnalyticsController.getSummary);
router.get('/export-pdf', AnalyticsController.exportPdf);

module.exports = router;
