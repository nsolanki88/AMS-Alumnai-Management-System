import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { MessageSquare, Heart, MessageCircle, Megaphone, Briefcase } from 'lucide-react';

export default function StudentCommunity() {
  const [groups, setGroups] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2022);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchGroups();
  }, []);

  useEffect(() => {
    if (!selectedYear) return;
    const fetchFeed = async () => {
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
    fetchFeed();
  }, [selectedYear]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Batch Communities & Discussions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore official batch group feeds, career opportunities, and homecoming announcements.
        </p>
      </div>

      {/* Batch Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedYear(g.graduationYear)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedYear === g.graduationYear
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading batch posts...</div>
      ) : !groupData || !groupData.posts || groupData.posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No community posts yet in {groupData?.name || 'this batch'}</p>
          <p className="text-xs text-slate-400 mt-1">Alumni will share opportunities and events here.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {groupData.posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
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

                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {post.postType}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{post.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  {post.reactions?.length || 0} reactions
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                  {post.comments?.length || 0} comments
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
