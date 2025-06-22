// all the express logic here
import express from "express";
import dotenv from "dotenv";
import router from "./api/auth";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use('/api/auth' , router); 

app.listen(PORT , ()=>{
    console.log(`the server is listening at port ${PORT}`);
});