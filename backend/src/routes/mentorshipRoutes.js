const express = require('express');
const router = express.Router();
const MentorshipController = require('../controllers/mentorshipController');
const { authenticateJWT } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.use(authenticateJWT);

router.post('/profile', authorizeRoles('ALUMNI', 'COUNCIL', 'ADMIN'), MentorshipController.upsertMentorshipProfile);
router.get('/mentors', MentorshipController.getMentors);
router.post('/invitations', MentorshipController.createInvitation);
router.get('/invitations', MentorshipController.getInvitations);
router.patch('/invitations/:id', MentorshipController.updateInvitationStatus);
router.get('/calendar', MentorshipController.getCalendar);

module.exports = router;
