import { Prisma, PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import dotenv from 'dotenv';
dotenv.config();


const REDIS= process.env.REDIS 
export const prisma = new PrismaClient();
let rediss ;
// const client = new Redis(REDIS)
if(REDIS){
    rediss = new Redis(REDIS);
    rediss.on('connect', () => {
  console.log('✅ Successfully connected to Redis!');
});

// Listen for the 'error' event
rediss.on('error', (err) => {
  console.error('❌ Redis Client Error', err);
});
}
else{

}

export const redisClient = rediss;
//lets write all the logic here to enter the data and get the data we want 

// export function async checkDB() {

// }

