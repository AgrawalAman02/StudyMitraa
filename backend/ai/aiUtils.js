import axios from "axios";
import dotenv from 'dotenv'
dotenv.config();
import { queryDocument, addDocuments } from '../db/chromaSetup.js';


const askGroq = async (prompt, userId, fileId) => {
    console.log("Prompt", prompt, userId, fileId);

    if (!prompt || !userId || !fileId) {
        ai
        return null;
    }
    const relatedChunks = await queryDocument(prompt, userId, fileId);
    const newPrompt = `These are the context (i.e notes provided by student ) ${relatedChunks} \n\n and he have the query of ${prompt}, give him answer based on that , also make sure your answers are authentic. in if possible give it in markdown format or proper format (easy to understand and learn way)`
    console.log("New Prompt", newPrompt)
    const API_KEY = process.env.GROQ_API_KEY;
    console.log("API_KEY", API_KEY)
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
