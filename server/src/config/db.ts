import { Prisma, PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import dotenv from 'dotenv';
dotenv.config();


const REDIS= process.env.REDIS 
console.log(REDIS);
export const prisma = new PrismaClient();
let rediss ;
// const client = new Redis(REDIS)
if(REDIS){
    rediss = new Redis(REDIS);
}
else{

}

export const redisClient = rediss;
//lets write all the logic here to enter the data and get the data we want 

// export function async checkDB() {

// }