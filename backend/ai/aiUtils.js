import axios from "axios";
import dotenv from 'dotenv'
dotenv.config();
import {queryDocument , addDocuments} from '../db/chromaSetup.js';


const askGroq = async(prompt , userId , fileId) =>{
    console.log("Prompt",prompt , userId , fileId);
    
    if(!prompt || !userId || !fileId){ai
        return null;
    }
    const relatedChunks = await queryDocument(prompt  , userId , fileId );
    const newPrompt = `You are a very inteligent model having the following info , ${relatedChunks} based on that give me the best possible ans to the ${prompt} , if the info have nothing to do with the prompt , then summarize prompt well. You are quite smart so you make the a very crisp and precise summary of the prompt.`
    console.log("New Prompt",newPrompt)
    const API_KEY = process.env.GROQ_API_KEY;
    console.log("API_KEY",API_KEY)
    try {
             
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: newPrompt }],
                temperature: 0.7  // Adjust for creativity (0.1 = precise, 1.0 = creative)
            },
            {
                headers: { Authorization: `Bearer ${API_KEY}` }
            }
        );
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.log(error.message);
        return null;
    }
}


export default askGroq;
