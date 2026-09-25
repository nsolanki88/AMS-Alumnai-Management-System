import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Plus, Heart, MessageCircle, Send, Briefcase, Megaphone, X } from 'lucide-react';

export default function AlumniCommunity() {
  const { user } = useAuth();
  const gradYear = user?.alumniProfile?.graduationYear || 2022;

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Post Modal
  const [showPostModal, setShowPostModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('discussion');
  const [submitting, setSubmitting] = useState(false);

  // Comment input state keyed by postId
  const [commentInputs, setCommentInputs] = useState({});

  const fetchBatchFeed = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/batch-groups/${gradYear}`);
      if (res.data?.success) {
        setGroupData(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchFeed();
  }, [gradYear]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/batch-groups/${gradYear}/posts`, {
        title,
        content,
        postType
      });
      if (res.data?.success) {
        setShowPostModal(false);
        setTitle('');
        setContent('');
        fetchBatchFeed();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleReaction = async (postId) => {
    try {
      await api.post(`/batch-groups/posts/${postId}/reactions`, { reactionType: 'like' });
      fetchBatchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/batch-groups/posts/${postId}/comments`, { content: text.trim() });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      fetchBatchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Batch {gradYear} Official Community
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Connect with your graduating class, share job referrals, organize reunions, and discuss industry developments.
          </p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Post / Share Job
        </button>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading batch discussions...</div>
      ) : !groupData || !groupData.posts || groupData.posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No posts in Batch {gradYear} yet</p>
          <p className="text-xs text-slate-400 mt-1">Share an update, referral opportunity, or greeting to get started!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {groupData.posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {post.author?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{post.author?.fullName}</h4>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      {post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {post.postType}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{post.title}</h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
              </div>

              {/* Actions & Reactions */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
                <button
                  onClick={() => handleToggleReaction(post.id)}
                  className="text-xs text-slate-600 hover:text-rose-600 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span>{post.reactions?.length || 0} Likes</span>
                </button>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span>{post.comments?.length || 0} Comments</span>
                </span>
              </div>

              {/* Comments list */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {post.comments.map((c) => (
                    <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl text-xs">
                      <span className="font-bold text-slate-800 mr-2">{c.author?.fullName}:</span>
                      <span className="text-slate-700">{c.content}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentInputs[post.id] || ''}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  placeholder="Write a reply..."
                  className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleAddComment(post.id)}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Post in Batch {gradYear} Group</h3>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Post Type</label>
                <select
                  value={postType}
                  onChange={(e) => setPostType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                >
                  <option value="discussion">Discussion / General Post</option>
                  <option value="job">Job / Internship Opportunity</option>
                  <option value="announcement">Announcement</option>
                  <option value="event">Alumni Meetup / Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hiring Software Engineers for Cloud Platform team"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Message</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share details, links, or discussion points..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  {submitting ? 'Posting...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
