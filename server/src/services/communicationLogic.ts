//we will create all the communication logic which needs to run here , 
//two things we need to make right now : sharing the public key in the correct way and storing the socketID when the socket is connected and when it disconnects 
//removing it from the redis DB

import { prisma } from "../config/db";

async function getPublicKey(email : string) : Promise<string> {
    try{
            const user = await prisma.user.findUnique({
        where: {
            email : email
        }
    })
    if(user){
        return user.publicKey
    }
    }
    catch(e){
        return `error ${e}`
    }
    return "user not found"
}