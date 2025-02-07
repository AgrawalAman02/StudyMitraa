# StudyMitraa


# Backend Documentation:
## Architecture : 
![alt text](./assets/architecture.png)

## Api Endpoints 
### AI Document Management

#### POST /ai/addDocument
Adds document context to the system for processing.

**Payload:**
```json
{
    "document": "string (required) - Large text content to process",
    "userId": "string (required) - User identifier",
    "fileId": "string (required) - Unique file identifier"
}
```

**Response:**
- Success (200): `{ "message": "Successfully added to docs", "success": true }`
- Error (400/500): `{ "message": "error message", "success": false, "error": "error details" }`

#### POST /ai/ask
Query the processed documents with prompts.

**Payload:**
```json
{
    "prompt": "string (required) - Query or question",
    "userId": "string (required) - User identifier",
    "fileId": "string (required) - File identifier to query against"
}
```
#### POST /ai/askGeminiText
Query Gemini with text prompts.

**Payload:**
```json
{
    "prompt": "string (required) - Text query",
    "userId": "string (required) - User identifier"
}
```

**Response:**
- Success (200): `{ "message": "Response received", "content": "response data", "success": true }`
- Error (500): `{ "message": "Error processing request", "success": false }`

#### POST /ai/askGeminiImage
Query Gemini with image-based prompts.

**Payload:**
```json
{
    "prompt": "string (required) - Image-related query",
    "userId": "string (required) - User identifier",
    "image": "string (required) - Base64 encoded image"
}
```

**Response:**
- Success (200): `{ "message": "Image analysis complete", "content": "analysis result", "success": true }`
- Error (500): `{ "message": "Error processing image", "success": false }`

**Response:**
- Success (200): `{ "message": "Hurray We got the response", "content": "response data", "success": true }`
- Error (500): `{ "message": "Please send valid prompt", "success": false }`
