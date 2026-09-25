import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MessageSquare, Trash2, AlertTriangle, Shield, Check } from 'lucide-react';

export default function CouncilBatchGroups() {
  const [groups, setGroups] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2022);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/batch-groups');
      if (res.data?.success && res.data.data.length > 0) {
        setGroups(res.data.data);
        setSelectedYear(res.data.data[0].graduationYear);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchBatchFeed = async () => {
    if (!selectedYear) return;
    setLoading(true);
    try {
      const res = await api.get(`/batch-groups/${selectedYear}`);
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
  }, [selectedYear]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to moderate and delete this post? An audit log will be generated.')) return;

    try {
      await api.delete(`/batch-groups/posts/${postId}`);
      fetchBatchFeed();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Batch Community Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Inspect batch community posts and discussions. Moderate content violating university guidelines.
        </p>
      </div>

      {/* Batch Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedYear(g.graduationYear)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedYear === g.graduationYear
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading batch posts...</div>
      ) : !groupData || !groupData.posts || groupData.posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
          No posts currently in {groupData?.name || 'this batch group'}.
        </div>
      ) : (
        <div className="space-y-4">
          {groupData.posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {post.postType}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{post.author?.fullName}</span>
                  <span className="text-[10px] text-slate-400">
                    ({post.author?.role}) • {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{post.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{post.content}</p>
                <div className="text-[11px] text-slate-400 pt-1">
                  {post.reactions?.length || 0} Likes • {post.comments?.length || 0} Comments
                </div>
              </div>

              <button
                onClick={() => handleDeletePost(post.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5 flex-shrink-0 transition-colors"
                title="Moderate & Delete Post"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Moderate
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
