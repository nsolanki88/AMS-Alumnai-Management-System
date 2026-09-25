const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);

module.exports = router;
