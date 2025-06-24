import axios from "axios";
import { exportPublicKey, generateIdentityKeyPair } from "./encryption";
import { protectKeys } from "./protectInformation";
interface ApiResponse {
    msg : string;
    token :string;
}
interface ApiErrorResponse {
    msg : string;
}


export async function handleRegister(email : string ){
    console.log("starting the registration process....");
    try{
        console.log("generating key pair for e2e encryption....");
        //we need to put some kind of blocking here so that the user cant create keypairs again and again 
        const keyPair = await generateIdentityKeyPair(); // put this into if public key doesnt exist only then we make a new pair , but a user wont go through all the struggle to register again and again would he ?
        const  { privateKey , publicKey } =  keyPair;
        const exportablePublicKey = exportPublicKey(publicKey);
        const posting = await axios.post<ApiResponse>("http://localhost:8454/api/auth/register" , {
            email : email , 
            publicKey : exportablePublicKey
        })//we need to send a JSON  payload here with all the things we need while registering a user right ?
        .then(async (response)=>{
            await protectKeys(keyPair , email);
            console.log(response.data.msg)
        })
        .catch((e)=>{
          console.log(e.response.data.msg);  
        })
 
    }
    catch(error){
        console.log("we encountered some error please try again");
    }

}

export async function handleLogin(email : string){
    console.log("strating the log in process....");
    try{
        const response = await axios.post<ApiResponse>("http://localhost:8454/api/auth/login" , {
        email : email
    })
        .then((response)=>{
            console.log(response.data.msg , response.data.token)
        })
        .catch((e)=>{
          console.log(e.response.data.msg);  
        })
    }
    catch(e){
        console.log(e);
    }
}

export async function handleVerification(email : string , otp : string){
    console.log("Starting the verification process....");
    if(!email || !otp){
        console.log("please enter the email you want to login with and the otp you recieved");
    }
    try{

        const response = await axios.post<ApiResponse>("http://localhost:8454/api/auth/verify" , {
            email : email, 
            otp : otp
        })
        .then((response)=>{
            console.log(response.data.msg)
        })
        .catch((e)=>{
          console.log(e.response.data.msg);  
        })
    } catch(e){
        console.log(e);
    }



}