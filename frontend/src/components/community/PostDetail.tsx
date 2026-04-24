import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, MessageCircle,
  TrendingUp, Users, AlertCircle, Calendar, ArrowUpRight,
} from "lucide-react";
import type { Post, PostType } from "../../interfaces/CommunityInterfaces";

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
}

const getPostTypeStyle = (type: PostType) => {
  const styles: Record<string, any> = {
    Advice: {
      bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    Discussion: {
      bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200",
      icon: <MessageCircle className="w-3.5 h-3.5" />,
    },
    Support: {
      bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200",
      icon: <Users className="w-3.5 h-3.5" />,
    },
  };
  return styles[type] || {
    bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
  };
};

const formatFullDate = (dateString: string) => {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const PostDetailModal = ({ post, onClose }: PostDetailModalProps) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);

  const typeStyle = getPostTypeStyle(post.post_type);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { 
      if (e.key === "Escape") onClose(); 
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { 
      document.body.style.overflow = "unset"; 
    };
  }, []);

  const avatarSrc =
    post.user?.profile_pic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${post.user?.firstname} ${post.user?.lastname}`
    )}&background=fce4ec&color=c2185b&bold=true`;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "90vh",
          animation: "modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#e5989b] via-[#f4b8ba] to-[#e5989b]" />

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={avatarSrc}
                alt={post.user?.username}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {post.user?.firstname} {post.user?.lastname}
              </p>
              <p className="text-xs text-gray-400 truncate">@{post.user?.username}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {post.post_type && (
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                {typeStyle.icon}
                {post.post_type}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 pb-6">
          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
            {post.title}
          </h2>

          {/* Full description */}
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-5">
            {post.description}
          </p>

          {/* Images - full width, stacked */}
          {post.images && post.images.length > 0 && (
            <div className="flex flex-col gap-3 mb-5">
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Image ${i + 1}`}
                  className="rounded-2xl w-full object-cover"
                />
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {post.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-[#fff0f0] text-[#e5989b] text-xs font-medium rounded-full border border-[#f4d0d1]">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{formatFullDate(post.created_at)}</span>
          </div>
        </div>

        {/* Footer - comments only */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/70 shrink-0">
          <button
            onClick={() => { 
              onClose(); 
              navigate(`/community/post/${post.id}`); 
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-sky-500 transition-colors"
          >
            <MessageCircle size={19} />
            <span>{post.comment_count || 0} comments</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
};

export default PostDetailModal;