
import { GoogleGenAI, Type } from "@google/genai";

// Create a helper to get the AI instance dynamically
// Initializing GoogleGenAI with a named parameter and using the environment variable directly.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string, userPrompt: string) => {
  const ai = getAI();
  // Using gemini-3-pro-preview for complex architectural analysis and reasoning tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `You are an expert architectural critic. Analyze this architectural sketch/render and respond to the following prompt: ${userPrompt}` }
      ]
    },
    config: {
        thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  // Extract text output using the .text property (not a method).
  return response.text;
};

export const generateArchitecturalRender = async (prompt: string, aspectRatio: string = "16:9") => {
  const ai = getAI();
  const fullPrompt = `architectural photorealism, high-end interior design, 8k, v-ray style, cinematic lighting, detailed textures, ${prompt}`;
  
  // Call generateImages for the Imagen model.
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: fullPrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: aspectRatio as any, // Supported: "1:1", "3:4", "4:3", "9:16", "16:9"
      outputMimeType: 'image/jpeg'
    }
  });

  const base64Data = response.generatedImages[0].image.imageBytes;
  return `data:image/jpeg;base64,${base64Data}`;
};

export const transformImageToRender = async (base64Source: string, prompt: string) => {
    const ai = getAI();
    // Using gemini-2.5-flash-image for image-to-image architectural rendering.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64Source, mimeType: 'image/png' } },
                { text: `Transform this architectural sketch into a hyper-realistic architectural render. ${prompt}. Ensure architectural photorealism, 8k, v-ray style.` }
            ]
        }
    });

    // Iterate through all parts to find the generated image, as recommended for nano banana series models.
    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
        if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
        } else if (part.text) {
            console.debug("Model text response:", part.text);
        }
    }
    return imageUrl || null;
}
