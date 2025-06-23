const otp_verify = require("otp-verify");
import dotenv from 'dotenv';
dotenv.config();

const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORDl

otp_verify.setupSenderEmail({
  service: "gmail",
  user: "ryukseesyou@gmail.com",
  //for gmail, create an app password and use it
  pass: GOOGLE_APP_PASSWORD,
});

export async function OTPVerifier(mail : string , userOTP : number)  : Promise<Boolean>{
    let OTP : number = 0 ;
    otp_verify.sendOTP(
  {
    to: mail,
    message: "Enter the below OTP for email validation",
    subject: "Email Verification",
  },
  (err : any, otp : number) => {
    OTP = otp;
    if (err) console.log(err);
    else console.log("Email sent", otp);
  }    
);
    if(userOTP == OTP){
        return true; // need to check this here we cant do this , this will go wrong pakka 
    }
    return false;

}
//this will go to the verify route