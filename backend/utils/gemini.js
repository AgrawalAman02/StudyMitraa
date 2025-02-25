import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const gemini = async (prompt , imageUrl =null) => {
  try {
    
    // Create the request payload

    if(!imageUrl){
      const response = await model.generateContent(prompt);
      const result =  response.response.text();
      return result;
    }

    // Fetch data from the url.
    const imageData = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    // Convert the image data to base64
    const imageBase64 = Buffer.from(imageData.data, 'binary').toString('base64');


    const image = {
      inlineData:{
        data:imageBase64,
        mimeType:"image/png"
      }
    }

    const response = await model.generateContent([prompt , image]);
    const result =  response.response.text();
    return result;
  } catch (error) {
    console.log("Error occurred", error);
    throw error;
  }
};


export const geminiImage = async (prompt, imageUrl) => {
    try {
        if (!imageUrl) {
            throw new Error('Image URL is required');
        }

        const imageData = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageData.data, 'binary').toString('base64');

        const image = {
            inlineData: {
                data: imageBase64,
                mimeType: "image/png"
            }
        }

        const response = await model.generateContent([prompt, image]);
        const result = response.response.text();
        return result;
    } catch (error) {
        console.log("Error occurred", error);
        throw error;
    }
};





export default gemini;