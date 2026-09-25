const express = require('express');
const router = express.Router();
const VerificationController = require('../controllers/verificationController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// Council & Admin only
router.use(authenticateJWT);
router.use(authorizeRoles('COUNCIL', 'ADMIN'));

router.get('/dashboard', VerificationController.getDashboard);
router.patch('/:id/verify', VerificationController.verifyMatch);
router.patch('/:id/reject', VerificationController.rejectMatch);
router.patch('/:id/uncertain', VerificationController.markUncertain);

module.exports = router;
