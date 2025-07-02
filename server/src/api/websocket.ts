import { Server , Socket } from "socket.io";
import jwt from "jsonwebtoken";
import http from 'http';
import { redisClient } from "../config/db";
import { userInfo } from "os";

// authentication is not perfect , it can be intercepted --> i think we need to use the IP addresses here so that people can't impersonate the user 

const onlineUsers = new Map<string , string>();
//this is not good logic we need to use Redis and that too inMemory this time --> Update this to inMemory storage with a ttl which will be equal to the ttl of JWT key 
//stored on the upstash redis server

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface ChatMessagePayload {
  content : string;
  timestamp : string;
  recipientID : string;
}

export function initializeWebSocketServer(server: http.Server) {
  const io = new Server(server, {
    // THIS BLOCK IS CRUCIAL
    cors: {
      origin: "*", 
      methods: ["GET", "POST"]
    }
  });



  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      console.log("we reached here");
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new Error('Authentication error: No token provided or malformed header.'));
      }
      
      // Extract the token from the  string
      const token = authHeader.split(' ')[1];
      console.log("we reached here part 2" );
      console.log(token);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email : string };
      console.log("we reached here 3");
      const userId = decoded.email;
      socket.userId = userId;
      next();
      
    } catch (error) {
      return next(new Error('Authentication error: Invalid token.'));
    }
  });


  io.on('connection', (socket: AuthenticatedSocket ) => {
    console.log("reaching on connection part  \n \n \n")
    const userId = socket.userId!; 
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
    
    onlineUsers.set(userId, socket.id);
    console.log(userId , socket.id);

    socket.emit('auth_success', { message: 'Authentication successful.' });

    socket.on('chat_message', (payload: ChatMessagePayload) => {
      const {content , timestamp , recipientID} = payload
      const recipientId = recipientID
      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        console.log(`Relaying message from ${userId} to ${recipientId}`);
        
        const messageToSend = {
          senderId: userId,
          encryptedMessage: payload.content,
        };
        io.to(recipientSocketId).emit('incoming_message', messageToSend);

      } else {
        console.log(`Recipient ${recipientId} is not online.`);
        socket.emit('error', { message: `User ${recipientId} is not online.` });
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected.`);
      }
    });
  });


  console.log('Socket.IO server initialized.');
}