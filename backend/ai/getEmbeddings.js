

const JINA_API_KEY = process.env.JINA_API_KEY;
import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
async function getEmbeddings(text) {
    try {
        const response = await axios.post(
            "https://api.jina.ai/v1/embeddings",
            {
                model: "jina-embeddings-v2-base-en",
                input: text
            },
            {
                headers: {
                    Authorization: `Bearer jina_ea564f4d374347908855fba8ae9694eetFb0vSUCWYKdc1EW6boz3zQdmts4`,
                    "Content-Type": "application/json"
                }
            }
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Error fetching embeddings:", error.response?.data || error.message);
        return null;
    }
}


const res = await getEmbeddings("AItrika please do it ");
console.log(res);

export default getEmbeddings;