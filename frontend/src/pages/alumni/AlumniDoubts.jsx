import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, MessageSquare, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function AlumniDoubts() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/doubts');
      if (res.data?.success) {
        setDoubts(res.data.data.doubts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!activeDoubt || !answerContent.trim()) return;
    setSubmitting(true);
    setFeedback('');

    try {
      const res = await api.post(`/doubts/${activeDoubt.id}/answers`, {
        content: answerContent.trim()
      });
      if (res.data?.success) {
        setFeedback('Your answer was posted and the student has been notified!');
        setAnswerContent('');
        fetchDoubts();
        // Update active doubt
        const detailRes = await api.get(`/doubts/${activeDoubt.id}`);
        if (detailRes.data?.success) {
          setActiveDoubt(detailRes.data.data);
        }
      }
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to post answer');
    } finally {
      setSubmitting(false);
    }
  };

  const openDoubt = async (d) => {
    setActiveDoubt(d);
    try {
      const res = await api.get(`/doubts/${d.id}`);
      if (res.data?.success) {
        setActiveDoubt(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Answer Student Doubts</h1>
        <p className="text-xs text-slate-500 mt-1">
          Share your industry insights and practical guidance. Questions are matched to your verified skills by our AI engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Doubts list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Questions</h2>
          {loading ? (
            <div className="text-xs text-slate-400 py-10 text-center">Loading questions...</div>
          ) : doubts.length === 0 ? (
            <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
              No doubts currently open.
            </div>
          ) : (
            doubts.map((d) => (
              <div
                key={d.id}
                onClick={() => openDoubt(d)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeDoubt?.id === d.id
                    ? 'bg-blue-50 border-blue-400 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                    {d.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2">{d.title}</h3>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>by {d.student?.fullName}</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {d.answerCount || 0}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Active Doubt Detail & Answer Editor */}
        <div className="lg:col-span-2">
          {activeDoubt ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {activeDoubt.category}
                </span>
                <h2 className="text-base font-bold text-slate-900 mt-2">{activeDoubt.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Asked by {activeDoubt.student?.fullName} ({activeDoubt.student?.department || 'Student'})
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {activeDoubt.description}
              </div>

              {/* Skills tags */}
              {activeDoubt.extractedSkills && activeDoubt.extractedSkills.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> AI Skill Tags:
                  </span>
                  {activeDoubt.extractedSkills.map((s, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Existing Answers */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Existing Answers ({activeDoubt.answers?.length || 0})
                </h3>

                {activeDoubt.answers?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No one has answered yet. Be the first!</p>
                ) : (
                  activeDoubt.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className={`p-3.5 rounded-xl border ${
                        ans.isHelpful ? 'bg-emerald-50/60 border-emerald-300' : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-800">{ans.alumnus?.fullName}</span>
                        {ans.isHelpful && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Marked Most Helpful
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{ans.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Answer Input */}
              <form onSubmit={handlePostAnswer} className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900">Your Answer / Professional Guidance</h3>
                {feedback && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg">
                    {feedback}
                  </div>
                )}
                <textarea
                  rows={4}
                  required
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="Provide concrete advice, recommended frameworks, or resources..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submitting || !answerContent.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Submitting...' : 'Post Answer'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a question from the left list to review details and post your guidance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
