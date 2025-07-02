import { Request , Response , Router  , NextFunction, ErrorRequestHandler} from "express";
import { getPublicKey } from "../services/communicationLogic";
//this http request/response will be triggered whenever we need to initially store the public key of the user we are talking to locally 

const communicationRouter = Router();

communicationRouter.post('/getpublickey' , async (req : Request , res : Response)=>{
    console.log("reaching here ")
    const {email} = req.body ;
    try{
        console.log("reaching here 2");
        const publicKey = await getPublicKey(email);
        console.log("reaching here 3")
        res.status(200).json({token : publicKey});
        console.log("reaching here 4")
        return ;
    }
    catch(e){
        console.log("reaching here 5")
        res.status(401).json({msg : `there has been an error ${e}`});
        console.log("reaching here 6")
        return ;
    }

})


export default communicationRouter;