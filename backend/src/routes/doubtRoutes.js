const express = require('express');
const router = express.Router();
const DoubtController = require('../controllers/doubtController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);

router.post('/', authorizeRoles('STUDENT', 'COUNCIL', 'ADMIN'), DoubtController.createDoubt);
router.get('/', DoubtController.getDoubts);
router.get('/:id', DoubtController.getDoubtById);
router.get('/:id/recommendations', DoubtController.getRecommendations);
router.post('/:id/answers', authorizeRoles('ALUMNI', 'FACULTY', 'COUNCIL', 'ADMIN'), DoubtController.createAnswer);
router.patch('/:id/answers/:answerId/helpful', DoubtController.markHelpful);
router.delete('/:id', DoubtController.deleteDoubt);

module.exports = router;
