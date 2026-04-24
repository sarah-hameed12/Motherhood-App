import { useState, useEffect, useCallback } from "react";
import { postRequest, getRequest } from "../../api/requests";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

import {
  MessageCircle, AlertCircle, TrendingUp, Users, Plus, X, Clock, ShieldAlert, FileText,
} from "lucide-react";
import SuccessToast from "./SuccessToast";
import CreatePostModal from "./CreatePost";
import SinglePost from "./SinglePost";
import PostDetailModal from "./PostDetail";
import type { Post, PostType } from "../../interfaces/CommunityInterfaces";

const CommunityCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  const [showReportsModal, setShowReportsModal] = useState<boolean>(false);
  const [showMyPostsModal, setShowMyPostsModal] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState<boolean>(false);
  const [showPostDetailModal, setShowPostDetailModal] = useState<boolean>(false);

  const [myReports, setMyReports] = useState<any[]>([]);
  const [myOwnPosts, setMyOwnPosts] = useState<any[]>([]);
  const [memberList, setMemberList] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [createdPostId, setCreatedPostId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<Record<string, boolean>>({});

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Normalise whatever the API returns into a plain array.
   * Handles: plain array, { results: [] }, { data: [] }, { posts: [] }, or null/undefined.
   */
  const toArray = (response: any): any[] => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    // Common DRF pagination wrapper
    if (Array.isArray(response.results)) return response.results;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.posts)) return response.posts;
    return [];
  };

  // ---------------------------------------------------------------------------
  // Fetch posts — with retry for Railway cold-start / empty-first-response
  // ---------------------------------------------------------------------------
  const fetchPosts = useCallback(async (retries = 2) => {
    try {
      setLoading(true);

      // Try without trailing slash first (Railway nginx can be strict)
      const response = await getRequest("/community/feed");
      const data = toArray(response);

      if (data.length === 0 && retries > 0) {
        // Wait 1.5 s then retry — handles cold DB / caching race on Railway
        setTimeout(() => fetchPosts(retries - 1), 1500);
        return;
      }

      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Event-listener wiring
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleOpenCreate  = () => setShowModal(true);
    const handleOpenReports = () => { setShowReportsModal(true); fetchMyReports(); };
    const handleOpenMyPosts = () => { setShowMyPostsModal(true); fetchMyOwnPosts(); };
    const handleOpenMembers = () => { setShowMembersModal(true); fetchMembers(); };

    window.addEventListener("open-community-create-modal",  handleOpenCreate);
    window.addEventListener("open-community-reports-modal", handleOpenReports);
    window.addEventListener("open-community-myposts-modal", handleOpenMyPosts);
    window.addEventListener("open-community-members-modal", handleOpenMembers);

    return () => {
      window.removeEventListener("open-community-create-modal",  handleOpenCreate);
      window.removeEventListener("open-community-reports-modal", handleOpenReports);
      window.removeEventListener("open-community-myposts-modal", handleOpenMyPosts);
      window.removeEventListener("open-community-members-modal", handleOpenMembers);
    };
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ---------------------------------------------------------------------------
  // Modal data fetchers
  // ---------------------------------------------------------------------------
  const fetchMyReports = async () => {
    try {
      setModalLoading(true);
      const response = await getRequest("/community/my-reports");
      setMyReports(toArray(response));
    } catch (error) {
      console.error(error);
      setMyReports([]);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchMyOwnPosts = async () => {
    try {
      setModalLoading(true);
      const response = await getRequest("/community/my-posts");
      setMyOwnPosts(toArray(response));
    } catch (error) {
      console.error(error);
      setMyOwnPosts([]);
    } finally {
      setModalLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setModalLoading(true);
      const response = await getRequest("/auth/users");
      setMemberList(toArray(response));
    } catch (error) {
      console.error(error);
      setMemberList([]);
    } finally {
      setModalLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  const formatDate = (dateString: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPostTypeStyle = (type: PostType) => {
    const styles: Record<string, any> = {
      Advice:     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200",  icon: <TrendingUp    className="w-3 h-3" /> },
      Discussion: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   icon: <MessageCircle className="w-3 h-3" /> },
      Support:    { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: <Users         className="w-3 h-3" /> },
    };
    return styles[type] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: <AlertCircle className="w-3 h-3" /> };
  };

  const triggerToast = (message: string, duration = 3000) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), duration);
  };

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  const handleSavePost = async (postId: string) => {
    try {
      setIsSaving((prev) => ({ ...prev, [postId]: true }));
      await postRequest(`/community/save-post/${postId}`, {});
      await fetchPosts();
      if (selectedPost?.id === postId) {
        setSelectedPost({ ...selectedPost, is_saved: !(selectedPost as any).is_saved } as Post);
      }
      triggerToast("Post saved successfully!");
    } catch (error) {
      console.error("Error saving post:", error);
      triggerToast("Failed to save post");
    } finally {
      setIsSaving((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCreatePost = async (data: any) => {
    try {
      const response = await postRequest("/community/create-post", data);
      const newPostId = response?.id || response?.post_id;
      if (newPostId) {
        setCreatedPostId(newPostId);
        setToastMessage("Post created successfully!");
        setShowToast(true);
        setTimeout(() => { setShowToast(false); setCreatedPostId(null); }, 5000);
      }
      await fetchPosts();
      setShowModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
      triggerToast("Failed to create post");
    }
  };

  const handlePostClick = (clickedPost: Post) => {
    setSelectedPost(clickedPost);
    setShowPostDetailModal(true);
  };

  const handleClosePostDetail = () => {
    setShowPostDetailModal(false);
    setSelectedPost(null);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e5989b]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Create Post Prompt */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <img
              src={user?.profile_pic || "https://ui-avatars.com/api/?name=User"}
              className="w-10 h-10 rounded-full border-2 border-white"
              alt="Your avatar"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-[#fff6f6] rounded-full px-4 py-2.5 text-sm text-left text-gray-500"
            >
              What's on your mind?
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#e5989b] text-white p-2.5 rounded-full"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No posts yet.{" "}
              <button
                onClick={() => fetchPosts()}
                className="text-[#e5989b] underline underline-offset-2"
              >
                Refresh
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <SinglePost
                key={post?.id || Math.random()}
                post={post}
                getPostTypeStyle={getPostTypeStyle}
                formatDate={formatDate}
                onSavePost={handleSavePost}
                isSaving={isSaving[post?.id]}
                onPostClick={handlePostClick}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      </div>

      {/* Post Detail Modal */}
      {showPostDetailModal && selectedPost && (
        <PostDetailModal post={selectedPost} onClose={handleClosePostDetail} />
      )}

      {/* My Posts Modal */}
      {showMyPostsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#e5989b]" /> My Contributions
              </h3>
              <button onClick={() => setShowMyPostsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-[#e5989b] rounded-full"></div>
                </div>
              ) : myOwnPosts.length > 0 ? (
                <div className="space-y-3">
                  {myOwnPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer hover:shadow-md transition-all"
                      onClick={() => { setShowMyPostsModal(false); handlePostClick(post); }}
                    >
                      <h4 className="font-bold text-sm text-gray-900 truncate">{post.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{post.description}</p>
                      <div className="flex justify-between mt-3 text-[10px] text-gray-400 font-medium">
                        <span>{formatDate(post.created_at)}</span>
                        <span className="text-[#e5989b] uppercase">{post.like_count || 0} Likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">You haven't posted anything yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#e5989b]" /> My Reports
              </h3>
              <button onClick={() => setShowReportsModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-[#e5989b] rounded-full"></div>
                </div>
              ) : myReports.length > 0 ? (
                <div className="space-y-4">
                  {myReports.map((report) => (
                    <div key={report?.id || Math.random()} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {report?.status || "Pending"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          <Clock size={10} className="inline mr-1" />
                          {formatDate(report?.created_at)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">Reason: {report?.reason || "N/A"}</p>
                      <p className="text-xs text-gray-600 mt-1">{report?.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 text-sm">No reports filed yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#e5989b]" /> Community
              </h3>
              <button onClick={() => setShowMembersModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {modalLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-b-2 border-[#e5989b] rounded-full"></div>
                </div>
              ) : memberList.length > 0 ? (
                <div className="space-y-2">
                  {memberList.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-2 rounded-xl border border-gray-50 hover:bg-[#fff6f6] transition-colors"
                    >
                      <img
                        src={
                          m.profile_pic ||
                          `https://ui-avatars.com/api/?name=${m.firstname}+${m.lastname}&background=fceaea&color=e5989b`
                        }
                        className="w-10 h-10 rounded-full border border-gray-100"
                        alt={`${m.firstname} ${m.lastname}`}
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-900">{m.firstname} {m.lastname}</p>
                        <p className="text-[10px] text-gray-500">@{m.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 text-sm">No members found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreatePost={handleCreatePost}
        user={user}
      />

      {showToast && (
        <SuccessToast
          message={toastMessage}
          onClose={() => { setShowToast(false); setCreatedPostId(null); }}
          showViewButton={!!createdPostId}
          onViewClick={() => {
            if (createdPostId) {
              navigate(`/community/post/${createdPostId}`);
              setShowToast(false);
              setCreatedPostId(null);
            }
          }}
          duration={5000}
        />
      )}
    </>
  );
};

export default CommunityCenter;