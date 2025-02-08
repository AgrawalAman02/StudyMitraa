import { ChromaClient } from "chromadb";
import axios from "axios";
import dotenv from "dotenv";


dotenv.config();

const CHROMA_URL = "http://localhost:8000"; // Update if needed
const client = new ChromaClient({
  path: CHROMA_URL,
  tenant: "default_tenant", // Ensure this is correctly set
});


const COLLECTION_NAME = "study_mitra_docs"; // Change as per need

// Function to create or get collection
export const getCollection = async () => {
  try {
    return await client.getOrCreateCollection({ name: COLLECTION_NAME });
  } catch (error) {
    console.log("Error getting collection:", error.message);
  }
};

// Function to add documents (text chunks) with embeddings
export const addDocuments = async (docs, userId, fileId) => {
  try {
    const collection = await getCollection();
    const ids = docs.map((_, index) => `doc_${Date.now()}_${index}`);

    // Get embeddings for each chunk
    const embeddings = await Promise.all(docs.map(getEmbeddings));

    // Add metadata for user and file

    await collection.add({
      ids,
      documents: docs,
      embeddings,
      metadatas: docs.map(() => ({ userId, fileId })),
    });

    console.log(`Documents added for User: ${userId}, File: ${fileId}`);
  } catch (error) {
    console.error("Error adding documents:", error);
  }
};


// Function to query the most relevant chunk
export const queryDocument = async (query, userId, fileId, topK = 3) => {
  try {
    const collection = await getCollection();
    const queryEmbedding = await getEmbeddings(query);

    // Query with filtering by metadata
    const results = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: topK,
      where: { $and: [{ userId }, { fileId }] }, // Filters results by user and file
    });

    if (results.documents.length === 0) {
      console.log("No related embeddings found.");
      return null;
    }
    return results.documents;
  } catch (error) {
    console.log("Error querying document:", error.message);
  }
};

// Function to get OpenAI/Groq embeddings
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

// Function to get all documents from a collection
export const getAllDocuments = async () => {
  try {
    const collection = await getCollection();
    const results = await collection.get();
    return results.documents;
  } catch (error) {
    console.log("Error getting all documents:", error.message);
    return [];
  }
};
// Function to list all collections
export const listCollections = async () => {
  try {
    const collections = await client.listCollections();
    console.log("Collections:", collections);
  } catch (error) {
    console.error("Error listing collections:", error);
  }
};


const docs = ["take a breath it's hot and cold", "i can feel it now", "i can feel it now and your neck is hot too and "];
await addDocuments(docs, "default", "0");
const res = await getAllDocuments();
console.log(res)

