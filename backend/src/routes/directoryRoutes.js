const express = require('express');
const router = express.Router();
const DirectoryController = require('../controllers/directoryController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/', DirectoryController.getDirectory);
router.get('/:id', DirectoryController.getAlumniById);

module.exports = router;
