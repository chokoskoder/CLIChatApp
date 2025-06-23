import { Request , Response , Router } from "express";
import { checkUnique, createUser } from "../services/registration";
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


router.post('/login' , async (req: Request , res : Response) :  Promise<void> =>{
    const {} = req.body ;
})

export default router ;
