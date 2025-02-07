import express, { urlencoded } from 'express';
const app = express();
import cors from 'cors';

import userRoutes from './routes/userRoutes.js'
import connectToDB from './utils/dbConnection.js';
import aiRouter from './routes/aiRoutes.js'
// Main Middle-ware 
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["PUT", "GET", "DELETE", "POST", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());
app.use(urlencoded({extends:false}));

/**Connect Mongodb  */
connectToDB();
/* @Routes  */

app.use('/user' , userRoutes);
app.use('/ai' , aiRouter)



/** Last Basic code*/
app.get('/' , (req , res)=>{
    res.send("Hello world ! Study Mitra")
})

app.listen(3000 , (req , res)=>{
    console.log("Server running fine at http://localhost:3000");
    
})