import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CommunityPost } from '../../types';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Users,
  MessageSquare,
  Heart,
  Bookmark,
  Share2,
  Plus,
  Search,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  Flag,
  MapPin,
  Sparkles,
  X,
  ShieldCheck
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const {
    communityPosts,
    addCommunityPost,
    toggleLikePost,
    addCommentToPost,
    toggleSavePost,
    profile,
    language,
    showToast
  } = useApp();

  const isHindi = language === 'hi' || language === 'cg';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropTag, setSelectedCropTag] = useState('all');
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // Ask question form
  const [questionText, setQuestionText] = useState('');
  const [questionCropTag, setQuestionCropTag] = useState('धान');
  const [questionImage, setQuestionImage] = useState<string | null>(null);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    addCommunityPost({
      authorName: profile.name,
      authorDistrict: profile.district,
      authorRole: 'किसान साथी',
      isExpert: false,
      cropTag: questionCropTag,
      questionText: questionText.trim(),
      imageUrl: questionImage || undefined
    });

    setQuestionText('');
    setQuestionImage(null);
    setIsAskModalOpen(false);
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    addCommentToPost(postId, commentInput.trim());
    setCommentInput('');
    setActiveCommentPostId(null);
  };

  const handleReportPost = (postId: string) => {
    showToast(isHindi ? 'रिपोर्ट दर्ज की गई। मॉडरेटर 24 घंटे में समीक्षा करेंगे।' : 'Post reported. Moderators will review.', 'info');
  };

  const filteredPosts = communityPosts.filter(p => {
    const matchesSearch =
      p.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cropTag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCrop = selectedCropTag === 'all' || p.cropTag.includes(selectedCropTag);
    return matchesSearch && matchesCrop;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-[#087A43]" />
            <span>{isHindi ? 'किसान चौपाल' : 'Farmer Community'}</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isHindi
              ? 'लाखों साथी किसानों और कृषि वैज्ञानिकों से सवाल पूछें व अनुभव साझा करें'
              : 'Connect with fellow farmers and agricultural scientists to ask questions and share insights'}
          </p>
        </div>

        <button
          onClick={() => setIsAskModalOpen(true)}
          className="px-4 py-2.5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isHindi ? 'नया सवाल पूछें' : 'Ask a Question'}</span>
        </button>
      </div>

      {/* Search & Topic Filters */}
      <div className="bg-white p-4 rounded-3xl border border-[#E5EBE1] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="चौपाल में सवाल, रोग या फसल का नाम खोजें..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 rounded-2xl border border-gray-200 focus:bg-white focus:outline-hidden focus:border-[#087A43]"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'धान', 'सब्जी', 'जैविक', 'गेहूं'].map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedCropTag(tag)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCropTag === tag
                    ? 'bg-[#087A43] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag === 'all' ? 'सभी चर्चाएं' : tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Feed */}
      <div className="space-y-4 max-w-3xl mx-auto">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl p-5 border border-[#E5EBE1] shadow-2xs space-y-4 hover:border-emerald-300 transition-colors"
          >
            {/* Post Author Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm ring-2 ring-emerald-200">
                  {post.authorName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">{post.authorName}</h3>
                    {post.isExpert && (
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> KVK विशेषज्ञ
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{post.authorDistrict}</span>
                    <span>•</span>
                    <span>{post.createdAt}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold bg-[#EAF6E9] text-[#075B35] px-2.5 py-1 rounded-full">
                  #{post.cropTag}
                </span>
                <button
                  onClick={() => handleReportPost(post.id)}
                  className="p-1.5 text-gray-300 hover:text-gray-600 transition-colors"
                  title="Report post"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-normal">
              {post.questionText}
            </p>

            {/* Post Image Attachment */}
            {post.imageUrl && (
              <div className="rounded-2xl overflow-hidden max-h-72 border border-gray-100">
                <img
                  src={post.imageUrl}
                  alt="Post Attachment"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Actions: Likes, Comments Count, Save */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleLikePost(post.id)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    post.hasLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-rose-600' : ''}`} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                  className="flex items-center gap-1.5 hover:text-[#087A43] transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments.length} उत्तर</span>
                </button>
              </div>

              <button
                onClick={() => toggleSavePost(post.id)}
                className="hover:text-purple-600 transition-colors p-1"
                title="Save"
              >
                <Bookmark className={`w-4 h-4 ${post.saved ? 'fill-purple-600 text-purple-600' : ''}`} />
              </button>
            </div>

            {/* Comments Thread (including verified expert answers) */}
            {post.comments.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100">
                {post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-2xl text-xs space-y-1 ${
                      comment.isExpert
                        ? 'bg-blue-50/80 border border-blue-200'
                        : 'bg-[#FAFBF7] border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900">{comment.authorName}</span>
                        {comment.isExpert && (
                          <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-full">
                            सत्यापित विशेषज्ञ ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">{comment.date}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed font-normal">{comment.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Comment Input Form */}
            {activeCommentPostId === post.id && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="अपना जवाब या सुझाव लिखें..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(post.id)}
                  className="p-2 bg-[#087A43] hover:bg-[#075B35] text-white rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ask Question Modal */}
      {isAskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#087A43]" />
                <span>किसान चौपाल में नया सवाल पूछें</span>
              </h3>
              <button
                onClick={() => setIsAskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  फसल या विषय टैग चुनें
                </label>
                <select
                  value={questionCropTag}
                  onChange={(e) => setQuestionCropTag(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                >
                  <option value="धान">{isHindi ? 'धान' : 'Paddy'}</option>
                  <option value="गेहूं">{isHindi ? 'गेहूं' : 'Wheat'}</option>
                  <option value="सोयाबीन">{isHindi ? 'सोयाबीन' : 'Soybean'}</option>
                  <option value="सब्जी उत्पादन">{isHindi ? 'सब्जी उत्पादन' : 'Vegetables'}</option>
                  <option value="जैविक खेती">{isHindi ? 'जैविक खेती' : 'Organic Farming'}</option>
                  <option value="सरकारी योजना">{isHindi ? 'सरकारी योजना' : 'Govt Schemes'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  अपनी समस्या या सवाल विस्तार से लिखें *
                </label>
                <textarea
                  rows={4}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="उदा. मेरी धान की फसल में पत्तियों के ऊपरी किनारे पीले पड़ रहे हैं... क्या उपाय करना चाहिए?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-hidden focus:border-[#087A43]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#087A43] hover:bg-[#075B35] rounded-xl"
                >
                  सवाल प्रकाशित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
