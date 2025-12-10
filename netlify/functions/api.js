const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// 1. Theme Configuration
const THEMES = {
  'floral': {
    name: 'Floral Elegance',
    prompt: 'surrounded by lush pink roses and soft petals, romantic atmosphere'
  },
  'minimal': {
    name: 'Ultra Minimalist',
    prompt: 'on a clean geometric podium, hard shadows, studio lighting, minimal aesthetic'
  },
  'luxury': {
    name: 'Dark Luxury',
    prompt: 'on black silk texture with gold accents, dramatic moody lighting, luxury perfume ad'
  },
  'fresh': {
    name: 'Aqua Fresh',
    prompt: 'surrounded by dynamic water splashes and droplets, fresh blue tones, high speed photography'
  },
  'botanical': {
    name: 'Green Botanical',
    prompt: 'in a lush green rainforest setting with monstera leaves, dappled sunlight, organic vibe'
  }
};

// Helper: Parse Base64
const parseImageInput = (input) => {
  const match = input.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: 'image/png', data: input.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "") };
};

// Helper: Generate Description (Step 1)
async function generateAutoDescription(imageBase64, themePrompt) {
  const { mimeType, data } = parseImageInput(imageBase64);
  
  const prompt = `Act as a creative director. Analyze the product in the image. 
  Write a single, visually descriptive paragraph (approx 50 words) describing a background setting matching this aesthetic: "${themePrompt}".
  Focus on lighting and materials. Output ONLY the paragraph.`;

  const response = await fetch(`${BASE_URL}/gemini-2.5-flash:generateContent?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data } }] }]
    })
  });

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || `A professional studio setting with ${themePrompt} style.`;
}

// Helper: Generate Single Image (Step 2)
async function generateSingleImage(imageBase64, description, themePrompt, composition) {
  const { mimeType, data } = parseImageInput(imageBase64);
  
  const prompt = `Generate a high-quality photorealistic product image.
    
  Input Object: The product in the provided image.
  Background Environment: ${themePrompt}.
  Scene Description: ${description}.
  Composition: ${composition}.
  
  Style: 8k resolution, commercial advertising photography, cinematic lighting.
  Instruction: Seamlessly integrate the product into the generated background.
  IMPORTANT: Output ONLY the generated image. Do not provide a text response.`;

  const response = await fetch(`${BASE_URL}/gemini-2.5-flash-image:generateContent?key=${GOOGLE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType, data } }] }]
    })
  });

  const result = await response.json();
  
  // Extract Image
  const b64 = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
  if (!b64) {
    // Check if it returned text error
    const text = result.candidates?.[0]?.content?.parts?.find(p => p.text)?.text;
    if (text) console.log("Gen Error (Text returned):", text);
    return null;
  }
  return `data:image/png;base64,${b64}`;
}

// Main Handler (CommonJS Syntax for Netlify)
exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { image, theme_id } = JSON.parse(event.body);

    // Validation
    if (!image) return { statusCode: 400, body: JSON.stringify({ error: "Missing 'image' (base64 string)" }) };
    if (!theme_id || !THEMES[theme_id]) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ 
          error: "Invalid or missing 'theme_id'. Available: floral, minimal, luxury, fresh, botanical" 
        }) 
      };
    }

    const selectedTheme = THEMES[theme_id];

    // 1. Auto-Generate Description
    const description = await generateAutoDescription(image, selectedTheme.prompt);

    // 2. Define 5 Compositions
    const compositions = [
      "Hero shot, symmetric studio composition",
      "Top-down flat lay view",
      "3/4 Angle, dynamic perspective",
      "Close-up macro shot, texture focus",
      "Lifestyle context, wider shot"
    ];

    // 3. Generate Gallery (Parallel)
    const imagePromises = compositions.map(comp => 
      generateSingleImage(image, description, selectedTheme.prompt, comp)
    );
    
    const results = await Promise.all(imagePromises);
    const successImages = results.filter(img => img !== null);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow usage from other sites
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: JSON.stringify({
        success: true,
        meta: {
          theme_used: selectedTheme.name,
          description_generated: description
        },
        gallery: successImages
      })
    };

  } catch (error) {
    console.error("API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message })
    };
  }
};