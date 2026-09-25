const express = require('express');
const router = express.Router();
const FacultyController = require('../controllers/facultyController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);
router.use(authorizeRoles('FACULTY', 'ADMIN'));

router.post('/endorse', FacultyController.endorseAlumnus);
router.get('/endorsements', FacultyController.getMyEndorsements);
router.get('/department-alumni', FacultyController.getDepartmentAlumni);

module.exports = router;
