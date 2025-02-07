import axios from "axios";
import dotenv from 'dotenv'
dotenv.config();

const askGroq = async(prompt) =>{
    const API_KEY = process.env.GROQ_API_KEY;
    try {
             
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-8b-8192",
                messages: [{ role: "user", content: prompt }],
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

return askGroq;

