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

**Response:**
- Success (200): `{ "message": "Hurray We got the response", "content": "response data", "success": true }`
- Error (500): `{ "message": "Please send valid prompt", "success": false }`
