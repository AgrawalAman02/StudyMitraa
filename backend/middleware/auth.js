import { userModel } from "../models/user.model.js";
import { decodeToken } from "../utils/jwt.js";


export const authUser = async(req ,res  , next) =>{
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        res.status(401).json({success:false ,message:"User is unAuthorized , No token found"});
        return;
    }
    
    
   
    try{

        const decoded = decodeToken(token);

        if(!decoded){
            res.status(401).json({success:false ,message:"User is unAuthorized , No token found"});
            return;
        }

        const user = await userModel.findOne({ email:decoded.email});
        if(!user){
            res.status(401).json({ message: "User Not found" });
            return;
        }
        req.user = user;
        next();
    }catch(e){
        console.log(e.message);
        
        res.status(500).json({ message: "Something went wrong while decoding jwt" });
        return;
    }
}

