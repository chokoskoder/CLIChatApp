import { Prisma, PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import dotenv from 'dotenv';
dotenv.config();


const REDIS= process.env.REDIS 
console.log(REDIS);
export const prisma = new PrismaClient();
// const client = new Redis(REDIS)
if(REDIS){
     const client = new Redis(REDIS);
}
else{
    console.log("there is an error in reading the env variables please check ");
}

//lets write all the logic here to enter the data and get the data we want 

// export function async checkDB() {

// }