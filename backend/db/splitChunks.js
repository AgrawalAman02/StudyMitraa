import { encode } from "gpt-3-encoder"; // Helps count tokens

const CHUNK_SIZE = 200; // Adjust based on your use case

const splitTextIntoChunks = (text) => {
    const sentences = text.split(/(?<=[.!?])\s+/); // Split by sentence
    let chunks = [];
    let currentChunk = "";

    for (let sentence of sentences) {
        if (encode(currentChunk + sentence).length > CHUNK_SIZE) {
            chunks.push(currentChunk);
            currentChunk = sentence; 
        } else {
            currentChunk += " " + sentence;
        }
    }
    if (currentChunk) chunks.push(currentChunk); // Add last chunk

    return chunks;
};


// Test the splitting function
export default splitTextIntoChunks
