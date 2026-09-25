const prisma = require('../config/prisma');
const AuditService = require('../services/auditService');
const NotificationService = require('../services/notificationService');

class BatchGroupController {
  /**
   * GET /api/batch-groups
   * List all created batch groups with member and post counts
   */
  static async listGroups(req, res, next) {
    try {
      const groups = await prisma.batchGroup.findMany({
        include: {
          _count: {
            select: { posts: true }
          }
        },
        orderBy: { graduationYear: 'desc' }
      });

      return res.status(200).json({
        success: true,
        data: groups
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/batch-groups/:year
   * Get batch group feed, posts, comments, and reactions
   */
  static async getGroupByYear(req, res, next) {
    try {
      const year = parseInt(req.params.year, 10);
      if (isNaN(year)) {
        return res.status(400).json({ success: false, message: 'Invalid graduation year' });
      }

      let group = await prisma.batchGroup.findUnique({
        where: { graduationYear: year },
        include: {
          posts: {
            include: {
              author: {
                select: { id: true, fullName: true, role: true, department: true }
              },
              comments: {
                include: {
                  author: { select: { id: true, fullName: true, role: true } }
                },
                orderBy: { createdAt: 'asc' }
              },
              reactions: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!group) {
        // Auto-initialize group if it doesn't exist yet
        group = await prisma.batchGroup.create({
          data: {
            graduationYear: year,
            name: `Batch ${year}`,
            description: `Official batch community and network for graduates of Class of ${year}.`
          },
          include: { posts: true }
        });
      }

      return res.status(200).json({
        success: true,
        data: group
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/batch-groups/:year/posts
   * Create a new post in the batch group
   */
  static async createPost(req, res, next) {
    try {
      const year = parseInt(req.params.year, 10);
      const { title, content, postType = 'discussion', attachments } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Post title and content are required'
        });
      }

      // Find or create group
      let group = await prisma.batchGroup.findUnique({
        where: { graduationYear: year }
      });
      if (!group) {
        group = await prisma.batchGroup.create({
          data: {
            graduationYear: year,
            name: `Batch ${year}`,
            description: `Official batch community for Class of ${year}`
          }
        });
      }

      const post = await prisma.groupPost.create({
        data: {
          groupId: group.id,
          authorId: req.user.id,
          title,
          content,
          postType,
          attachments: attachments ? JSON.stringify(attachments) : null
        },
        include: {
          author: { select: { id: true, fullName: true, role: true } },
          comments: true,
          reactions: true
        }
      });

      // If announcement or event, notify batch alumni
      if (['announcement', 'event', 'workshop'].includes(postType)) {
        const batchUsers = await prisma.alumniProfile.findMany({
          where: { graduationYear: year },
          select: { userId: true }
        });

        // Notify in background
        Promise.all(batchUsers.map(u => {
          if (u.userId !== req.user.id) {
            return NotificationService.notify({
              userId: u.userId,
              title: `New Batch ${year} Announcement: ${title}`,
              message: `${req.user.fullName} posted: "${content.substring(0, 100)}..."`,
              type: 'announcement'
            });
          }
        })).catch(e => console.error('Notification dispatch error:', e));
      }

      return res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/batch-groups/posts/:id/comments
   */
  static async addComment(req, res, next) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, message: 'Comment text is required' });
      }

      const comment = await prisma.postComment.create({
        data: {
          postId: id,
          authorId: req.user.id,
          content: content.trim()
        },
        include: {
          author: { select: { id: true, fullName: true, role: true } }
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Comment added',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/batch-groups/posts/:id/reactions
   */
  static async toggleReaction(req, res, next) {
    try {
      const { id } = req.params;
      const { reactionType = 'like' } = req.body;

      const existing = await prisma.postReaction.findUnique({
        where: {
          postId_userId: {
            postId: id,
            userId: req.user.id
          }
        }
      });

      if (existing) {
        if (existing.reactionType === reactionType) {
          // Remove reaction
          await prisma.postReaction.delete({ where: { id: existing.id } });
          return res.status(200).json({ success: true, message: 'Reaction removed', data: null });
        } else {
          // Update reaction
          const updated = await prisma.postReaction.update({
            where: { id: existing.id },
            data: { reactionType }
          });
          return res.status(200).json({ success: true, message: 'Reaction updated', data: updated });
        }
      }

      const reaction = await prisma.postReaction.create({
        data: {
          postId: id,
          userId: req.user.id,
          reactionType
        }
      });

      return res.status(201).json({ success: true, message: 'Reaction added', data: reaction });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/batch-groups/posts/:id
   * Author or Council/Admin moderation
   */
  static async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const post = await prisma.groupPost.findUnique({ where: { id } });

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const isAuthor = post.authorId === req.user.id;
      const isPrivileged = ['COUNCIL', 'ADMIN'].includes(req.user.role);

      if (!isAuthor && !isPrivileged) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied. Only author or Council/Admin can moderate this post.'
        });
      }

      await prisma.groupPost.delete({ where: { id } });

      if (isPrivileged && !isAuthor) {
        await AuditService.log({
          userId: req.user.id,
          actionType: 'POST_MODERATED',
          entityType: 'POST',
          entityId: id,
          metadata: { postTitle: post.title, authorId: post.authorId },
          ipAddress: req.ip
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Post successfully deleted'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BatchGroupController;
