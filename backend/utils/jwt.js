import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

export const  generateAuthToken = async(payload)=>{
    const token = jwt.sign(payload , jwtSecret);
    return token;
}

export const decodeToken = (token)=>{
    const decoded = jwt.verify(token , jwtSecret);
    return decoded;
}
