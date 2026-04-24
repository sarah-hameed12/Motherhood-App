import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Mic, Smile, MoreVertical, User, Menu, Heart, Sparkles } from "lucide-react";
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
  messageId?: string;
};

interface BackendMessage {
  id: string;
  content: string;
  conversation_id: string;
  created_at: string;
  message_type: 'human' | 'ai';
}

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

const getConversationType = (topic: string): string => {
  const topicLower = topic.toLowerCase();
  if (topicLower.includes('vaccine record') || topicLower.includes('child vaccine record')) return 'child_vaccine_record';
  if (topicLower.includes('vaccination') || topicLower.includes('general vaccinations')) return 'vaccination_general';
  if (topicLower.includes('growth') || topicLower.includes('child growth')) return 'chid_growth';
  if (topicLower.includes('parenting') || topicLower.includes('general parenting')) return 'general_parent';
  return 'general_parent';
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
  const { accessToken } = useAuth();

  const petals = useRef(
    [...Array(18)].map((_, i) => ({
      left: `${(i * 23.7 + 5) % 100}%`,
      top: `${(i * 31.3 + 10) % 100}%`,
      animDelay: `${(i * 1.3) % 8}s`,
      animDur: `${12 + (i * 2.1) % 10}s`,
      size: 0.6 + (i % 4) * 0.25,
    }))
  ).current;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat.id) return;
      setIsLoadingMessages(true);
      try {
        const response = await getRequest(`/llm/conversations/${selectedChat.id}/messages`);
        if (response && Array.isArray(response)) {
          const formattedMessages: MessageType[] = response.map((msg: BackendMessage, index: number) => ({
            id: index + 1,
            type: msg.message_type === 'human' ? 'user' : 'bot',
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messageId: msg.id,
          }));
          setMessages(formattedMessages.length === 0 ? [{
            id: 1, type: 'bot',
            content: `Hello, mama! 🌸 I'm here to talk about **${selectedChat.topic}**. What's on your mind today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }] : formattedMessages);
        } else {
          setMessages([{
            id: 1, type: 'bot',
            content: `Hello, mama! 🌸 I'm here to talk about **${selectedChat.topic}**. What's on your mind today?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }]);
        }
      } catch {
        setMessages([{
          id: 1, type: 'bot',
          content: `Hello, mama! 🌸 I'm here to talk about **${selectedChat.topic}**. What's on your mind today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      } finally {
        setIsLoadingMessages(false);
        setHasAnimated(new Set());
      }
    };
    fetchMessages();
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, [selectedChat.id, selectedChat.topic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;
    const userMessage: MessageType = {
      id: messages.length + 1, type: 'user', content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    const userMessageContent = message;
    setMessage('');
    setIsTyping(true);
    const streamingId = messages.length + 2;
    setStreamingMessageId(streamingId);
    setMessages(prev => [...prev, {
      id: streamingId, type: 'bot', content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isStreaming: true,
    }]);
    abortControllerRef.current = new AbortController();
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
      const response = await fetch('http://localhost:8000/api/llm/chat', {
        method: 'POST', headers,
        body: JSON.stringify({ content: userMessageContent, conversation_id: selectedChat.id, conv_type: getConversationType(selectedChat.topic) }),
        signal: abortControllerRef.current.signal,
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          accumulatedContent += decoder.decode(value, { stream: true });
          setMessages(prev => prev.map(msg => msg.id === streamingId ? { ...msg, content: accumulatedContent } : msg));
        }
      }
      setMessages(prev => prev.map(msg => msg.id === streamingId ? { ...msg, isStreaming: false } : msg));
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setMessages(prev => prev.map(msg => msg.id === streamingId ? { ...msg, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false } : msg));
    } finally {
      setIsTyping(false);
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        .chat-area-root {
          font-family: 'DM Sans', sans-serif;
        }

        .chat-bg {
          background: 
            radial-gradient(ellipse 80% 60% at 10% 0%, #fef0f0 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 90% 100%, #fce8f8 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 50% 50%, #fffafa 0%, transparent 65%),
            #fefcfc;
        }

        .petal {
          animation: drift linear infinite;
        }

        @keyframes drift {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-80px) rotate(360deg); opacity: 0; }
        }

        .header-glass {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(229, 152, 155, 0.2);
        }

        .avatar-glow {
          box-shadow: 0 0 0 3px rgba(229, 152, 155, 0.2), 0 0 20px rgba(229, 152, 155, 0.3);
        }

        .avatar-pulse-ring {
          animation: ringPulse 2.5s ease-out infinite;
        }

        @keyframes ringPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .topic-pill {
          background: linear-gradient(135deg, rgba(229,152,155,0.15), rgba(216,138,141,0.1));
          border: 1px solid rgba(229,152,155,0.3);
        }

        /* Bot message bubble */
        .bot-bubble {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(229,152,155,0.2);
          box-shadow: 0 4px 24px rgba(229,152,155,0.12), 0 1px 4px rgba(0,0,0,0.04);
          backdrop-filter: blur(10px);
        }

        /* User message bubble */
        .user-bubble {
          background: linear-gradient(135deg, #e5989b 0%, #d88a8d 60%, #c97b7e 100%);
          box-shadow: 0 4px 20px rgba(229,152,155,0.4), 0 2px 8px rgba(0,0,0,0.08);
        }

        .message-enter {
          animation: msgEnter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes msgEnter {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .input-glass {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(229,152,155,0.15);
          box-shadow: 0 -8px 32px rgba(229,152,155,0.08);
        }

        .input-field {
          background: rgba(253,240,240,0.7);
          border: 1.5px solid rgba(229,152,155,0.25);
          transition: all 0.3s ease;
          font-family: 'DM Sans', sans-serif;
        }

        .input-field:focus {
          background: rgba(255,255,255,0.95);
          border-color: rgba(229,152,155,0.7);
          box-shadow: 0 0 0 4px rgba(229,152,155,0.1), 0 2px 12px rgba(229,152,155,0.15);
          outline: none;
        }

        .send-btn {
          background: linear-gradient(135deg, #e5989b, #d88a8d);
          box-shadow: 0 4px 16px rgba(229,152,155,0.5);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.1) rotate(-4deg);
          box-shadow: 0 8px 24px rgba(229,152,155,0.6);
        }

        .send-btn:active:not(:disabled) {
          transform: scale(0.94);
        }

        .send-btn:disabled {
          background: linear-gradient(135deg, #e8c8c9, #dbb5b7);
          box-shadow: none;
          opacity: 0.6;
        }

        .typing-dot {
          width: 7px;
          height: 7px;
          background: #e5989b;
          border-radius: 50%;
          animation: typingBounce 1.2s ease-in-out infinite;
        }

        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .cursor-blink {
          display: inline-block;
          width: 2px;
          height: 14px;
          background: #e5989b;
          margin-left: 2px;
          vertical-align: middle;
          animation: cursorBlink 0.8s step-end infinite;
        }

        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .online-dot {
          width: 9px;
          height: 9px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 0 2px white, 0 0 6px rgba(74,222,128,0.6);
          animation: onlinePulse 2s ease-in-out infinite;
        }

        @keyframes onlinePulse {
          0%, 100% { box-shadow: 0 0 0 2px white, 0 0 6px rgba(74,222,128,0.6); }
          50% { box-shadow: 0 0 0 2px white, 0 0 12px rgba(74,222,128,0.9); }
        }

        .icon-btn {
          transition: all 0.2s ease;
          color: #c9a0a2;
        }

        .icon-btn:hover {
          color: #e5989b;
          transform: scale(1.12);
        }

        .cormorant { font-family: 'Cormorant Garamond', serif; }

        .sparkle-badge {
          background: linear-gradient(135deg, rgba(229,152,155,0.15), rgba(180,120,200,0.1));
          border: 1px solid rgba(229,152,155,0.25);
        }

        .scroll-area::-webkit-scrollbar { width: 4px; }
        .scroll-area::-webkit-scrollbar-track { background: transparent; }
        .scroll-area::-webkit-scrollbar-thumb { background: rgba(229,152,155,0.3); border-radius: 4px; }
        .scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(229,152,155,0.5); }

        .timestamp { font-size: 10px; color: #c4a8a9; letter-spacing: 0.02em; }

        .loading-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        .divider-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: #d4a5a7;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .more-btn {
          transition: all 0.2s ease;
        }

        .more-btn:hover {
          background: rgba(229,152,155,0.12);
          transform: rotate(90deg);
        }
      `}</style>

      <div className="chat-area-root flex-1 flex flex-col h-full chat-bg relative overflow-hidden">

        {/* Ambient floating petals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {petals.map((p, i) => (
            <div
              key={i}
              className="absolute petal"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.animDelay,
                animationDuration: p.animDur,
                transform: `scale(${p.size})`,
              }}
            >
              <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
                <ellipse cx="10" cy="13" rx="6" ry="11" fill="#e5989b" opacity="0.35" transform="rotate(-15 10 13)" />
              </svg>
            </div>
          ))}
        </div>

        {/* Soft mesh orbs */}
        <div className="absolute top-[-80px] right-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,200,202,0.10) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[80px] left-[-80px] w-[250px] h-[250px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(220,180,230,0.08) 0%, transparent 70%)' }} />

        {/* ─── Header ─── */}
        <div className="header-glass px-4 md:px-6 py-3 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-3">
            {isMobile && onOpenSidebar && (
              <button onClick={onOpenSidebar} className="icon-btn p-2 rounded-xl mr-1">
                <Menu className="w-5 h-5" />
              </button>
            )}

            {/* Avatar with rings */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-2xl avatar-pulse-ring" style={{ border: '2px solid rgba(229,152,155,0.4)' }} />
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center relative avatar-glow"
                style={{ background: 'linear-gradient(135deg, #e5989b 0%, #d17a7d 100%)' }}>
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" fill="white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 online-dot" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="cormorant font-semibold text-gray-800 text-base md:text-lg leading-tight capitalize truncate"
                  style={{ letterSpacing: '-0.01em' }}>
                  {selectedChat.topic}
                </h2>
                <span className="sparkle-badge hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-rose-400 flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5" /> AI
                </span>
              </div>
              <p className="text-[11px] text-rose-300 font-light mt-0.5">
                {isLoadingMessages ? "Loading your conversation…" : "Your caring companion · Always here"}
              </p>
            </div>
          </div>

          <button className="more-btn p-2 rounded-xl icon-btn">
            <MoreVertical className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* ─── Messages ─── */}
        <div className="scroll-area flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 z-10 relative">

          {isLoadingMessages ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="flex gap-2">
                {[0, 150, 300].map(delay => (
                  <div key={delay} className="w-3 h-3 rounded-full loading-shimmer"
                    style={{ background: '#e5989b', animationDelay: `${delay}ms` }} />
                ))}
              </div>
              <p className="cormorant italic text-rose-300 text-sm">Loading your conversation…</p>
            </div>
          ) : (
            <>
              {/* Date divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(229,152,155,0.25), transparent)' }} />
                <span className="divider-text">Today</span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(229,152,155,0.25), transparent)' }} />
              </div>

              {messages.map((msg, index) => {
                const isNew = !hasAnimated.has(msg.id);
                if (isNew && !msg.isStreaming) setHasAnimated(prev => new Set(prev).add(msg.id));
                const isBot = msg.type === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isBot ? 'justify-start' : 'justify-end'} ${isNew && !msg.isStreaming ? 'message-enter' : ''}`}
                    style={{ animationDelay: isNew && !msg.isStreaming ? `${Math.min(index * 0.05, 0.3)}s` : '0s' }}
                  >
                    <div className={`flex items-end gap-2 max-w-[82%] md:max-w-[68%] ${isBot ? '' : 'flex-row-reverse'}`}>

                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center mb-0.5 ${
                        isBot
                          ? 'shadow-sm'
                          : ''
                      }`}
                        style={{
                          background: isBot
                            ? 'linear-gradient(135deg, #f4c4c6 0%, #e5989b 100%)'
                            : 'linear-gradient(135deg, #d88a8d 0%, #c97b7e 100%)',
                          boxShadow: isBot
                            ? '0 2px 8px rgba(229,152,155,0.25)'
                            : '0 2px 8px rgba(201,123,126,0.3)',
                        }}>
                        {isBot
                          ? <Heart className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="white" />
                          : <User className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                        }
                      </div>

                      <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                        <div className={`rounded-2xl px-4 py-3 ${isBot ? 'bot-bubble rounded-bl-sm' : 'user-bubble rounded-br-sm'}`}>
                          <p className="text-[13px] md:text-sm leading-relaxed">
                            {isBot
                              ? formatMessageContent(msg.content || (msg.isStreaming ? '' : ''))
                              : <span className="text-white">{msg.content}</span>
                            }
                            {msg.isStreaming && msg.content && <span className="cursor-blink" />}
                            {msg.isStreaming && !msg.content && (
                              <span className="flex gap-1.5 py-0.5">
                                {[0,120,240].map(d => (
                                  <span key={d} className="typing-dot" style={{ animationDelay: `${d}ms` }} />
                                ))}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 px-1">
                          <span className="timestamp">{msg.timestamp}</span>
                          {!isBot && (
                            <span style={{ fontSize: '11px', color: '#e5989b' }}>✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isTyping && !streamingMessageId && (
                <div className="flex justify-start message-enter">
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #f4c4c6, #e5989b)', boxShadow: '0 2px 8px rgba(229,152,155,0.25)' }}>
                      <Heart className="w-3 h-3 text-white" fill="white" />
                    </div>
                    <div className="bot-bubble rounded-2xl rounded-bl-sm px-4 py-3">
                      <span className="flex gap-1.5">
                        {[0,120,240].map(d => (
                          <span key={d} className="typing-dot" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ─── Input Bar ─── */}
        <div className="input-glass px-4 md:px-6 py-4 z-20 relative">
          <div className="flex items-center gap-2.5">

            {/* Left action */}
            <button className="icon-btn flex-shrink-0 p-2 rounded-xl">
              <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Input wrapper */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isTyping ? "She's thinking…" : "Ask me anything, mama…"}
                disabled={isTyping || isLoadingMessages}
                className={`input-field w-full pl-4 pr-16 py-3 rounded-2xl text-sm md:text-[14px] text-gray-700 placeholder-rose-200 ${
                  (isTyping || isLoadingMessages) ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button className="icon-btn"><Smile className="w-4 h-4" /></button>
                <button className="icon-btn"><Mic className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Send */}
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isTyping || isLoadingMessages}
              className="send-btn flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5 text-white" style={{ transform: 'rotate(-4deg)' }} />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-center justify-center gap-1.5">
            <div className="h-px w-8" style={{ background: 'linear-gradient(to right, transparent, rgba(229,152,155,0.4))' }} />
            <p className="cormorant italic text-[11px]" style={{ color: '#d4a5a7' }}>
              For informational purposes only · Always consult your healthcare provider
            </p>
            <div className="h-px w-8" style={{ background: 'linear-gradient(to left, transparent, rgba(229,152,155,0.4))' }} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatArea;