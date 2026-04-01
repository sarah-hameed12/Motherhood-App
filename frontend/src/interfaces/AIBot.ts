// ==================== CORE TYPES ====================

export type MessageRole = "user" | "assistant" | "system";
export type MessageType = "human" | "ai" | "system" | "error";

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: MessageRole;
  message_type: MessageType;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    sources?: string[];
    is_flagged?: boolean;
    feedback?: "positive" | "negative" | null;
    processing_time_ms?: number;
  };
}

export interface Conversation {
  id: string;
  user_id: string;
  chatbot_id: string;
  topic: string;
  summary?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_archived: boolean;
  tags?: string[];
  metadata?: {
    language?: string;
    category?: "nutrition" | "sleep" | "health" | "development" | "behavior" | "general";
    sentiment?: "positive" | "neutral" | "negative";
    duration_minutes?: number;
    age_group?: "newborn" | "infant" | "toddler" | "preschooler" | "school_age";
  };
  messages?: Message[]; // Optional, for full conversation view
}

// ==================== CONVERSATION LIST TYPES ====================

export interface ConversationListItem {
  id: string;
  user_id: string;
  chatbot_id: string;
  topic: string;
  summary?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_archived: boolean;
  tags?: string[];
  
  // UI-specific properties for list display
  last_message?: {
    content: string;
    role: MessageRole;
    timestamp: string;
    truncated?: boolean;
  };
  
  preview?: string; // Short preview text
  unread_count?: number;
  
  // Optional metadata for filtering/sorting
  metadata?: {
    category?: string;
    sentiment?: string;
    has_attachments?: boolean;
    is_pinned?: boolean;
  };
}

// ==================== MOCK CONVERSATION TYPES ====================

export interface MockConversation extends Conversation {
  // Mock-specific properties
  is_mock?: boolean;
  mock_data?: {
    seed_messages: Message[];
    average_response_time?: number;
    simulated_user?: string;
  };
}

// ==================== CHATBOT TYPES ====================

export interface ChatBot {
  id: string;
  user_id: string;
  name: string;
  description: string;
  system_prompt?: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  settings?: {
    allow_history?: boolean;
    show_sources?: boolean;
    auto_summarize?: boolean;
    retention_days?: number;
    suggest_topics?: boolean;
    enable_feedback?: boolean;
  };
  capabilities?: string[];
}

// ==================== API TYPES ====================

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  chatbot_id?: string;
  stream?: boolean;
  parent_message_id?: string;
  options?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    include_sources?: boolean;
  };
}

export interface ChatResponse {
  id: string;
  response: string;
  conversation_id: string;
  message_id: string;
  parent_message_id?: string;
  sources?: string[];
  suggested_questions?: string[];
  metadata: {
    tokens: number;
    model: string;
    processing_time_ms: number;
    finish_reason?: string;
  };
}

// ==================== FILTER & SEARCH TYPES ====================

export interface ConversationFilter {
  search?: string;
  start_date?: string;
  end_date?: string;
  tags?: string[];
  categories?: string[];
  archived?: boolean;
  sort_by?: "created_at" | "updated_at" | "message_count" | "last_activity";
  sort_order?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  conversations: ConversationListItem[];
  messages: Message[];
  total: number;
  facets?: {
    tags: Array<{ name: string; count: number }>;
    categories: Array<{ name: string; count: number }>;
    dates: Array<{ date: string; count: number }>;
  };
}

// ==================== STATISTICS TYPES ====================

export interface ChatStatistics {
  total_conversations: number;
  total_messages: number;
  total_tokens_used: number;
  average_messages_per_conversation: number;
  average_response_time_ms: number;
  
  most_active_day?: {
    date: string;
    count: number;
  };
  
  categories_distribution: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  
  recent_activity: Array<{
    date: string;
    conversations: number;
    messages: number;
  }>;
}

// ==================== COMPONENT PROP TYPES ====================

export interface ConversationItemProps {
  conversation: ConversationListItem;
  isSelected: boolean;
  onClick: (conversation: ConversationListItem) => void;
  onDelete: (conversationId: string, e: React.MouseEvent) => void;
  onArchive?: (conversationId: string) => void;
  onPin?: (conversationId: string) => void;
  className?: string;
}

export interface ChatBubbleProps {
  message: Message;
  isLastMessage?: boolean;
  showTimestamp?: boolean;
  onCopy?: (content: string) => void;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
  className?: string;
}

export interface ChatSidebarProps {
  conversations: ConversationListItem[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: ConversationListItem) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (conversationId: string, e: React.MouseEvent) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  statistics?: {
    total: number;
    unread: number;
    archived: number;
  };
  isLoading?: boolean;
  onClearSearch?: () => void;
}

// ==================== UTILITY TYPES ====================

export type UUID = string;
export type ISOString = string;

export const MessageRole = {
  USER: "user" as const,
  ASSISTANT: "assistant" as const,
  SYSTEM: "system" as const,
} as const;

export const MessageType = {
  HUMAN: "human" as const,
  AI: "ai" as const,
  SYSTEM: "system" as const,
  ERROR: "error" as const,
} as const;

export const ConversationCategory = {
  NUTRITION: "nutrition",
  SLEEP: "sleep",
  HEALTH: "health",
  DEVELOPMENT: "development",
  BEHAVIOR: "behavior",
  GENERAL: "general",
  SAFETY: "safety",
  EDUCATION: "education",
} as const;

export type ConversationCategory = typeof ConversationCategory[keyof typeof ConversationCategory];