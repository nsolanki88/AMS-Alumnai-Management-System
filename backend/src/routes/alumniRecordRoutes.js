const express = require('express');
const router = express.Router();
const { AlumniRecordController, upload } = require('../controllers/alumniRecordController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

// All alumni record management requires COUNCIL or ADMIN
router.use(authenticateJWT);
router.use(authorizeRoles('COUNCIL', 'ADMIN'));

router.post('/upload', upload.single('file'), AlumniRecordController.uploadAndPreview);
router.post('/import', AlumniRecordController.importRecords);
router.get('/unregistered', AlumniRecordController.getUnregistered);
router.get('/:id', AlumniRecordController.getRecordById);

module.exports = router;
