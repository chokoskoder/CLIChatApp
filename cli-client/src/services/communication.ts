import { Socket } from "socket.io-client";
import io from "socket.io-client"
import axios from 'axios'
import { protectSharedSecret, useProtectedPrivateKey, useSharedSecret } from "./protectInformation";
import { getPublicKey } from "@noble/ed25519";
import { storePublicKey, usePublicKey } from "./storeData";
import { deriveSharedSecret, encryptMessage } from "./encryption";
const API_BASE_URL = "http://localhost:8454"


interface ApiResponse{
  publicKey : string;
  msg : string;
}

interface MessageRecieved{
  senderId: string,
  encryptedMessage: string,
  iv : Uint8Array
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
    //decrypt here 
    console.log(`\n📬 [From: ${data.senderId}]: DECRYPTED_MESSAGE_HERE`);
    //here we will extract the iv and send it to decrypt message and get our message

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

async function createSharedSecret(recipientID : string) {
  const publicKey = await usePublicKey(recipientID);
  console.log(publicKey)
  const privateKey = await useProtectedPrivateKey('chokoskoder@gmail.com');
  console.log(privateKey)
  const sharedSecret = await deriveSharedSecret(publicKey , privateKey)
  await protectSharedSecret(sharedSecret , recipientID);

}

export  async function sendMessage(socket : Socket , message : string , recipientID : string ) : Promise<void>{
  if (socket && socket.connected) {
    try{
      //time to add encryption here and then add decryption above
      //call the public key of the recipient as we stored and the private key 
      console.log("we are here")
      await createSharedSecret(recipientID);
      const sharedSecret = await useSharedSecret(recipientID);
      const { ciphertext , iv} = await encryptMessage(message , sharedSecret)
      const payload = {
        content : ciphertext ,
        timestamp : new Date().toISOString(),
        recipientId : recipientID,
        iv : iv
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