const express = require('express');
const router = express.Router();
const BatchGroupController = require('../controllers/batchGroupController');
const { authenticateJWT } = require('../middleware/auth');

router.use(authenticateJWT);

router.get('/', BatchGroupController.listGroups);
router.get('/:year', BatchGroupController.getGroupByYear);
router.post('/:year/posts', BatchGroupController.createPost);
router.post('/posts/:id/comments', BatchGroupController.addComment);
router.post('/posts/:id/reactions', BatchGroupController.toggleReaction);
router.delete('/posts/:id', BatchGroupController.deletePost);

module.exports = router;
