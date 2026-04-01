import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Mic, Smile, MoreVertical, Bot, User, Menu } from "lucide-react";
import { useAuth } from "../../../context/authContext";
import { getRequest } from "../../../api/requests";

interface AiConversation {
  id: string;
  user_id: string;
  topic: string;
  created_at: string;
  updated_at: string;
  messages_exist?: boolean;
}

interface ChatAreaProps {
  selectedChat: AiConversation;
  isMobile?: boolean;
  onOpenSidebar?: () => void;
}

type MessageType = {
  id: number;
  type: 'bot' | 'user';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  messageId?: string; // Store the actual message ID from backend
};

// Backend message response type
interface BackendMessage {
  id: string;
  content: string;
  conversation_id: string;
  created_at: string;
  message_type: 'human' | 'ai';
}

// Helper function to format message content with markdown
const formatMessageContent = (content: string) => {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const text = part.slice(2, -2);
      return <strong key={index} className="font-semibold">{text}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
};

// Map topic to conversation type - matching backend enum exactly
const getConversationType = (topic: string): string => {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('vaccine record') || topicLower.includes('child vaccine record')) {
    return 'child_vaccine_record';
  } else if (topicLower.includes('vaccination') || topicLower.includes('general vaccinations')) {
    return 'vaccination_general';
  } else if (topicLower.includes('growth') || topicLower.includes('child growth')) {
    return 'chid_growth'; // Backend has typo "chid_growth"
  } else if (topicLower.includes('parenting') || topicLower.includes('general parenting')) {
    return 'general_parent';
  }
  return 'general_parent'; // default
};

