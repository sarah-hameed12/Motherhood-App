import { useParams } from "react-router-dom";
import type { MotherProfile } from "../interfaces/ProfileInterfaces";
import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext";
import { getRequest, putRequest, deleteRequest } from "../api/requests";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Droplets,
  Clock,
  Edit,
  Shield,
  Heart,
  Baby,
  Eye,
  Home,
  MessageCircle,
  ThumbsUp,
  MoreVertical,
  X,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import MotherProfileUpdate from "../components/MotherProfileUpdate";
import useImageUpload from "../hooks/useImageUpload";

interface Post {
  user_id: string;
  user: {
    firstname: string;
    lastname: string;
    username: string;
    profile_pic: string;
  };
  title: string;
  tags: string[];
  images: string[];
  description: string;
  post_type: 'Advice' | 'Question' | 'Share' | string;
  id: string;
  visible: boolean;
  post_category: string;
  like_count: number;
  created_at: string;
  updated_at?: string;
}

const UserProfile = () => {
  const { accessToken, user } = useAuth();
  const params = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mother, setMother] = useState<MotherProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  
  // Use image upload hook for profile picture
  const { 
    imageUrl: uploadedProfilePic, 
    isLoading: isUploadingProfilePic, 
    error: uploadProfilePicError, 
    progress: profilePicProgress, 
    uploadImage: uploadProfileImage,
    reset: resetProfilePicUpload 
  } = useImageUpload();

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Please upload JPEG, PNG, WEBP, or GIF");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 5MB");
      return;
    }

    const uploadedUrl = await uploadProfileImage(file);
    if (!uploadedUrl) {
      if (uploadProfilePicError) {
        setError(uploadProfilePicError);
      }
      return;
    }

    // Update local state immediately for better UX
    setMother(prev => prev ? { ...prev, profile_pic: uploadedUrl } : prev);
    setError("");

    // Update backend
    try {
      await putRequest(`/user-profile/update`, {
        id: user?.id,
        profile_pic: uploadedUrl,
      });
      console.log("Profile picture updated successfully");
      fetch_mother_data();
    } catch (error: any) {
      console.error("Error updating profile picture:", error);
      setError(error.message || "Failed to update profile picture");
      // Revert to original profile pic
      fetch_mother_data();
    }
  };

  const fetch_mother_data = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRequest('/user-profile/mother/' + params.id);
      setMother(response);
      // Reset upload state after successful fetch
      resetProfilePicUpload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetch_my_posts = async () => {
    if (!user || params.id !== user.id) return;
    setPostsLoading(true);
    try {
      const response = await getRequest('/community/my-posts');
      setPosts(response);
    } catch (err: any) {
      console.error("Error fetching posts:", err.message);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetch_mother_data();
  }, [accessToken, params.id]);

  useEffect(() => {
    if (params.id === user?.id && accessToken) fetch_my_posts();
  }, [accessToken, params.id, user]);

  useEffect(() => {
    // Clear errors after 5 seconds
    if (error || uploadProfilePicError) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, uploadProfilePicError]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getAccountDuration = (createdAt: string) => {
    if (!createdAt) return 'N/A';
    const created = new Date(createdAt);
    const today = new Date();
    const months = (today.getFullYear() - created.getFullYear()) * 12 + (today.getMonth() - created.getMonth());
    if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    fetch_mother_data();
  };

  const isOwnProfile = params.id === user?.id;

  // Get current profile picture URL - prioritize uploaded one if exists
  const currentProfilePic = isUploadingProfilePic 
    ? (uploadedProfilePic || mother?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png")
    : (mother?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png");

  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff6f6] to-[#fceaea]">
      <div className="text-center">
        {/* Cute bouncing spinner */}
        <div className="relative w-20 h-20 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full animate-pulse opacity-75"></div>
          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
            <Baby className="w-10 h-10 text-[#e5989b] animate-bounce" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-r from-[#e5989b]/20 to-[#d88a8d]/20 rounded-full animate-ping"></div>
        </div>
        <p className="text-gray-600 text-lg font-medium animate-pulse">Loading profile...</p>
        <p className="text-gray-400 text-sm mt-1">Getting things ready for you ✨</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff6f6] to-[#fceaea]">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600 text-lg mb-2">Error loading profile</p>
        <p className="text-gray-600">{error}</p>
        <button onClick={fetch_mother_data} className="mt-4 px-6 py-2 bg-[#e5989b] text-white rounded-full hover:bg-[#d88a8d] transition-colors shadow-md">Try Again</button>
      </div>
    </div>
  );

  if (!mother) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff6f6] to-[#fceaea]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 text-lg">No profile data found</p>
        <button onClick={fetch_mother_data} className="mt-4 px-6 py-2 bg-[#e5989b] text-white rounded-full hover:bg-[#d88a8d] transition-colors shadow-md">Reload</button>
      </div>
    </div>
  );

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-[#fff6f6] to-[#fceaea] py-8 px-4 transition-all duration-300 ${showUpdateModal ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {/* Error Toast */}
          {(error || uploadProfilePicError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">Error: {error || uploadProfilePicError}</p>
                </div>
                <button 
                  onClick={() => setError(null)} 
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="text-center mb-6">
            <div className={`inline-flex items-center px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm ${isOwnProfile ? "border-[#e5989b]/20 text-gray-600" : "border-blue-200 text-blue-600"}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse mr-2 ${isOwnProfile ? "bg-[#e5989b]" : "bg-blue-500"}`}></div>
              <span className="text-sm">{isOwnProfile ? "My Profile" : "Viewing Profile"}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-4 lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
                <div className={`px-4 py-6 text-white text-center ${isOwnProfile ? "bg-gradient-to-r from-[#e5989b] to-[#d88a8d]" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}>
                  <div className="relative inline-block">
                    {/* Profile Image - Circular now */}
                    <div className="relative">
                      <img 
                        src={currentProfilePic} 
                        alt={`${mother.firstname} ${mother.lastname}`} 
                        className="w-28 h-28 rounded-full object-cover border-4 border-white/30 shadow-xl mx-auto"
                      />
                      {isUploadingProfilePic && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-1" />
                            <p className="text-white text-xs font-medium">{profilePicProgress}%</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isOwnProfile && (
                      <>
                        <label className={`absolute bottom-0 right-0 w-8 h-8 rounded-full ${isUploadingProfilePic ? 'bg-yellow-400' : 'bg-green-400'} flex items-center justify-center cursor-pointer border-2 border-white transition-all hover:scale-110 shadow-md`}>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleProfilePicChange}
                            disabled={isUploadingProfilePic}
                          />
                          {isUploadingProfilePic ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <Edit className="w-4 h-4 text-white" />
                          )}
                        </label>
                        {isUploadingProfilePic && (
                          <div className="mt-2 text-xs text-white/80 animate-pulse">
                            Uploading... {profilePicProgress}%
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-bold mt-3 mb-1">{mother.firstname} {mother.lastname}{!isOwnProfile && <span className="ml-2 text-sm font-normal opacity-90">(Other User)</span>}</h2>
                  <p className="text-white/80 text-sm">@{mother.username}</p>
                  {isOwnProfile ? (
                    <button 
                      onClick={() => setShowUpdateModal(true)} 
                      disabled={isUploadingProfilePic}
                      className={`mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 transition-all duration-300 border border-white/30 mx-auto text-sm ${isUploadingProfilePic ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Edit className="w-3 h-3" />
                      <span className="font-medium">Edit Profile</span>
                    </button>
                  ) : (
                    <div className="mt-3 text-xs text-white/70">Viewing other user's profile</div>
                  )}
                </div>

                <div className="p-4 space-y-4">
                  <div className="p-3 bg-gray-50 rounded-xl shadow-inner">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Quick Overview</h3>
                    <div className="space-y-3">
                      <StatItem icon={Users} label="Children" value={mother.number_of_children || 0} color={isOwnProfile ? "text-blue-600" : "text-blue-500"} bgColor={isOwnProfile ? "bg-blue-100" : "bg-blue-100"} isOwnProfile={isOwnProfile} />
                      <StatItem icon={Calendar} label="Age" value={`${calculateAge(mother.date_of_birth)} years`} color={isOwnProfile ? "text-green-600" : "text-green-500"} bgColor={isOwnProfile ? "bg-green-100" : "bg-green-100"} isOwnProfile={isOwnProfile} />
                      <StatItem icon={Droplets} label="Blood Type" value={mother.blood_type || 'N/A'} color={isOwnProfile ? "text-red-600" : "text-red-500"} bgColor={isOwnProfile ? "bg-red-100" : "bg-red-100"} isOwnProfile={isOwnProfile} />
                      <StatItem icon={Clock} label="Member Since" value={getAccountDuration(mother.account_created_at)} color={isOwnProfile ? "text-purple-600" : "text-purple-500"} bgColor={isOwnProfile ? "bg-purple-100" : "bg-purple-100"} isOwnProfile={isOwnProfile} />
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500"/> Contact & Personal Details</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <ConciseStatItem icon={Mail} label="Email" value={mother.email} isOwnProfile={isOwnProfile}/>
                      <ConciseStatItem icon={Phone} label="Phone" value={mother.phone_number || 'N/A'} isOwnProfile={isOwnProfile}/>
                      <ConciseStatItem icon={Calendar} label="D.O.B" value={formatDate(mother.date_of_birth)} isOwnProfile={isOwnProfile}/>
                      <ConciseStatItem icon={Heart} label="Blood Type" value={mother.blood_type || 'N/A'} valueColor={mother.blood_type ? (isOwnProfile ? "text-red-600" : "text-red-500") : "text-gray-500"} isOwnProfile={isOwnProfile}/>
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500"/> Location</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <ConciseStatItem icon={Home} label="Address" value={mother.address || 'N/A'} isOwnProfile={isOwnProfile}/>
                      <ConciseStatItem icon={MapPin} label="City" value={mother.city || 'N/A'} isOwnProfile={isOwnProfile}/>
                      <ConciseStatItem icon={MapPin} label="Country" value={mother.country || 'N/A'} isOwnProfile={isOwnProfile}/>
                      <ConciseStatItem icon={Clock} label="Acct. Created" value={formatDate(mother.account_created_at)} isOwnProfile={isOwnProfile}/>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-8 lg:col-span-8">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#e5989b]"/>
                  {isOwnProfile ? "My Community Posts" : `${mother.firstname}'s Activity`}
                </h2>

                {postsLoading && (
                  <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-full animate-pulse opacity-75"></div>
                      <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
                        <MessageCircle className="w-7 h-7 text-[#e5989b] animate-bounce" />
                      </div>
                    </div>
                    <p className="text-gray-500 font-medium">Loading your posts...</p>
                    <p className="text-gray-400 text-sm mt-1">Fetching your community activity 💫</p>
                  </div>
                )}

                {!postsLoading && isOwnProfile && posts.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#e5989b]/10 to-[#d88a8d]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Baby className="w-8 h-8 text-[#e5989b]" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700">No Posts Yet</p>
                    <p className="text-gray-500 text-sm mt-1">Start sharing your thoughts and questions with the community! 🌟</p>
                  </div>
                )}

                {!postsLoading && isOwnProfile && posts.length > 0 && (
                  <div className="space-y-4">
                    {posts.map(post => (
                      <PostCard key={post.id} post={post} onPostUpdated={fetch_my_posts}/>
                    ))}
                  </div>
                )}

                {!isOwnProfile && (
                  <div className="text-center py-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                    <Shield className="w-10 h-10 text-red-400 mx-auto mb-3"/>
                    <p className="text-lg font-semibold text-gray-700">Content Hidden</p>
                    <p className="text-gray-500 text-sm mt-1">Posts are only visible to the owner of this profile.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showUpdateModal && (
        <MotherProfileUpdate motherData={mother} onClose={() => setShowUpdateModal(false)} onSuccess={handleUpdateSuccess}/>
      )}
    </>
  );
};

// ---------- PostCard Component ----------
const PostCard: React.FC<{ post: Post; onPostUpdated: () => void }> = ({ post, onPostUpdated }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(post.description);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const isEdited = post.updated_at && post.updated_at !== post.created_at;

  const handleEdit = () => { setIsEditing(true); setIsDropdownOpen(false); setEditedDescription(post.description); };
  const handleCancelEdit = () => { setIsEditing(false); setEditedDescription(post.description); };

  const handleSaveEdit = async () => {
    if (!editedDescription.trim() || editedDescription === post.description) { setIsEditing(false); return; }
    setIsUpdating(true);
    try {
      await putRequest(`/community/update-post/${post.id}`, { description: editedDescription.trim() });
      post.description = editedDescription.trim();
      post.updated_at = new Date().toISOString();
      setIsEditing(false);
      onPostUpdated();
    } catch (error: any) {
      console.error("Error updating post:", error);
      alert(`Failed to update post: ${error.response?.data?.detail || error.message}`);
    } finally { setIsUpdating(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) { setIsDropdownOpen(false); return; }
    setIsDeleting(true);
    try { await deleteRequest(`/community/delete-post/${post.id}`); onPostUpdated(); }
    catch (error: any) { console.error("Error deleting post:", error); alert(`Failed to delete post: ${error.response?.data?.detail || error.message}`); }
    finally { setIsDeleting(false); setIsDropdownOpen(false); }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <img src={post.user.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt={post.user.username} className="w-10 h-10 rounded-full object-cover border-2 border-[#e5989b]/50"/>
          <div>
            <p className="text-sm font-semibold text-gray-800">{post.user.firstname} {post.user.lastname}</p>
            <p className="text-xs text-gray-500">@{post.user.username}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${post.post_type === 'Advice' ? 'bg-green-100 text-green-800' : post.post_type === 'Question' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{post.post_type}</span>
          <div className="relative">
            <button className="p-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50" onClick={() => setIsDropdownOpen(!isDropdownOpen)} aria-label="Post actions" disabled={isDeleting}><MoreVertical className="w-5 h-5" /></button>
            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20 border border-gray-200 overflow-hidden">
                  <button onClick={handleEdit} disabled={isEditing} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"><Edit className="w-4 h-4 mr-2 text-blue-500"/>Edit</button>
                  <button onClick={handleDelete} disabled={isDeleting} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 transition-colors disabled:opacity-50"><Trash2 className="w-4 h-4 mr-2 text-red-500"/>{isDeleting ? (
                    <div className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : 'Delete'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>

      {isEditing ? (
        <div className="mb-3">
          <textarea value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#e5989b] focus:border-[#e5989b] transition-all duration-200 min-h-[100px]" placeholder="Edit your post description..."/>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={handleCancelEdit} disabled={isUpdating} className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 flex items-center gap-1"><X className="w-4 h-4"/>Cancel</button>
            <button onClick={handleSaveEdit} disabled={isUpdating || !editedDescription.trim()} className="px-4 py-2 text-sm bg-[#e5989b] text-white rounded-lg hover:bg-[#d88a8d] transition-colors disabled:opacity-50 flex items-center gap-1">{isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4"/>}{isUpdating ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      ) : <p className="text-gray-600 text-sm mb-3 line-clamp-3">{post.description}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded-full border border-gray-200">#{tag}</span>
        ))}
      </div>

      {post.images && post.images.length > 0 && <img src={post.images[0]} alt="Post image" className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-100"/>}

      <div className="flex justify-between items-center text-xs text-gray-500 pt-3 border-t border-gray-100">
        <span className="flex items-center space-x-1"><ThumbsUp className="w-4 h-4 text-red-400"/><span>{post.like_count} Likes</span></span>
        <span className="flex items-center space-x-1"><MessageCircle className="w-4 h-4 text-blue-400"/><span>0 Comments</span></span>
        <div className="flex items-center gap-2"><span>{timeAgo(post.created_at)}</span>{isEdited && <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">Edited</span>}</div>
      </div>
    </div>
  );
};

// ---------- StatItem Component ----------
const StatItem = ({ icon: Icon, label, value, color, bgColor, isOwnProfile }: { icon: any; label: string; value: string | number; color: string; bgColor: string; isOwnProfile: boolean }) => (
  <div className={`flex items-center justify-between p-2 rounded-xl border transition-colors ${isOwnProfile ? "border-gray-200 hover:border-[#e5989b]/30" : "border-gray-200 hover:border-blue-300"}`}>
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="text-base font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

// ---------- ConciseStatItem Component ----------
const ConciseStatItem = ({ icon: Icon, label, value, valueColor = "text-gray-800", isOwnProfile }: { icon: any; label: string; value: string | number; valueColor?: string; isOwnProfile: boolean }) => (
  <div className={`flex items-center gap-2 p-1.5 rounded-lg border transition-colors bg-white ${isOwnProfile ? "border-gray-200 hover:border-[#e5989b]/30" : "border-gray-200 hover:border-blue-300"}`}>
    <div className={`w-6 h-6 rounded-md flex items-center justify-center ${isOwnProfile ? "bg-[#fceaea]" : "bg-blue-50"}`}>
      <Icon className={`w-3.5 h-3.5 ${isOwnProfile ? "text-[#e5989b]" : "text-blue-500"}`} />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 leading-none">{label}</p>
      <p className={`text-sm font-semibold ${valueColor}`}>{value}</p>
    </div>
  </div>
);

export default UserProfile;