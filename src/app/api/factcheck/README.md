# Fact-Check API

This API endpoint handles multimodal fact-checking requests using OpenRouter's Bakllava model.

## Endpoint

`POST /api/factcheck`

## Request Body

```json
{
  "imageBase64": "base64-encoded-image-without-prefix",
  "question": "Your question about the image"
}
```

### Parameters

- `imageBase64` (required): Base64-encoded image data (without the `data:image/...` prefix)
- `question` (required): The question or prompt about the image

## Response

The API streams the response from the OpenRouter Bakllava model in real-time using Server-Sent Events (SSE).

## Example

```javascript
const response = await fetch('/api/factcheck', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAA...',
    question: 'Is the information in this image accurate?'
  })
});

// Handle the streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n').filter(line => line.trim() !== '');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6); // Remove 'data: ' prefix
      if (data === '[DONE]') {
        console.log('Stream completed');
        break;
      }
      
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices[0]?.delta?.content || '';
        process.stdout.write(content);
      } catch (e) {
        console.error('Error parsing chunk:', e);
      }
    }
  }
}
```

## Environment Variables

- `OPENROUTER_API_KEY`: Your OpenRouter API key (required)

## Error Handling

- Returns `400` if required fields are missing or invalid
- Returns `500` if there's an error processing the request
- Streams error messages in the response if the API call fails

## Rate Limiting

Consider implementing rate limiting in your application to prevent abuse of the API.
