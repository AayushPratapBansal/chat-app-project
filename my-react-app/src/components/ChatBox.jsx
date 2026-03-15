import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function ChatBox({ selectedUser }) {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false); 
  const socketRef = useRef(null); 
  const messagesEndRef = useRef(null); 

    useEffect(() => {
    if (!user) return;
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

socketRef.current = io(SOCKET_URL, {
  transports: ["websocket"],
});

    socketRef.current.emit("join", user.username);
    
      return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]); 
  
  useEffect(() => {
    if (!selectedUser || !user) return;
    
    const fetchMessages = async () => {
      try {
        const res = await api.get("/messages", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        const filtered = res.data.filter(
          (m) =>
            (m.sender === user.username && m.receiver === selectedUser) ||
            (m.sender === selectedUser && m.receiver === user.username)
        );
        
        setMessages(filtered);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    fetchMessages();
  }, [selectedUser, user]);

  useEffect(() => {
    if (!socketRef.current || !selectedUser) return;
    
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => {
          const exists = prev.some(m => m._id === msg._id || 
          (m.content === msg.content && 
           m.sender === msg.sender && 
           m.timestamp === msg.timestamp));
        
        if (exists) return prev;
        
      
        if (
          (msg.sender === user.username && msg.receiver === selectedUser) ||
          (msg.sender === selectedUser && msg.receiver === user.username)
        ) {
          return [...prev, msg];
        }
        return prev;
      });
    };
    
    socketRef.current.on("receive_message", handleReceiveMessage);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message", handleReceiveMessage);
      }
    };
  }, [selectedUser, user]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (message.trim() === "" || sending || !selectedUser) return;
    
    setSending(true);
    
    
    const tempId = Date.now() + Math.random();
    const newMessage = {
      _id: tempId, 
      sender: user.username,
      receiver: selectedUser,
      content: message,
      timestamp: new Date().toISOString(),
      temp: true 
    };
    
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      
      socketRef.current.emit("send_message", {
        sender: user.username,
        receiver: selectedUser,
        content: message,
        tempId 
      });
      
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setSending(false);
    }
  }, [message, sending, selectedUser, user]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!selectedUser) {
    return <div style={{ padding: "20px" }}>Select a user to chat with.</div>;
  }

  return (
    <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", height: "100%" }}>
      <h3>Chat with {selectedUser}</h3>
      
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        border: "1px solid gray",
        padding: "10px",
        marginBottom: "10px",
        maxHeight: "400px"
      }}>
        {messages.map((msg) => (
          <div 
            key={msg._id || `${msg.sender}-${msg.timestamp}-${msg.content}`} 
            style={{ 
              margin: "5px",
              textAlign: msg.sender === user.username ? "right" : "left",
              opacity: msg.temp ? 0.7 : 1
            }}
          >
            <b>{msg.sender}: </b>
            <span>{msg.content}</span>
            {msg.temp && <small> (sending...)</small>}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type message..."
          style={{ 
            flex: 1,
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
          disabled={sending}
        />
        <button 
          onClick={sendMessage}
          disabled={sending || !message.trim()}
          style={{
            padding: "8px 16px",
            backgroundColor: sending ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: sending ? "not-allowed" : "pointer"
          }}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}