import express from 'express'
const router = express.Router();

import splitTextIntoChunks from '../db/splitChunks.js';
import { addDocuments } from '../db/chromaSetup.js';
import askGroq from '../ai/aiUtils.js';

import gemini from '../utils/gemini.js';
import { geminiImage } from '../utils/gemini.js';

router.post('/addDocument' , async(req , res)=>{
    const {document , userId  ,fileId} = req?.body;
    if(!document || !userId || !fileId) {
        res.status(400).json({success:false , message:"Send a valid document i.e Really large text document"});
        return;
    }

    try {
    const docs = splitTextIntoChunks(document);
    await addDocuments(docs , userId , fileId );
    res.status(200).json({message:"Successfully added to docs" , success:true})  
    } catch (error) {
        res.status(500).json({message:"Failed to perform so : " , success:false , error:error.message});
    }

})

router.post('/ask' , async(req, res)=>{
    const {prompt , userId , fileId} = req.body;
    if(!prompt || !userId || !fileId){
        res.status(500).json({message:"Please send valid prompt" , success:false});
        return;
    }

    const content = await askGroq(prompt , userId , fileId);
    res.status(200).json({message:"Hurray We got the response " , content , success:true , })
})

router.get('/askGeminiText' , async(req , res)=>{
    const {prompt} = req.body;
    if(!prompt ){
        res.status(400).json({json:"Please Provide valid prompt" , success:false , error: "Please send valid data"});
        return;
    }

  try {
    const result = await gemini(prompt);
    res.status(200).json({message:"Succesfully got the answer" , success:true , content:result});
    return;
  } catch (error) {
    res.status(400).json({json:"Please Provide valid prompt" , success:false , error: error.message});
    
  }

})

router.get('/askGeminiImage' , async(req ,res)=>{
    const {prompt , imgUrl} = req.body;
    if(!prompt || !imgUrl){
        res.status(400).json({message:"Please send both image url and prompt"});
        return;
    }

    try {
        const response = await geminiImage(prompt , imgUrl);
     res.status(200).json({message:"Succesfully parsed" , success:true , content:response});
     return;
    } catch (error) {
        res.status(400).json({json:"Please Provide valid prompt" , success:false , error: error.message});
    }

})
export default router;