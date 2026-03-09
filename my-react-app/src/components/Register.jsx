import { useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await api.post("/auth/register", { username, password });
    login(res.data);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
  <div>
    <form onSubmit={handleRegister} className="text-center mt-12">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      
      <input
        className="border p-2 mb-2 rounded w-64"  placeholder="Username"value={username}   onChange={(e) => setUsername(e.target.value)}
      /><br />
      
      <input
        className="border p-2 mb-4 rounded w-64"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      
      <button 
        type="submit" 
        className="bg-blue-500 text-white p-2 rounded w-64 hover:bg-blue-600"
      >
        Register
      </button>
    </form>

    <div className="text-center mt-5">
      <p>Already have an account? 
        <Link to="/login" className="text-blue-500 ml-1 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  </div>
</div>
  );
}