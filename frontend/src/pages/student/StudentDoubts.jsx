import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { HelpCircle, Plus, Sparkles, MessageSquare, CheckCircle, ThumbsUp, Send, Check, X, Bot, Award } from 'lucide-react';

export default function StudentDoubts() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('doubtId');

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [myDoubtsFilter, setMyDoubtsFilter] = useState(false);

  // New Doubt Modal
  const [showAskModal, setShowAskModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Interview Preparation');
  const [submitting, setSubmitting] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);

  // Active Doubt Detail Drawer / Modal
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [answerInput, setAnswerInput] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchDoubts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (myDoubtsFilter) params.myDoubts = 'true';

      const res = await api.get('/doubts', { params });
      if (res.data?.success) {
        setDoubts(res.data.data.doubts);
        // If query param highlightId exists, open it
        if (highlightId && !selectedDoubt) {
          const matched = res.data.data.doubts.find(d => d.id === highlightId);
          if (matched) loadDoubtDetails(matched.id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, [categoryFilter, myDoubtsFilter]);

  const loadDoubtDetails = async (id) => {
    try {
      const res = await api.get(`/doubts/${id}`);
      if (res.data?.success) {
        setSelectedDoubt(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);

    try {
      const res = await api.post('/doubts', {
        title,
        description,
        category
      });

      if (res.data?.success) {
        setAiAnalysisResult(res.data.data);
        fetchDoubts();
        // Keep modal open briefly to show AI recommendations
        setTimeout(() => {
          setShowAskModal(false);
          setAiAnalysisResult(null);
          setTitle('');
          setDescription('');
        }, 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerInput.trim() || !selectedDoubt) return;
    setSubmittingAnswer(true);

    try {
      const res = await api.post(`/doubts/${selectedDoubt.id}/answers`, {
        content: answerInput.trim()
      });
      if (res.data?.success) {
        setAnswerInput('');
        loadDoubtDetails(selectedDoubt.id);
        fetchDoubts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleMarkHelpful = async (answerId) => {
    try {
      await api.patch(`/doubts/${selectedDoubt.id}/answers/${answerId}/helpful`);
      loadDoubtDetails(selectedDoubt.id);
      fetchDoubts();
    } catch (e) {
      console.error(e);
    }
  };

  const categories = [
    'All',
    'Interview Preparation',
    'Higher Studies',
    'Career Switch',
    'Technical',
    'Career Guidance',
    'Other'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Student Doubts & Q&A</h1>
          <p className="text-xs text-slate-500 mt-1">
            Ask career, technical, and higher education questions. Our AI engine classifies your query and routes it to verified alumni mentors.
          </p>
        </div>
        <button
          onClick={() => setShowAskModal(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Ask a Doubt
        </button>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={myDoubtsFilter}
              onChange={(e) => setMyDoubtsFilter(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Only My Questions
          </label>
        </div>
      </div>

      {/* Doubts Feed */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 text-xs">Loading doubts...</div>
      ) : doubts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-semibold text-sm">No doubts found in this category</p>
          <p className="text-xs text-slate-400 mt-1">Be the first to post a question for alumni mentors!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {doubts.map((doubt) => (
            <div
              key={doubt.id}
              onClick={() => loadDoubtDetails(doubt.id)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {doubt.category}
                    </span>
                    {doubt.hasHelpfulAnswer && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Solved
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      by {doubt.student?.fullName || 'Student'} • {new Date(doubt.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{doubt.title}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {doubt.description}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {doubt.answerCount || 0}
                  </span>
                </div>
              </div>

              {/* Skills tags */}
              {doubt.extractedSkills && doubt.extractedSkills.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 mr-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> AI Topics:
                  </span>
                  {doubt.extractedSkills.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask Doubt Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Ask Career / Academic Doubt</h3>
              </div>
              <button onClick={() => setShowAskModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiAnalysisResult ? (
              <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  AI Classification & Mentors Notified!
                </div>
                <p className="text-xs text-blue-900">
                  Question classified as: <span className="font-semibold">{aiAnalysisResult.doubt.category}</span>
                </p>
                <div className="text-xs text-blue-900">
                  Extracted Skills: <span className="font-semibold">{aiAnalysisResult.doubt.extractedSkills.join(', ')}</span>
                </div>
                {aiAnalysisResult.aiRecommendations?.length > 0 && (
                  <div className="pt-2 border-t border-blue-200 text-xs">
                    <p className="font-semibold text-blue-900 mb-1">Top Recommended Alumni:</p>
                    <ul className="space-y-1">
                      {aiAnalysisResult.aiRecommendations.slice(0, 3).map((r, i) => (
                        <li key={i} className="text-slate-700">
                          • {r.fullName} ({r.currentRole} at {r.currentCompany}) — {r.recommendationScore}% match
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCreateDoubt} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Question Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800"
                  >
                    <option value="Interview Preparation">Interview Preparation</option>
                    <option value="Higher Studies">Higher Studies</option>
                    <option value="Career Switch">Career Switch</option>
                    <option value="Technical">Technical</option>
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Core Question</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. How to prepare for AWS DevOps certifications as a fresh graduate?"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description & Context</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide relevant details, what you've tried, or your background so alumni can give actionable answers..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {submitting ? 'Analyzing & Routing...' : 'Post Question'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Doubt Detail Modal */}
      {selectedDoubt && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {selectedDoubt.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{selectedDoubt.title}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Asked by {selectedDoubt.student?.fullName} ({selectedDoubt.student?.department || 'Student'})
                </p>
              </div>
              <button onClick={() => setSelectedDoubt(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Question Content */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                {selectedDoubt.description}
              </div>

              {/* AI Recommended Mentors list */}
              {selectedDoubt.aiRecommendations && selectedDoubt.aiRecommendations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    AI Recommended Alumni Mentors for this Question:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedDoubt.aiRecommendations.slice(0, 2).map((rec, i) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-blue-200/60 shadow-xs text-[11px]">
                        <span className="font-semibold text-slate-800">{rec.fullName}</span>
                        <p className="text-slate-500 text-[10px]">{rec.currentRole} at {rec.currentCompany}</p>
                        <p className="text-blue-600 text-[10px] font-medium mt-0.5">Score: {rec.recommendationScore}% match</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answers Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  Alumni Answers ({selectedDoubt.answers?.length || 0})
                </h4>

                {selectedDoubt.answers?.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No answers posted yet. Recommended alumni have been notified.
                  </p>
                ) : (
                  selectedDoubt.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-xl border transition-all ${
                        ans.isHelpful
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {ans.alumnus?.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900">{ans.alumnus?.fullName}</span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              {ans.alumnus?.alumniProfile?.currentRole} @ {ans.alumnus?.alumniProfile?.currentCompany}
                            </span>
                          </div>
                        </div>

                        {ans.isHelpful ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Most Helpful Answer
                          </span>
                        ) : (
                          // If author of the question or admin, allow marking helpful
                          (selectedDoubt.studentId === user.id || user.role === 'ADMIN') && (
                            <button
                              onClick={() => handleMarkHelpful(ans.id)}
                              className="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
                            >
                              <ThumbsUp className="w-3 h-3" /> Mark as Helpful
                            </button>
                          )
                        )}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pl-9">
                        {ans.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Answer Box if Alumni or Faculty */}
            {['ALUMNI', 'FACULTY', 'COUNCIL', 'ADMIN'].includes(user.role) && (
              <form onSubmit={handlePostAnswer} className="p-4 border-t border-slate-100 flex gap-2 bg-slate-50">
                <input
                  type="text"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Provide your advice or answer..."
                  className="flex-1 text-xs bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={submittingAnswer || !answerInput.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
