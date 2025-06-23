import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { NumericType } from 'mongodb';


dotenv.config();
const otpStore : Record<string , string> = {};
const mail = process.env.GMAIL;
const pass = process.env.GOOGLE_APP_PASSWORD

const transporter = nodemailer.createTransport({
  service : "gmail",
  auth :{
    user : mail,
    pass : pass
  } 
});

export function generateOTPFunc() : string{
 const otp = Math.floor(100000 + Math.random() * 900000).toString();
 return otp;

}

export async function sendOtpEmail(email : string , otp : string){
    const mailOptions = {
        from : "chokoskoder@gmail.com",
        to : email,
        subject : "Your OTP code:",
        text : `Your OTP code is: ${otp}. It will expire in 5 minutes.`
    }

    try{
        await transporter.sendMail(mailOptions);
        console.log(`otp sent to ${email}  :${otp}`);
    }
    catch(error){
        console.log(error);
    }
}

export async function OTPVerifier(userOtp: string, generatedOtpPromise: Promise<string | null> | undefined): Promise<boolean> {
  // Case 1: The promise was not even passed in (e.g., key was invalid before calling redis.get)
  if (!generatedOtpPromise) {
    console.log("Verification failed: No OTP promise was provided.");
    return false;
  }

  try {
    // Await the result from Redis
    const storedOtp = await generatedOtpPromise;
    console.log(`Redis returned: ${storedOtp}, User provided: ${userOtp}`);

    // Case 2: The key doesn't exist in Redis (OTP expired or was never set)
    // redis.get() returns null for non-existent keys.
    if (storedOtp === null) {
      console.log("Verification failed: OTP not found in store (likely expired or invalid key).");
      return false;
    }

    // Case 3: The OTPs match
    return userOtp === storedOtp;

  } catch (error) {
    // Case 4: The Redis promise rejected (e.g., connection issue)
    console.error("Error during OTP verification while awaiting Redis:", error);
    return false;
  }
}