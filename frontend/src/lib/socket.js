import { io } from 'socket.io-client';

let socket = null;

/**
 * Get or create the singleton socket connection.
 * Call this once after login.
 */
export function getSocket() {
  if (!socket) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    socket = io(apiUrl, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

/**
 * Connect and join the correct room based on user role & IDs.
 * @param {Object} user - { role, profileId, id }
 * @param {string} companyId - for recruiters only
 */
export function connectSocket(user, companyId) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }

  s.on('connect', () => {
    if (user.role === 'student' && user.profileId) {
      s.emit('join_room', `student_${user.profileId}`);
    } else if (user.role === 'recruiter' && companyId) {
      s.emit('join_room', `company_${companyId}`);
    }
  });

  // If already connected, join immediately
  if (s.connected) {
    if (user.role === 'student' && user.profileId) {
      s.emit('join_room', `student_${user.profileId}`);
    } else if (user.role === 'recruiter' && companyId) {
      s.emit('join_room', `company_${companyId}`);
    }
  }

  return s;
}

/**
 * Disconnect the socket (call on logout).
 */
export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
  socket = null;
}
