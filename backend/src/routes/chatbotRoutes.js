const express = require('express');
const router = express.Router();
const ChatbotController = require('../controllers/chatbotController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);

router.post('/query', ChatbotController.processQuery);
router.get('/logs', authorizeRoles('ADMIN'), ChatbotController.getLogs);

module.exports = router;
