import axios from "axios";
interface ApiResponse {
    msg : string;
}

export async function handleRegister(){
    console.log("starting the registration process....");
    const posting = await axios.post("http://localhost:8454/api/auth/register")   
}
export async function handleLogin(email : string){
    console.log("strating the log in process....");
    try{
        const response = await axios.post<ApiResponse>("http://localhost:8454/api/auth/login" , {
        email : email
    })
        const message = response.data.msg;
        console.log(message);
        console.log("to login using OTP please type /verify example@gmail.com otp , in the specified order");
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
        });
        const message = response.data.msg;

        console.log(message);
    } catch(e){
        console.log(e);
    }



}


//now we need to learn how to slice all this shit up and then send it ahead to our backend in the form it is going to be read and also make sure
//that we can ten call it and use it 