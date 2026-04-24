import { Heart, MessageCircle, Share2, MoreVertical, Clock, X, Send, Trash2, Edit2, ThumbsUp, Flag, AlertCircle, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { PostType, Comment, ReportReason } from "../../interfaces/CommunityInterfaces";
import DotBar from "./includes/DotBar";
import { useAuth } from "../../context/authContext";
import { postRequest, getRequest, deleteRequest, putRequest } from "../../api/requests";

interface SinglePostProps {
  post: {
    id: string;
    user: {
      id?: string;
      firstname: string;
      lastname: string;
      username: string;
      profile_pic: string;
    };
    title: string;
    tags: string[];
    images: string[];
    description: string;
    post_type: PostType;
    like_count: number;
    comment_count?: number;
    created_at: string;
    likers: string[];
    user_id: string;
    is_saved?: boolean;
  };
  getPostTypeStyle: (type: PostType) => {
    bg: string;
    text: string;
    border: string;
    icon: React.ReactNode;
  };
  formatDate: (dateString: string) => string;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  onLikeUpdate?: (postId: string, newLikeCount: number, isLiked: boolean) => void;
  onSavePost?: (postId: string) => Promise<void>;
  isSaving?: boolean;
  onPostClick?: (post: any) => void;
  currentUserId?: string;
  onLikePost?: (postId: string) => Promise<void>;
  isLiking?: boolean;
}

const SinglePost = ({
  post,
  getPostTypeStyle,
  formatDate,
  onEdit,
  onDelete,
  onLikeUpdate,
  onSavePost,
  isSaving = false,
  onPostClick,
}: SinglePostProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isDotBarOpen, setIsDotBarOpen] = useState(false);
  const [dotBarPosition, setDotBarPosition] = useState({ x: 0, y: 0 });
  const [isLiked, setIsLiked] = useState(post.likers?.includes(user?.id || "") || false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>("Spam");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  const postTypeStyle = getPostTypeStyle(post.post_type);
  const reportReasons: ReportReason[] = ["Spam", "Offensive", "Misinformation", "Harassment", "Inappropriate Content", "Other"];

  useEffect(() => {
    if (showComments) {
      fetchComments();
      setTimeout(() => { commentInputRef.current?.focus(); }, 300);
    }
  }, [showComments]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showComments) setShowComments(false);
        if (showReportModal) setShowReportModal(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showComments, showReportModal]);

  useEffect(() => {
    if (showReportSuccess) {
      const timer = setTimeout(() => setShowReportSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showReportSuccess]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await getRequest(`/community/post/${post.id}/comments`);
      if (response && Array.isArray(response)) setComments(response);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;
    try {
      setSubmittingComment(true);
      const response = await postRequest(`/community/post/${post.id}/comment`, { content: newComment.trim() });
      if (response) {
        setComments([response, ...comments]);
        setNewComment("");
        if (commentsContainerRef.current) commentsContainerRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    try {
      const response = await putRequest(`/community/comment/${commentId}`, { content: editingCommentText.trim() });
      if (response) {
        setComments(comments.map(c => c.id === commentId ? response : c));
        setEditingCommentId(null);
        setEditingCommentText("");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Failed to edit comment. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteRequest(`/community/comment/${commentId}`);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    try {
      await postRequest(`/community/comment/${commentId}/toggle-like`, {});
      await fetchComments();
    } catch (error) {
      console.error("Error toggling comment like:", error);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingReport) return;
    try {
      setSubmittingReport(true);
      await postRequest(`/community/post/${post.id}/report`, {
        reason: reportReason,
        description: reportDescription.trim() || undefined
      });
      setIsReported(true);
      setShowReportModal(false);
      setShowReportSuccess(true);
      setReportDescription("");
      setReportReason("Spam");
    } catch (error: any) {
      console.error("Error reporting post:", error);
      if (error.response?.status === 400) {
        alert("You have already reported this post.");
      } else {
        alert("Failed to report post. Please try again.");
      }
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleCardClick = () => { if (onPostClick) onPostClick(post); };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) { navigate("/auth/login"); return; }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const newIsLiked = !isLiked;
      const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
      setIsLiked(newIsLiked);
      setLikeCount(newLikeCount);
      const response = await postRequest(`/community/post/toogle-like/${post.id}`, {});
      let serverLikedStatus: boolean | undefined;
      if (response && typeof response === 'object') {
        if (response.liked !== undefined) serverLikedStatus = response.liked;
        else if (response.data?.liked !== undefined) serverLikedStatus = response.data.liked;
      }
      if (serverLikedStatus !== undefined) {
        if (serverLikedStatus !== newIsLiked) {
          setIsLiked(serverLikedStatus);
          setLikeCount(serverLikedStatus ? likeCount + 1 : likeCount - 1);
        }
        if (onLikeUpdate) onLikeUpdate(post.id, likeCount, serverLikedStatus);
      } else {
        setIsLiked(!newIsLiked);
        setLikeCount(likeCount);
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDotBarPosition({ x: rect.right - 220, y: rect.bottom + 10 });
    setIsDotBarOpen(true);
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowComments(true);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: post.title, text: post.description, url: `${window.location.origin}/community/post/${post.id}` });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
    }
  };

  const handleSaveClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!user?.id) { navigate("/auth/login"); return; }
    if (isSaving || isSaved) { return; } else { setIsSaved(false); }
    if (onSavePost) onSavePost(post.id);
  };

  const handleEdit = () => { if (onEdit) onEdit(post.id); };
  const handleDelete = () => { if (onDelete) onDelete(post.id); };
  const handleReport = () => setShowReportModal(true);
  const handleCopyLink = () => navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);

  const isOwner = user?.id && post.user_id ? user.id === post.user_id : false;

  return (
    <>
      <div
        className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer relative"
        onClick={handleCardClick}
      >
        {isReported && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Flag className="w-3 h-3" />
            Reported
          </div>
        )}

        {/* Post Header */}
        <div className="p-3 sm:p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <img
                src={post.user?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                alt={`${post.user?.firstname} ${post.user?.lastname}`}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{post.user?.firstname} {post.user?.lastname}</h4>
                  <span className="text-xs text-gray-500 truncate">@{post.user?.username}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${postTypeStyle.bg} ${postTypeStyle.text}`}>
                    {postTypeStyle.icon}
                    {post.post_type}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    {formatDate(post.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1" onClick={handleMenuClick}>
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Post Content */}
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">{post.title}</h3>
          <p className="text-gray-700 mb-3 sm:mb-4 line-clamp-3 text-sm">{post.description}</p>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="inline-block bg-[#fff6f6] text-[#e5989b] px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.images && post.images.length > 0 && (
            <div className={`grid gap-1.5 sm:gap-2 mb-3 sm:mb-4 ${
              post.images.length === 1 ? "grid-cols-1" :
              post.images.length === 2 ? "grid-cols-2" :
              "grid-cols-2 sm:grid-cols-3"
            }`}>
              {post.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-36 sm:h-48 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=Image+Not+Found"; }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Actions — icon-only on mobile, icon+label on sm+ */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-1">
            {/* Left: Like + Comment */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Like */}
              <button
                onClick={handleLikeClick}
                disabled={isLiking}
                className={`flex items-center gap-1 sm:gap-1.5 transition-colors group ${isLiked ? 'text-[#e5989b]' : 'text-gray-500 hover:text-[#e5989b]'} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`p-1 sm:p-1.5 rounded-full border transition-colors ${isLiked ? 'bg-[#fceaea] border-[#e5989b]/20' : 'bg-white border-gray-200 group-hover:bg-[#fceaea] group-hover:border-[#e5989b]/20'}`}>
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs sm:text-sm font-medium">{likeCount}</span>
              </button>

              {/* Comment */}
              <button
                onClick={handleCommentClick}
                className="flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-blue-600 transition-colors group"
              >
                <div className="p-1 sm:p-1.5 rounded-full bg-white border border-gray-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  {post.comment_count !== undefined && post.comment_count > 0 ? post.comment_count : 'Comment'}
                </span>
                <span className="text-xs font-medium sm:hidden">
                  {post.comment_count !== undefined && post.comment_count > 0 ? post.comment_count : ''}
                </span>
              </button>
            </div>

            {/* Right: Save + Share */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Save */}
              <button
                onClick={handleSaveClick}
                disabled={isSaved || isSaving}
                className={`flex items-center gap-1 sm:gap-1.5 transition-colors group ${isSaved ? 'text-[#e5989b]' : 'text-gray-500 hover:text-[#e5989b]'} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`p-1 sm:p-1.5 rounded-full border transition-colors ${isSaved ? 'bg-[#fceaea] border-[#e5989b]/20' : 'bg-white border-gray-200 group-hover:bg-[#fceaea] group-hover:border-[#e5989b]/20'}`}>
                  <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                  {isSaved ? 'Saved' : 'Save'}
                </span>
                {isSaving && <div className="ml-0.5 inline-block animate-spin rounded-full h-2.5 w-2.5 border-b-2 border-[#e5989b]"></div>}
              </button>

              {/* Share */}
              <button
                onClick={handleShareClick}
                className="flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-green-600 transition-colors group"
              >
                <div className="p-1 sm:p-1.5 rounded-full bg-white border border-gray-200 group-hover:bg-green-50 group-hover:border-green-200 transition-colors">
                  <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DotBar Menu */}
      <DotBar
        isOpen={isDotBarOpen}
        onClose={() => setIsDotBarOpen(false)}
        position={dotBarPosition}
        isOwner={isOwner}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReport={handleReport}
        onSave={handleSaveClick}
        onCopyLink={handleCopyLink}
      />

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setShowReportModal(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-gray-900">Report Post</h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmitReport} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value as ReportReason)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-transparent"
                  required
                >
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional details (optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Provide more context..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{reportDescription.length}/500 characters</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">Your report will be reviewed by our moderation team.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={submittingReport} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Success Toast */}
      {showReportSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className="bg-white rounded-xl shadow-2xl border border-green-200 max-w-sm">
            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">Report Submitted</span>
              </div>
              <button onClick={() => setShowReportSuccess(false)} className="p-1 hover:bg-white/50 rounded-full transition-colors">
                <X className="w-4 h-4 text-green-600" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-700">Thank you for helping keep our community safe.</p>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-b-xl" />
          </div>
        </div>
      )}

      {/* Comments Overlay */}
      {showComments && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
          onClick={() => setShowComments(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-slideUp" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Comments ({comments.length})</h3>
              <button onClick={() => setShowComments(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div ref={commentsContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e5989b]"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.user.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt={comment.user.firstname}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-sm text-gray-900">{comment.user.firstname} {comment.user.lastname}</h4>
                          {comment.user_id === user?.id && (
                            <div className="flex gap-1">
                              <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.content); }} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                                <Edit2 className="w-3 h-3 text-gray-600" />
                              </button>
                              <button onClick={() => handleDeleteComment(comment.id)} className="p-1 hover:bg-red-100 rounded-full transition-colors">
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <textarea value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none" rows={2} />
                            <div className="flex gap-2">
                              <button onClick={() => handleEditComment(comment.id)} className="px-3 py-1 bg-[#e5989b] text-white text-xs rounded-lg hover:opacity-90">Save</button>
                              <button onClick={() => { setEditingCommentId(null); setEditingCommentText(""); }} className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-400">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 px-2">
                        <button onClick={() => handleToggleCommentLike(comment.id)} className="text-xs text-gray-600 hover:text-[#e5989b] font-medium flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {comment.like_count > 0 && comment.like_count}
                        </button>
                        <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmitComment} className="flex gap-3">
                <img src={user?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="Your profile" className="w-8 h-8 rounded-full flex-shrink-0" />
                <div className="flex-1 flex gap-2">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:border-transparent"
                    rows={1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment(e); } }}
                  />
                  <button type="submit" disabled={!newComment.trim() || submittingComment} className="px-4 py-2 bg-[#e5989b] text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default SinglePost;