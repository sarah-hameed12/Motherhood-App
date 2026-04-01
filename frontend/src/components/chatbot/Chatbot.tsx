import { useState, useEffect } from "react";
import BotLeftbar from "./includes/BotLeftbar";
import ChatArea from "./includes/ChatArea";
import TopicsOptions from "./includes/TopicsOption";
import { useUIContext } from "../../context/uiContext";
import { useAuth } from "../../context/authContext";
import { MessageCircle, Plus } from "lucide-react";
import { getRequest } from "../../api/requests";

interface AiConversation {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  messages_exist?: boolean;
}

const Chatbot = () => {
  const { setBotOpen } = useUIContext();
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<AiConversation | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showTopicsPopup, setShowTopicsPopup] = useState(false);
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);

  useEffect(() => {
    setBotOpen(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      setBotOpen(false);
      window.removeEventListener("resize", checkMobile);
    };
  }, [setBotOpen]);

  const fetchConversations = async () => {
    if (!user?.id) return;
    setLoadingConversations(true);
    try {
      const data = await getRequest(`/llm/conversations`);
      setConversations(data ?? []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  const handleChatSelect = (conversation: AiConversation) => {
    setSelectedChat(conversation);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleTopicSelect = async () => {
    setShowTopicsPopup(false);
    if (!user?.id) return;
    setLoadingConversations(true);
    try {
      const data = await getRequest(`/llm/conversations`);
      const updated: AiConversation[] = data ?? [];
      setConversations(updated);
      // Auto-select the most recently created conversation
      if (updated.length > 0) {
        const newest = updated.reduce((a, b) =>
          new Date(a.created_at) > new Date(b.created_at) ? a : b
        );
        setSelectedChat(newest);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleConversationDeleted = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (selectedChat?.id === id) setSelectedChat(null);
  };

  const hasConversations = conversations.length > 0;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile Menu Button */}
      {hasConversations && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-xl p-2 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <MessageCircle className="w-6 h-6 text-gray-600" />
        </button>
      )}

      {/* Left Sidebar */}
      <div
        className={`
          fixed md:relative z-40 h-full transition-all duration-300 ease-in-out
          ${isMobile
            ? isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            : hasConversations || loadingConversations ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }
          ${!hasConversations && !loadingConversations ? "md:w-0 overflow-hidden" : ""}
        `}
      >
        <BotLeftbar
          conversations={conversations}
          loading={loadingConversations}
          selectedChat={selectedChat}
          onChatSelect={handleChatSelect}
          isMobile={isMobile}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onNewChat={() => setShowTopicsPopup(true)}
          onConversationDeleted={handleConversationDeleted}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Area */}
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {selectedChat ? (
          <ChatArea
            selectedChat={selectedChat}
            isMobile={isMobile}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-gray-50">
            <div className="text-center px-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#e5989b] to-[#d88a8d] rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-xl">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome to Nurtura AI
              </h2>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                Your personal parenting assistant. Get help with feeding,
                vaccinations, milestones, and more.
              </p>
              <button
                onClick={() => setShowTopicsPopup(true)}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>Start a New Chat</span>
              </button>
              <p className="text-xs text-gray-400 mt-4">
                Choose a topic and our AI will guide you
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Topics Popup */}
      {showTopicsPopup && (
        <TopicsOptions
          onClose={() => setShowTopicsPopup(false)}
          onSelectTopic={handleTopicSelect}
        />
      )}
    </div>
  );
};

export default Chatbot;