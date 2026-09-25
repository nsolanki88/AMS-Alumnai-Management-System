const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/referralController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);

router.post('/', authorizeRoles('ALUMNI', 'COUNCIL', 'ADMIN'), ReferralController.createReferral);
router.get('/', ReferralController.getReferrals);
router.patch('/:id/verify', authorizeRoles('COUNCIL', 'ADMIN'), ReferralController.verifyReferral);

module.exports = router;
