//create a JWT and store it in redis and then call it when the user is logging in 
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import { error } from "console";
import { JwtPayload } from "jsonwebtoken";

interface MyJwtPayload extends JwtPayload{
    msg : string;
}


dotenv.config();
const JWT_SECRET  = process.env.JWT_SECRET

export async function createJWT(email : string) : Promise<any>{
    let secret ;
    try{
        if(JWT_SECRET){
            secret = await jwt.sign({email : email} , JWT_SECRET )
            return secret;
    }
        else{
            console.log("there was an error while signing the JWT look into it");
            return error;
    }
    }
    catch(e){
        console.log(e);
        return e;
    }
}

export async function checkJWT(jwtSecret:string , email : string): Promise<boolean> {
    let secretCheck;
    try{
        if(JWT_SECRET){
            secretCheck = await jwt.verify(jwtSecret , JWT_SECRET) as MyJwtPayload;
            console.log(secretCheck);
            if(email === secretCheck.email){
                return true;
            }
        }
        else{
            console.log("there was an error trying to retrieve the JWT_SECRET , please check")
            return false;
        }
    }
    catch(e){
        console.log(e)
    }
    return false;
}

