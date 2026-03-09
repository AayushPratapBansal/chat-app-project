import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

export default function UserList({ onSelect }) {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data.filter((u) => u.username !== user.username));
    };
    fetchUsers();
  }, []);

  return (
   <div className="w-48 border-r border-gray-300 p-2">
  <h3 className="font-bold mb-2">Users</h3>
  {users.map((u) => (
    <div
      key={u._id}
      onClick={() => onSelect(u.username)}
      className="cursor-pointer p-1 bg-gray-100 mb-1 rounded hover:bg-gray-200"
    >
      {u.username}
    </div>
  ))}
</div>
  );
}
