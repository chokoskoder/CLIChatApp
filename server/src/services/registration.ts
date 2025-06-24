//simple registration workflow 
// we get the username , we check if it is uniqye or not with the email and then add the data to the DB after matching the OTP

import { prisma } from "../config/db"


export async function checkAlreadyExistOrNot(mail: string) : Promise<boolean> {
const user = await prisma.user.findUnique({
  where: {
    email: mail,
  },
  select : {
    email : true
  }
})
    if(user){
        return false;
    }
    return true;
};



export async function createUser(publicKey : object,  mail : string) : Promise<any>{
    
        const newPublicKey = JSON.stringify(publicKey); // remember to jsonify it back when called from backend in the frontend
        const createUser = await prisma.user.create({
            data : {
                email : mail , 
                publicKey  : newPublicKey,
            },
        })

}

