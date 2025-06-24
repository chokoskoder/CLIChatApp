//all the websocket logic comes here
import express from 'express';
import {createServer } from 'http';
import dotenv from 'dotenv';


const app = express();

const httpServer = createServer(app);


