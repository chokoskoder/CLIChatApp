import { Request , Response , Router } from "express";
const router = Router();

interface RegisterRequestBody {
    username : string;
    publicKey : object;  //JWK format 
    encryptedPrivateKey : string; 
    passwordSalt : string;
}

router.post('/register' , async (req: Request , res : Response) :  Promise<void> => {
    const {username , publicKey , encryptedPrivateKey , passwordSalt} = req.body as RegisterRequestBody;

    console.log("recieved registration request for username : " , username);
    console.log("the public recieved is : " , publicKey);

    if (!username || !publicKey || !encryptedPrivateKey || !passwordSalt) {
    // 400 Bad Request
    res.status(400).json({ msg: 'Please enter all fields' });
    return;
  }
  //we will check neon db for the username and if it doesnte exist we will create a new user and store 
  //all his data 

  console.log("The user registration process has been completed!");

})


router.post('/login' , async (req: Request , res : Response) :  Promise<void> =>{
    const {} = req.body ;
})

export default router ;
