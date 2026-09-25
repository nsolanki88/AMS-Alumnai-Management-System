const express = require('express');
const router = express.Router();
const DiscoveryController = require('../controllers/discoveryController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');
const { discoveryLimiter } = require('../middleware/rateLimiter');

// Council and Admin only
router.use(authenticateJWT);
router.use(authorizeRoles('COUNCIL', 'ADMIN'));

router.post('/run', discoveryLimiter, DiscoveryController.runDiscovery);
router.get('/matches/:recordId', DiscoveryController.getMatchesForRecord);

module.exports = router;
