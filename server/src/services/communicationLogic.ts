import { Server , Socket } from "socket.io";
import jwt from "jsonwebtoken";
import http from 'http';
import { RedisClient } from "ioredis/built/connectors/SentinelConnector/types";
import { redisClient } from "../config/db";

// authentication is not perfect , it can be intercepted --> i think we need to use the IP addresses here so that people can't impersonate the user 

interface InboundPayload{
    type : "auth" | "chat_message" | 'initiate_chat';
    payload : any;
}

const onlineUsers = new Map<string , string>();

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface ChatMessagePayload {
  recipientId: string;
  encryptedMessage: object; 
}

export function initializeWebSocketServer(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust for production for security
    },
  });

  // --- Authentication Middleware ---
  // This runs for every new connecting socket, before the 'connection' event.
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided.'));
    }

    try {
      // 1. Verify the JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const userId = decoded.userId;

      // 2. Check if the session is active in Redis
      const sessionStatus = await redisClient?.get(`session:${userId}`);
      if (sessionStatus !== 'active') {
        return next(new Error('Authentication error: Session not active or expired.'));
      }
      
      // 3. Attach userId to the socket object for use in other events
      socket.userId = userId;
      next(); // Proceed to the 'connection' event

    } catch (error) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });


  // --- Main Connection Handler ---
  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!; // We know userId is attached by the middleware
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
    
    // Store the mapping of userId to their socket.id
    onlineUsers.set(userId, socket.id);

    // Send confirmation back to the client
    socket.emit('auth_success', { message: 'Authentication successful.' });

    // --- Event Listener for Chat Messages ---
    socket.on('chat_message', (payload: ChatMessagePayload) => {
      const recipientId = payload.recipientId;
      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        console.log(`Relaying message from ${userId} to ${recipientId}`);
        
        // Forward the encrypted message directly to the recipient's socket
        const messageToSend = {
          senderId: userId,
          encryptedMessage: payload.encryptedMessage,
        };
        io.to(recipientSocketId).emit('incoming_message', messageToSend);

      } else {
        console.log(`Recipient ${recipientId} is not online.`);
        socket.emit('error', { message: `User ${recipientId} is not online.` });
      }
    });

    // --- Handle Disconnections ---
    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected.`);
      }
    });
  });

  console.log('Socket.IO server initialized.');
}