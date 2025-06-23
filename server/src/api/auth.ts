import { Request , Response , Router  , NextFunction, ErrorRequestHandler} from "express";
import { checkUnique, createUser } from "../services/registration";
import { generateOTPFunc, OTPVerifier, sendOtpEmail } from "../services/otpVerifier";
import { redisClient } from "../config/db";
import { checkJWT, createJWT } from "../services/JWT";
const router = Router();

export interface RegisterRequestBody {
    username : string;
    publicKey : object;  //JWK format 
    encryptedPrivateKey : string; 
    passwordSalt : string;
    mail : string;
}

router.post('/register' , async (req: Request , res : Response) :  Promise<void> => {
    const {username , publicKey , encryptedPrivateKey , passwordSalt , mail} = req.body as RegisterRequestBody;

    console.log("recieved registration request for username : " , username);
    console.log("the public key recieved is : " , publicKey);
    console.log("the mail recieved is : " , mail);

    if (!username || !publicKey || !encryptedPrivateKey || !passwordSalt) {
    res.status(400).json({ msg: 'Please enter all fields' });
    return;
  }
  const check = await checkUnique(req.body.mail);
  if(check){
    await createUser(username , publicKey , encryptedPrivateKey , passwordSalt , mail);
  }
  else{
    res.status(400).json({msg : "this mail is already taken please sign up with another mail"});
  }
  //we will check neon db for the username and if it doesnte exist we will create a new user and store 
  //all his data 

  console.log("The user registration process has been completed!");

})


router.post('/login' , async (req: Request , res : Response , next : NextFunction) :  Promise<void> =>{
    const {email} = req.body ;
    //check if JWT exists if it doesnt then we go ahead , use try catch and make JWT when user logs in successfully
    try {
      console.log("we are here");
      //check from redis too 
      const jwt = await redisClient?.get(`session:${email}`);
      console.log(jwt);
      
      if(jwt){
        console.log("we are here");
        const checkSecret = await checkJWT(jwt , email);
        if(checkSecret){
          res.status(200).json({msg : "you have successfully logged in using JWT Sessions"})
          return;
        }
      }
    }
    catch(e){
      console.log(e);
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
            await redisClient?.set(redisKey , jwt , "EX" , 86400  );
            
            await redisClient?.del(`otp:${email}`);
            
            res.status(200).json({ msg: "Verification successful!" });
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
