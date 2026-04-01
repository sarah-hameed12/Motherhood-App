// export type PostType = "Advice" | "Discussion" | "Support";

// export interface User {
//   firstname: string;
//   lastname: string;
//   username: string;
//   profile_pic: string;
// }

// export interface Post {
//   user_id: string;
//   user: User;
//   title: string;
//   tags: string[];
//   images: string[];
//   description: string;
//   post_type: PostType;
//   id: string;
//   visible: boolean;
//   post_category: string;
//   like_count: number;
//   created_at: string;
//   likers: string[]
// }

// export interface PostFormData {
//   title: string;
//   description: string;
//   post_type: PostType;
//   tags: string[];
//   images: string[];
// }


// Community Post Types
export type PostType = "Advice" | "Discussion" | "Support";

export interface User {
  id?: string;
  firstname: string;
  lastname: string;
  username: string;
  profile_pic: string;
}

export interface Post {
  id: string;
  user: User;
  title: string;
  tags: string[];
  images: string[];
  description: string;
  post_type: PostType;
  like_count: number;
  comment_count?: number; // Add comment count
  created_at: string;
  likers: string[];
  user_id: string;
}

export interface PostFormData {
  title: string;
  description: string;
  post_type: PostType;
  tags: string[];
  images: string[];
}

// Comment Types
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user: User;
  like_count: number;
  is_liked?: boolean;
}

export interface CommentCreate {
  content: string;
}

export interface CommentUpdate {
  content: string;
}

// Report Types
export type ReportReason = 
  | "Spam" 
  | "Offensive" 
  | "Misinformation" 
  | "Harassment" 
  | "Inappropriate Content" 
  | "Other";

export type ReportStatus = "Pending" | "Under Review" | "Resolved" | "Dismissed";

export interface PostReportCreate {
  reason: ReportReason;
  description?: string;
}

export interface PostReportResponse {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  reporter: User;
}