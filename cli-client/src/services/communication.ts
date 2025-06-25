import { Socket } from "socket.io";
import io from "socket.io-client"
const API_BASE_URL = "http://localhost:8454"

interface MySocket extends Socket{

}


export function connectWebSocket(token: string): ReturnType<typeof io>{
  console.log('Attempting to connect to WebSocket server...');
  
  const socket = io(API_BASE_URL, {
    extraHeaders: {
      Authorization: `Bearer ${token}`
    } 
  });


  // --- Standard Event Listeners ---
  socket.on('connect', () => {
    console.log(` Successfully connected to server with socket ID: ${socket.id}`);
  });

  socket.on('auth_success', (data) => {
    console.log(` Authentication successful: ${data.message}`);
  });

  socket.on('incoming_message', (data) => {
    console.log(`\n📬 [From: ${data.senderId}]: DECRYPTED_MESSAGE_HERE`);

    console.log('Encrypted Payload:', data.encryptedMessage);
  });

  socket.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from server.');
  });
  
  return socket;
}