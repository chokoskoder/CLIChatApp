import express from "express";
import dotenv from "dotenv";
import router from "./api/auth";

import { initializeWebSocketServer } from "./api/websocket"; 
import http from "http"; 

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create the httpServer FROM the express app
const httpServer = http.createServer(app);

// Initialize Socket.IO and attach it to the httpServer
initializeWebSocketServer(httpServer)

// Set up your API routes on the express app
app.use('/api/auth' , router); 

// START THE CORRECT SERVER
httpServer.listen(PORT , ()=>{
    console.log(`the server is listening at port ${PORT}`);
});