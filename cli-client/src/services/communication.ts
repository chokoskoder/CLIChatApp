import { Socket } from "socket.io-client";
import io from "socket.io-client"
import axios from 'axios'
const API_BASE_URL = "http://localhost:8454"


interface ApiResponse{
  publicKey : string;
  msg : string;
}


export function connectWebSocket(token: string): ReturnType<typeof io>{
  console.log('Attempting to connect to WebSocket server...');
  
  const socket = io(API_BASE_URL, {
    extraHeaders: {
      Authorization: `Bearer ${token}` 
    } 
  });


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

export  async function sendMessage(socket : Socket , message : string , recipientID : string) : Promise<void>{
  if (socket && socket.connected) {
    try{
      const payload = {
        content : message ,
        timestamp : new Date().toISOString(),
        recipientId : recipientID,
      }

      socket.emit('chat_message' , payload);
      console.log("message sent...");
    }
    catch(e){
      console.error(e)
    }
  }
  else {
    console.log("the socket is not connected homie sorry ")
  }

}