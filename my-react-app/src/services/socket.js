import { io } from "socket.io-client";

// const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://chat-app-project-4.onrender.com";

let socket;

export const connectSocket = (token) => {
  socket = io(SOCKET_URL, {
    auth: {
      token: token,
    },
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
