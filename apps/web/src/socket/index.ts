import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io('/', {
      path: '/socket.io',
      auth: { token: localStorage.getItem('accessToken') },
      autoConnect: false,
    });
  }
  return socket;
};

export const connectSocket = (): void => {
  getSocket().connect();
};

export const disconnectSocket = (): void => {
  socket?.disconnect();
  socket = null;
};
