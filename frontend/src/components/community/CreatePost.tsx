// components/community/CreatePostModal.tsx
import { useState, type FormEvent, useRef } from "react";
import { X, Send, Tag, TrendingUp, MessageCircle, Users, Loader2, Upload, Trash2 } from "lucide-react";
import useImageUpload from "../../hooks/useImageUpload";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost: (postData: PostFormData) => Promise<void>;
  user: any;
}

type PostType = "Advice" | "Discussion" | "Support";

interface PostFormData {
  user_id: string;
  title: string;
  description: string;
  post_type: PostType;
  tags: string[];
  images: string[];
}

const CreatePostModal = ({ isOpen, onClose, onCreatePost, user }: CreatePostModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use the image upload hook
  const { 
    isLoading: isUploading, 
    error: uploadError, 
    progress, 
    uploadImage, 
    reset: resetUpload 
  } = useImageUpload();

  const [postForm, setPostForm] = useState<Omit<PostFormData, 'user_id' | 'tags' | 'images'>>({
    title: "",
    description: "",
    post_type: "Advice",
  });

  // Store uploaded image URLs
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Post type styling
  const getPostTypeStyle = (type: PostType) => {
    switch (type) {
      case "Advice":
        return {
          bg: "bg-green-50",
          text: "text-green-700",
          border: "border-green-200",
          icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
        };
      case "Discussion":
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        };
      case "Support":
        return {
          bg: "bg-orange-50",
          text: "text-orange-700",
          border: "border-orange-200",
          icon: <Users className="w-4 h-4 sm:w-5 sm:h-5" />
        };
      default:
        return {
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
        };
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag) {
      if (!selectedTags.includes(trimmedTag)) {
        if (selectedTags.length < 5) {
          setSelectedTags([...selectedTags, trimmedTag]);
          setTagInput("");
          setError("");
        } else {
          setError("Maximum 5 tags allowed");
        }
      } else {
        setError("Tag already added");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    setError("");
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (uploadedImages.length >= 4) {
      setError("Maximum 4 images allowed");
      return;
    }

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

    // Upload the image
    const url = await uploadImage(file);
    if (url) {
      setUploadedImages([...uploadedImages, url]);
      setError("");
    } else if (uploadError) {
      setError(uploadError);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setUploadedImages(uploadedImages.filter(url => url !== urlToRemove));
    setError("");
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (uploadedImages.length >= 4) {
      setError("Maximum 4 images allowed");
      return;
    }
    fileInputRef.current?.click();
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!postForm.title.trim()) {
      setError("Please enter a title for your post");
      return;
    }

    if (!postForm.description.trim()) {
      setError("Please enter a description for your post");
      return;
    }

    if (postForm.description.trim().length < 10) {
      setError("Description must be at least 10 characters long");
      return;
    }

    if (!user?.id) {
      setError("User information not available. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      
      const postData: PostFormData = {
        user_id: user.id,
        title: postForm.title.trim(),
        description: postForm.description.trim(),
        post_type: postForm.post_type,
        tags: selectedTags, // Optional - can be empty array
        images: uploadedImages // Optional - can be empty array
      };

      console.log("Creating post with data:", postData);
      
      await onCreatePost(postData);
      
      resetForm();
      
    } catch (error: any) {
      console.error("Error creating post:", error);
      setError(error.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setPostForm({
      title: "",
      description: "",
      post_type: "Advice",
    });
    setSelectedTags([]);
    setUploadedImages([]);
    setTagInput("");
    setError("");
    resetUpload();
  };

  // Handle key presses
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Close modal handler
  const handleClose = () => {
    if (!loading && !isUploading) {
      resetForm();
      onClose();
    }
  };

  // Character counter for description
  const descriptionLength = postForm.description.length;
  const isDescriptionValid = descriptionLength >= 10;

  // Check if form is valid for submission
  const isFormValid = 
    postForm.title.trim() && 
    isDescriptionValid && 
    !!user?.id &&
    !isUploading;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Modal - 80% height on large screens, full height on mobile */}
      <div className="relative w-full max-w-2xl h-[85vh] sm:h-[80vh] max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-gray-50 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 transform transition-all duration-300 scale-100 flex flex-col">
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0 bg-gradient-to-r from-[#fceaea] to-[#f8d8d8] border-b border-[#e5989b]/20 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Create Post</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 truncate">Share your thoughts with the community</p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading || isUploading}
            className="flex-shrink-0 p-1.5 sm:p-2 rounded-full hover:bg-white/50 transition-colors disabled:opacity-50 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
        </div>

        {/* User Info - Fixed */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-2 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img 
                src={user?.profile_pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                alt="Profile" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  Posting as: {user?.firstname} {user?.lastname}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 py-4 sm:py-5">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Error Message */}
            {(error || uploadError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error || uploadError}</p>
              </div>
            )}

            {/* Post Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Post Type *
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {(["Advice", "Discussion", "Support"] as PostType[]).map((type) => {
                  const style = getPostTypeStyle(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostForm({...postForm, post_type: type})}
                      className={`flex flex-col items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all ${
                        postForm.post_type === type
                          ? `${style.bg} ${style.border} ${style.text} scale-[1.02] shadow-sm`
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                      disabled={loading || isUploading}
                    >
                      <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg ${style.bg}`}>
                        {style.icon}
                      </div>
                      <span className="font-medium text-xs sm:text-sm truncate w-full text-center">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                placeholder="What's your post about?"
                value={postForm.title}
                onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                className="w-full bg-white border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b]"
                required
                disabled={loading || isUploading}
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {postForm.title.length}/100 characters
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                placeholder="Share your thoughts, questions, or experiences..."
                value={postForm.description}
                onChange={(e) => setPostForm({...postForm, description: e.target.value})}
                rows={4}
                className={`w-full bg-white border ${isDescriptionValid ? 'border-gray-300' : 'border-red-300'} rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b] resize-none`}
                required
                disabled={loading || isUploading}
                minLength={10}
              />
              <div className="flex flex-col sm:flex-row sm:justify-between mt-1 space-y-1 sm:space-y-0">
                <div className="text-xs text-gray-500">
                  {!isDescriptionValid && descriptionLength > 0 ? (
                    <span className="text-red-600">
                      {10 - descriptionLength} more characters required
                    </span>
                  ) : (
                    "Minimum 10 characters required"
                  )}
                </div>
                <div className={`text-xs ${isDescriptionValid ? 'text-gray-500' : 'text-red-600'}`}>
                  {descriptionLength}/1000 characters
                </div>
              </div>
            </div>

            {/* Tags - Optional */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="text"
                  placeholder="e.g., vaccination, sleep, nutrition"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="flex-1 bg-white border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e5989b]/30 focus:border-[#e5989b]"
                  disabled={loading || isUploading || selectedTags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={loading || isUploading || selectedTags.length >= 5}
                  className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50 w-full sm:w-auto"
                >
                  <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Add</span>
                </button>
              </div>
              
              {/* Selected Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 bg-gradient-to-r from-[#fff1f1] to-[#fceaea] text-[#e5989b] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-medium border border-[#e5989b]/20"
                    >
                      <span className="truncate max-w-[80px] sm:max-w-[100px]">#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={loading || isUploading}
                        className="text-[#d88a8d] hover:text-[#e5989b] flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Images - Optional */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Images
                </label>
                <span className="text-xs text-gray-500">(Optional)</span>
              </div>
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
                disabled={loading || isUploading || uploadedImages.length >= 4}
              />

              {/* Upload progress */}
              {isUploading && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-700">Uploading image...</span>
                    <span className="text-sm text-blue-600">{progress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload button - only show if less than 4 images */}
              {uploadedImages.length < 4 && (
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={loading || isUploading}
                  className="w-full p-4 sm:p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#e5989b] hover:bg-[#fdf5f5] transition-all duration-200 flex flex-col items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                >
                  <div className="p-2 bg-[#fceaea] rounded-full">
                    <Upload className="w-6 h-6 text-[#e5989b]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload images
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JPEG, PNG, WEBP, GIF • Max 5MB • {uploadedImages.length}/4
                    </p>
                  </div>
                </button>
              )}
              
              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="mt-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                          <img
                            src={url}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/300x300?text=Image+Error";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(url)}
                          disabled={loading || isUploading}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 shadow-lg"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs truncate">
                          Image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">
                      {uploadedImages.length} image{uploadedImages.length !== 1 ? 's' : ''} uploaded
                    </p>
                    {uploadedImages.length < 4 && (
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        disabled={loading || isUploading}
                        className="text-xs text-[#e5989b] hover:text-[#d88a8d] font-medium"
                      >
                        + Add more
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Form Actions - Fixed at bottom */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading || isUploading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium disabled:opacity-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-lg sm:rounded-xl hover:opacity-90 transition-all text-sm sm:text-base font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;