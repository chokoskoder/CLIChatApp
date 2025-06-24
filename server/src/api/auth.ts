import { Request , Response , Router  , NextFunction, ErrorRequestHandler} from "express";
import { checkAlreadyExistOrNot, createUser } from "../services/registration";
import { generateOTPFunc, OTPVerifier, sendOtpEmail } from "../services/otpVerifier";
import { redisClient } from "../config/db";
import { checkJWT, createJWT } from "../services/JWT";
const router = Router();

export interface RegisterRequestBody {
    publicKey : object;  //JWK format 
    email : string;
}

router.post('/register' , async (req: Request , res : Response) :  Promise<void> => {
    const { publicKey , email} = req.body as RegisterRequestBody;

    console.log("the public key recieved is : " , publicKey);
    console.log("the email recieved is : " , email);

    if ( !publicKey || !email) {
    res.status(400).json({ msg: 'Please enter all fields' });
    return;
  }
  const check = await checkAlreadyExistOrNot(req.body.email);
  if(check){
    await createUser( publicKey , email);
    console.log("The user registration process has been completed!");
    res.status(200).json({msg : "the user has been created you can now proceed to login"})
  }
  else{
    console.log("the mail has been used previously cant register again ");
    res.status(400).json({msg : "this mail is already taken please sign up with another mail"});
    return;
  }
  //we will check neon db for the username and if it doesnte exist we will create a new user and store 
  //all his data 

  

})


router.post('/login' , async (req: Request , res : Response , next : NextFunction) :  Promise<void> =>{
    const {email} = req.body ;
    const check = await checkAlreadyExistOrNot(req.body.email);
    if(check){
        res.status(400).json({msg : "no such user exists please try registering first"});
        return;
    }
    const otp = generateOTPFunc()
    if(!email){
      res.status(400).json({msg : "please enter the mail you want to login from , no mail recieved by the backend"})
      return;
    }
    sendOtpEmail(email , otp);
    //now here we will need to store this otp in redis with a TTL of 120 seconds and then we can call it and destroy it
    await redisClient?.set(`otp:${email}` , otp , "EX" , 120);
    console.log(`otp sent to email ${email}  , otp : ${otp}`);

    res.status(200).json({msg : "the otp has been sent "});
    

})


router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  
    const check = await checkAlreadyExistOrNot(req.body.email);
    if(check){
        res.status(400).json({msg : "no such user exists please try registering first"});
        return;
    }
    try {
        const { email, otp } = req.body;
        console.log(`Verification attempt for email: ${email} with OTP: ${otp}`);

        if (!email || !otp) {
             res.status(400).json({ msg: "Email and OTP must be provided." });
             return;
        }


        const redisOtpPromise = redisClient?.get(`otp:${email}`);

        const isVerified = await OTPVerifier(otp, redisOtpPromise);

        if (isVerified) {
            console.log(`OTP verified successfully for ${email}`);
            //make JWT here
            const redisKey = `session:${email}`
            const jwt = await createJWT(email);
            JSON.stringify(jwt);
            console.log(jwt);
            await redisClient?.set(redisKey , jwt , "EX" , 86400  );
            
            await redisClient?.del(`otp:${email}`);
            
            res.status(200).json({ msg: "Verification successful!" , token : jwt }); //update the user client to have ability to read this jwt and then use it again when sending request for 
        } else {
            console.log(`OTP verification failed for ${email}`);
            
            res.status(401).json({ msg: "Invalid or expired OTP." });
        }

    } catch (error) {
        console.error("An unexpected error occurred during OTP verification:", error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
});
export default router  ;
