import { useState, useEffect, useContext } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const socket = io("http://localhost:5000");

export default function ChatBox({ selectedUser }) {
  const { user } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    socket.emit("join", user.username);
  }, [user]);

    useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get("/messages", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const filtered = res.data.filter(
        (m) =>
          (m.sender === user.username && m.receiver === selectedUser) ||
          (m.sender === selectedUser && m.receiver === user.username)
      );
      setMessages(filtered);
    };
    fetchMessages();
  }, [selectedUser]);


  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        (msg.sender === user.username && msg.receiver === selectedUser) ||
        (msg.sender === selectedUser && msg.receiver === user.username)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => socket.off("receive_message");
  }, [selectedUser]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("send_message", {
      sender: user.username,
      receiver: selectedUser,
      content: message,
    });
    setMessage("");
  };

  if (!selectedUser)
    return <div style={{ padding: "20px" }}>Select a user to chat with.</div>;

  return (
    <div style={{ flex: 1, padding: "20px" }}>
      <h3>Chat with {selectedUser}</h3>
      <div style={{ height: "400px", overflowY: "auto", border: "1px solid gray" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: "5px" }}>
            <b>{msg.sender}: </b>{msg.content}
          </div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        style={{ width: "70%", marginTop: "10px" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
