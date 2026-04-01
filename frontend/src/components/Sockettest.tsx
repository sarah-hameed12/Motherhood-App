"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  type: "system" | "message";
  sender?: string;
  message: string;
  timestamp?: string;
};

export default function SocketTest() {
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/ws/chat");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const parsed: ChatMessage = JSON.parse(event.data);
        setMessages((prev) => [...prev, parsed]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { type: "system", message: event.data },
        ]);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket closed");
      setIsConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const payload: ChatMessage = {
      type: "message",
      sender: "Dawood",
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };

    socketRef.current.send(JSON.stringify(payload));
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h2>Socket Test Chat</h2>

      <p>
        Status:{" "}
        <strong>{isConnected ? "Connected" : "Disconnected"}</strong>
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          height: "350px",
          overflowY: "auto",
          padding: "12px",
          marginBottom: "12px",
          background: "#fafafa",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={`${msg.timestamp || "no-time"}-${index}`}
            style={{
              marginBottom: "10px",
              padding: "8px 10px",
              borderRadius: "6px",
              background: msg.type === "system" ? "#f1f5f9" : "#e0f2fe",
            }}
          >
            <div style={{ fontSize: "12px", color: "#555" }}>
              {msg.type === "system" ? "System" : msg.sender || "Anonymous"}
            </div>
            <div>{msg.message}</div>
            {msg.timestamp && (
              <div style={{ fontSize: "11px", color: "#777", marginTop: "4px" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!isConnected}
          style={{
            padding: "10px 14px",
            cursor: "pointer",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: isConnected ? "#111827" : "#9ca3af",
            color: "#fff",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}