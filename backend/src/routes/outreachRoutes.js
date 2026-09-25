const express = require('express');
const router = express.Router();
const OutreachController = require('../controllers/outreachController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// Council and Admin only
router.use(authenticateJWT);
router.use(authorizeRoles('COUNCIL', 'ADMIN'));

router.post('/', OutreachController.logOutreach);
router.get('/', OutreachController.getOutreachList);
router.get('/:recordId', OutreachController.getHistoryForRecord);

module.exports = router;
