
# Lumière AI Studio - API Documentation

This project exposes a powerful AI endpoint allowing you to generate professional cosmetic product photography galleries from a single input image.

## 🚀 Deployment (Netlify)

1.  **Deploy to Netlify**: Connect this repository to Netlify.
2.  **Environment Variables**: In your Netlify Site Settings > Environment Variables, add:
    *   `GOOGLE_API_KEY`: Your Gemini API Key (get it from aistudio.google.com).

## 📡 API Usage

**Endpoint:** `https://your-site-name.netlify.app/.netlify/functions/api`  
**Method:** `POST`  
**Content-Type:** `application/json`

### Request Body Parameters

| Parameter  | Type   | Required | Description |
| :---       | :---   | :---     | :--- |
| `image`    | string | Yes      | Base64 encoded string of the product image. |
| `theme_id` | string | Yes      | One of the preset IDs (see below). |

### Available Themes (`theme_id`)

*   `floral` (Floral Elegance - Soft petals, roses)
*   `minimal` (Ultra Minimalist - Clean lines, shadows)
*   `luxury` (Dark Luxury - Gold, silk, moody)
*   `fresh` (Aqua Fresh - Water splashes, blue)
*   `botanical` (Green Botanical - Rainforest, organic)

---

### Example: JavaScript (Fetch)

```javascript
const generateGallery = async () => {
  const response = await fetch('https://your-site-name.netlify.app/.netlify/functions/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      theme_id: 'luxury',
      image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...' 
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log("AI Description:", result.meta.description_generated);
    console.log("Images:", result.gallery); // Array of 5 Base64 images
  }
};
```

### Example: cURL

```bash
curl -X POST https://your-site-name.netlify.app/.netlify/functions/api \
  -H "Content-Type: application/json" \
  -d '{
    "theme_id": "floral",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA..."
  }'
```

### Response Format

```json
{
  "success": true,
  "meta": {
    "theme_used": "Floral Elegance",
    "description_generated": "A luxurious glass bottle placed on a marble surface..."
  },
  "gallery": [
    "data:image/png;base64,...",
    "data:image/png;base64,...",
    "data:image/png;base64,...",
    "data:image/png;base64,...",
    "data:image/png;base64,..."
  ]
}
```
