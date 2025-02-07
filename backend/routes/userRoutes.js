import express from 'express'
const router = express.Router();

import { userModel } from '../models/user.model.js';
import { checkPassword, hashPassword } from '../utils/hashPassword.js';


import { userLoginSchema, userSignupSchema } from '../utils/userValidationSchema.js';
import { generateAuthToken } from '../utils/jwt.js';
import { authUser } from '../middleware/auth.js';

/* @POST /user/signup  */
router.post('/signup' , async(req , res)=>{
    const result = userSignupSchema.safeParse(req.body);
    if(!result.success){
        res.status(400).json({success:false , message:"Please send valid data"});
        return;
    }

    const {fullName , email , password , avatarUrl} = req.body;

    try{
        const hashedPassword = await hashPassword(password );
        const user = await userModel.create({
            fullName,
            email , 
            password:hashedPassword , 
            avatarUrl:avatarUrl?avatarUrl:"https://nerdyabhi.github.io/Cara/img/logo.png"
        })

        const token = await generateAuthToken({ id:user._id , fullName: user.fullName, email: user.email });
        res.status(200).json({success:true , user , token});
    } catch (e) {
        if (e.code === 11000 && e.keyPattern && e.keyPattern.email) {
            res.status(400).json({ success: false, message: "Email already exists" });
        } else {
            res.status(500).json({ success: false, message: "An error occurred", error: e.message });
        }
    }
})

/* @POST /user/login  */
router.post('/login', async(req , res)=>{
    const result = userLoginSchema.safeParse(req.body);
    if(!result.success){
        res.status(400).json({success:false , message:"Please send valid data"});
        return;
    }

    const {email , password} = req.body;
    const user = await userModel.findOne({email}).select('+password');
    if(!user){
        return res.status(401).json({ success:false , message:"No user Exists : kindly login"});
    }

    const isMatch  = await checkPassword(password , user.password);
    if(!isMatch){
        return res.status(401).json({message:"Invalid Password Try again "});
    }
    delete user.password;

    const token =  await generateAuthToken({id:user._id ,fullName:user.fullName, email:user.email})
    res.status(200).json({token , user });
})


router.get('/profile' ,authUser , async(req , res)=>{
        const user = req.user;
        delete user.password;
        res.status(200).json({success:true , message:"Successfully found the user" , user});
})

export default router;
