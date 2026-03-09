import ChatBox from "../components/ChatBox";
import UserList from "../components/UserList";
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ChatPage() {
  const { logout } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);

  return (
   <div className="flex h-screen">
  <UserList onSelect={setSelectedUser} />
  <ChatBox selectedUser={selectedUser} />
  <button
    onClick={logout}
    className="absolute top-2 right-2 bg-red-500 text-white border-none p-1 px-2"
  >
    Logout
  </button>
</div>  );
}