const ChatArea = ({ selectedChat, isMobile, onOpenSidebar }: ChatAreaProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasAnimated, setHasAnimated] = useState<Set<number>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Get auth token from useAuth
  const { accessToken } = useAuth();

  // Fetch messages for the current conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat.id) return;
      
      setIsLoadingMessages(true);
      try {
        // Call the correct endpoint with /messages
        const response = await getRequest(`/llm/conversations/${selectedChat.id}/messages`);
        
        // Check if response has messages and is an array
        if (response && Array.isArray(response)) {
          const formattedMessages: MessageType[] = response.map((msg: BackendMessage, index: number) => ({
            id: index + 1,
            type: msg.message_type === 'human' ? 'user' : 'bot',
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messageId: msg.id,
          }));
          
          setMessages(formattedMessages);
          
          // If no messages exist, add a welcome message
          if (formattedMessages.length === 0) {
            setMessages([
              {
                id: 1,
                type: 'bot',
                content: `Hello! 👋 Let's talk about **${selectedChat.topic}**. How can I help you today?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }
        } else {
          // If response is empty or not an array, show welcome message
          setMessages([
            {
              id: 1,
              type: 'bot',
              content: `Hello! 👋 Let's talk about **${selectedChat.topic}**. How can I help you today?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        // Show welcome message on error
        setMessages([
          {
            id: 1,
            type: 'bot',
            content: `Hello! 👋 Let's talk about **${selectedChat.topic}**. How can I help you today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } finally {
        setIsLoadingMessages(false);
        setHasAnimated(new Set());
      }
    };
    
    fetchMessages();
    
    // Cleanup any ongoing stream when chat changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [selectedChat.id, selectedChat.topic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage: MessageType = {
      id: messages.length + 1,
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    const userMessageContent = message;
    setMessage('');
    setIsTyping(true);

    // Create a temporary streaming bot message
    const streamingId = messages.length + 2;
    setStreamingMessageId(streamingId);
    
    const streamingMessage: MessageType = {
      id: streamingId,
      type: 'bot',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, streamingMessage]);

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    try {
      const convType = getConversationType(selectedChat.topic);
      
      // Prepare headers with authorization token
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization token if available
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      // Use fetch with authentication
      const response = await fetch('http://localhost:8000/api/llm/chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: userMessageContent,
          conversation_id: selectedChat.id,
          conv_type: convType,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has a body
      if (!response.body) {
        throw new Error('No response body available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulatedContent = '';
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          
          // Update the streaming message content in real-time
          setMessages(prev => prev.map(msg => 
            msg.id === streamingId 
              ? { ...msg, content: accumulatedContent }
              : msg
          ));
        }
      }

      // Mark streaming as complete
      setMessages(prev => prev.map(msg => 
        msg.id === streamingId 
          ? { ...msg, isStreaming: false }
          : msg
      ));
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Check if error was from abort
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      // Update the streaming message with error
      setMessages(prev => prev.map(msg => 
        msg.id === streamingId 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error. Please try again.',
              isStreaming: false 
            }
          : msg
      ));
    } finally {
      setIsTyping(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-pink-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-pink-200/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-sm z-10 rounded-t-3xl">
        <div className="flex items-center space-x-3">
          {isMobile && onOpenSidebar && (
            <button onClick={onOpenSidebar} className="p-2 hover:bg-pink-50 rounded-2xl transition-all duration-300 hover:scale-110 mr-1">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 animate-bounce-slow">
            <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-gray-800 text-sm md:text-base truncate capitalize">
              {selectedChat.topic}
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">
                {isLoadingMessages ? "Loading..." : "Online • Ready to help"}
              </span>
            </div>
          </div>
        </div>
        <button className="p-1.5 md:p-2 text-gray-500 hover:text-[#e5989b] hover:bg-pink-50 rounded-2xl transition-all duration-300 hover:rotate-12">
          <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-6 space-y-3 md:space-y-4 z-10">
        {isLoadingMessages ? (
          <div className="flex justify-center items-center h-full">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isNewMessage = !hasAnimated.has(msg.id);
            if (isNewMessage && !msg.isStreaming) {
              setHasAnimated(prev => new Set(prev).add(msg.id));
            }
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} ${isNewMessage && !msg.isStreaming ? 'animate-slide-in' : ''}`}
                style={{ animationDelay: isNewMessage && !msg.isStreaming ? `${index * 0.05}s` : '0s' }}
              >
                <div className={`flex items-start space-x-2 max-w-[85%] md:max-w-[70%] ${
                  msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`flex-shrink-0 w-6 h-6 md:w-8 md:h-8 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 hover:scale-110 ${
                    msg.type === 'user'
                      ? 'bg-gradient-to-r from-[#e5989b] to-[#d88a8d]'
                      : 'bg-gradient-to-r from-[#e5989b] to-[#d88a8d]'
                  }`}>
                    {msg.type === 'user'
                      ? <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      : <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    }
                  </div>
                  <div>
                    <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-2 shadow-sm transition-all duration-300 hover:shadow-md ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white'
                        : 'bg-white border border-pink-100 text-gray-800'
                    }`}>
                      <p className="text-xs md:text-sm leading-relaxed">
                        {msg.type === 'bot' 
                          ? formatMessageContent(msg.content || (msg.isStreaming ? '...' : ''))
                          : msg.content
                        }
                        {msg.isStreaming && msg.content && (
                          <span className="inline-block w-1.5 h-4 ml-0.5 bg-[#e5989b] animate-pulse" />
                        )}
                      </p>
                    </div>
                    <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-400 ${
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{msg.timestamp}</span>
                      {msg.type === 'user' && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="text-[#e5989b] text-xs">✓✓</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isTyping && !streamingMessageId && !isLoadingMessages && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-[#e5989b] to-[#d88a8d] rounded-2xl flex items-center justify-center shadow-sm">
                <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <div className="bg-white border border-pink-100 rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#e5989b] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white/90 backdrop-blur-sm border-t border-pink-100 p-4 shadow-lg z-10 rounded-b-3xl">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <button className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#e5989b] transition-all duration-300 hover:scale-110">
              <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isTyping ? "AI is responding..." : "Type your message..."}
              disabled={isTyping || isLoadingMessages}
              className={`w-full pl-10 pr-20 py-3 bg-pink-50 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#e5989b] focus:bg-white transition-all text-sm md:text-base placeholder:text-gray-400 ${
                (isTyping || isLoadingMessages) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button className="text-gray-400 hover:text-[#e5989b] transition-all duration-300 hover:scale-110">
                <Smile className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="text-gray-400 hover:text-[#e5989b] transition-all duration-300 hover:scale-110">
                <Mic className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping || isLoadingMessages}
            className={`p-3 rounded-2xl transition-all duration-300 flex-shrink-0 ${
              message.trim() && !isTyping && !isLoadingMessages
                ? 'bg-gradient-to-r from-[#e5989b] to-[#d88a8d] text-white hover:shadow-xl hover:scale-110 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <div className="mt-2 text-center">
          <p className="text-xs text-gray-400">
            ✨ AI responses are for informational purposes only. Consult healthcare professionals. ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;