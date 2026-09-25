const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);
router.use(authorizeRoles('ADMIN'));

router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/lock', AdminController.toggleUserLock);
router.get('/audit-log', AdminController.getAuditLogs);

module.exports = router;
