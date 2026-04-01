import { useState } from 'react';
import { 
  MessageCircle, Plus, Search, Clock, Trash2, 
  MoreVertical, Check, X, Bot, Sun, ChevronLeft, Loader2
} from 'lucide-react';
import { deleteRequest } from '../../../api/requests';


interface AiConversation {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  messages_exist?: boolean;
}

interface BotLeftbarProps {
  conversations: AiConversation[];
  loading?: boolean;
  selectedChat?: AiConversation | null;
  onChatSelect: (conversation: AiConversation) => void;
  isMobile?: boolean;
  onCloseSidebar?: () => void;
  onNewChat: () => void;
  onConversationDeleted: (id: string) => void;
}

const BotLeftbar = ({ 
  conversations, 
  loading, 
  selectedChat, 
  onChatSelect, 
  isMobile, 
  onCloseSidebar,
  onNewChat,
  onConversationDeleted,
}: BotLeftbarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  console.log(conversations)

  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowOptions(null);
    try {
      await deleteRequest(`/llm/conversations/${id}`);
      onConversationDeleted(id);
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (conv: AiConversation) => {
    onChatSelect(conv);
    if (isMobile && onCloseSidebar) onCloseSidebar();
  };

  const ConversationItem = ({ conv }: { conv: AiConversation }) => (
    <div className="relative group">
      <div
        className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 ${
          deletingId === conv.id
            ? 'opacity-50 pointer-events-none'
            : editingId === conv.id
              ? 'bg-[#fceaea] ring-2 ring-[#e5989b] ring-opacity-50'
              : selectedChat?.id === conv.id
                ? 'bg-[#fceaea] shadow-md'
                : 'hover:bg-[#fceaea] hover:shadow-sm cursor-pointer'
        }`}
        onClick={() => { if (editingId !== conv.id) handleChatClick(conv); }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-xl flex items-center justify-center shadow-md">
            {deletingId === conv.id
              ? <Loader2 className="w-5 h-5 text-white animate-spin" />
              : <Bot className="w-5 h-5 text-white" />
            }
          </div>
          {conv.messages_exist && deletingId !== conv.id && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {editingId === conv.id ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="flex-1 text-sm font-medium bg-white border border-[#e5989b] rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#e5989b]"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
              />
              <button onClick={() => setEditingId(null)} className="p-1 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setEditingId(null)} className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-800 truncate">{conv.topic}</h3>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <span className="text-xs text-gray-400">{formatTime(conv.updated_at)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {conv.messages_exist ? 'Tap to continue conversation' : 'No messages yet'}
              </p>
              <div className="flex items-center justify-end mt-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptions(showOptions === conv.id ? null : conv.id);
                  }}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white rounded-lg transition-all"
                >
                  <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Options Menu — Delete only */}
      {showOptions === conv.id && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
          <button
            onClick={() => handleDelete(conv.id)}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-3" />
            Delete
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full md:w-80 h-full bg-white/95 backdrop-blur-sm border-r border-gray-200 flex flex-col relative">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-gray-700">AI Assistant</h2>
          </div>
          {isMobile ? (
            <button onClick={onCloseSidebar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <button
              onClick={onNewChat}
              className="p-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white rounded-xl hover:shadow-lg transition-all duration-200 group relative"
            >
              <Plus className="w-4 h-4" />
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white text-xs py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                New Chat
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-[#e5989b] rotate-45" />
              </div>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-100 border border-transparent rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e5989b] focus:bg-white transition-all text-sm"
          />
        </div>
      </div>

      {/* Conversations List - with custom scrollbar */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Loader2 className="w-8 h-8 text-[#e5989b] animate-spin mb-3" />
            <p className="text-sm text-gray-400">Loading conversations...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 px-2">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs font-medium text-gray-400">RECENT</span>
            </div>

            {filteredConversations.length > 0 ? (
              <div className="space-y-1">
                {filteredConversations.map(conv => (
                  <ConversationItem key={conv.id} conv={conv} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl flex items-center justify-center mb-3 opacity-50">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-500 font-medium">No conversations found</p>
                <p className="text-sm text-gray-400 mt-1">Start a new chat to get help</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Sun className="w-3 h-3" />
          <span>{filteredConversations.length} conversations</span>
        </div>
      </div>
    </div>
  );
};

export default BotLeftbar;