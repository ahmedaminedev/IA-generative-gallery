const API_KEY = process.env.GOOGLE_API_KEY || process.env.API_KEY;
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

if (!API_KEY) {
  // We log a warning instead of throwing immediately to allow the UI to render and show error later if needed.
  console.warn("API Key not found in environment variables. Please set GOOGLE_API_KEY.");
}

// Helper to parse base64 string and mime type
const parseImageInput = (input: string) => {
  // Check if it's a data URL
  const match = input.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2]
    };
  }
  // Fallback - assume raw base64 and png if no header found
  return {
    mimeType: 'image/png',
    data: input.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "")
  };
};

export const generateSceneDescription = async (
  imageBase64: string,
  productName: string,
  theme: string
): Promise<string> => {
  if (!API_KEY) throw new Error("Missing API Key");
  const { mimeType, data } = parseImageInput(imageBase64);

  const prompt = `You are an expert creative director for high-end cosmetic brands. 
  Analyze the product in the image.
  Write a single, evocative, and visually descriptive paragraph (approx 50-70 words) describing a modern, premium background setting for this product.
  
  Product Name: ${productName}
  Target Aesthetic: ${theme}
  
  Focus on materials (e.g., silk, marble, water, glass), lighting (e.g., softbox, sunlight, neon), and mood. 
  Do NOT describe the product itself in detail, focus on the SCENE around it.
  Output ONLY the paragraph.`;

  try {
    const response = await fetch(`${BASE_URL}/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return text?.trim() || "A luxury studio setting with soft lighting.";
  } catch (error) {
    console.error("Description Generation Error:", error);
    throw error;
  }
};

export const generateProductGallery = async (
  imageBase64: string,
  productName: string,
  themePrompt: string,
  description: string,
  extraElements: string
): Promise<string[]> => {
  if (!API_KEY) throw new Error("Missing API Key");
  const { mimeType, data } = parseImageInput(imageBase64);

  // Define 5 distinct compositions for the gallery to ensure variety but coherence
  const compositions = [
    "Composition: Hero shot, eye-level, perfectly centered, symmetric studio composition.",
    "Composition: Top-down flat lay view, artistic arrangement with negative space.",
    "Composition: 3/4 Angle, dynamic perspective, slightly looking up at the product (heroic).",
    "Composition: Close-up macro shot, focusing on the product texture and integration with the background elements, shallow depth of field.",
    "Composition: Wide environmental shot, showing the product in a broader lifestyle context or expansive abstract scene."
  ];

  const generateSingleImage = async (composition: string): Promise<string> => {
    const prompt = `Generate a high-quality photorealistic product image.
    
    Input Object: The product in the provided image (${productName}).
    Background Environment: ${themePrompt}.
    Scene Description: ${description}.
    ${composition}
    Additional Details: ${extraElements}.
    
    Style: 8k resolution, commercial advertising photography, cinematic lighting.
    Instruction: Seamlessly integrate the product into the generated background.
    IMPORTANT: Output ONLY the generated image. Do not provide a text response.`;

    try {
      const response = await fetch(`${BASE_URL}/gemini-2.5-flash-image:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data
                }
              }
            ]
          }],
          generationConfig: {
             // No specific config needed for standard generation, but keeping object ready.
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates[0].content.parts) {
        // Prioritize finding the image part
        for (const part of result.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        
        // If we are here, no image was found. Check for text error.
        const textPart = result.candidates[0].content.parts.find((p: any) => p.text);
        if (textPart && textPart.text) {
          console.warn("Model returned text instead of image:", textPart.text);
          throw new Error(`The model responded with text instead of an image. Please try again with a simpler description.`);
        }
      }
      throw new Error("No image data found in response");
    } catch (e: any) {
      console.error("Single Image Gen Error:", e);
      throw e;
    }
  };

  try {
    // Generate all 5 variations in parallel
    const results = await Promise.all(compositions.map(comp => generateSingleImage(comp)));
    return results;
  } catch (error) {
    console.error("Gemini Gallery Generation Error:", error);
    throw error;
  }
};