import { GoogleGenerativeAI, GenerativeModel, Content } from "@google/generative-ai";

// Initialize Google Generative AI client with the Gemini API key
// Use the Gemini API key from environment variables
const googleGenerativeAI = new GoogleGenerativeAI((import.meta.env as any).VITE_GEMINI_API_KEY);

// Function to generate content using OpenRouter (fallback)
export async function generateWithOpenRouter(_prompt: string, _systemContext?: string) {
  try {
    // Attempting to generate content with OpenRouter
    
    // This is a placeholder implementation
    // In a real implementation, you would integrate with the OpenRouter API
    throw new Error("OpenRouter integration not implemented");
  } catch (error) {
    // OpenRouter failed
    throw error;
  }
}

// Function to generate content using Gemini (primary)
export async function generateWithGemini(prompt: string, systemContext?: string) {
  try {
    // Generating content with model
    
    // Combine system context and prompt for Gemini
    let fullPrompt = prompt;
    if (systemContext) {
      fullPrompt = `${systemContext}\n\nUser question: ${prompt}`;
    }
    
    // Get the Gemini 2.0 Flash model
    const model = googleGenerativeAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();
    
    if (content) {
      // Successfully generated content
      return content;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    // Model failed
    throw error;
  }
}

// Function to generate content with image using Gemini
export async function generateWithGeminiWithImage(imageData: string, prompt: string, systemContext?: string) {
  try {
    // Generating content with model and image
    
    // Get the Gemini 2.0 Flash model
    const model: GenerativeModel = googleGenerativeAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare the image data
    // Remove the data URL prefix if present
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Create the content array with image and text
    const content: Content[] = [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
    ];
    
    // Add system context if provided
    if (systemContext) {
      content.unshift({
        role: "user",
        parts: [{ text: systemContext }],
      });
    }
    
    // Generate content
    const result = await model.generateContent({ contents: content });
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      // Successfully generated content
      return text;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    // Model with image failed
    throw error;
  }
}

// Main function that uses Gemini as the primary provider
export async function generateMedicalResponse(prompt: string, systemContext?: string) {
  try {
    // Try OpenRouter first (fallback mechanism)
    try {
      return await generateWithOpenRouter(prompt, systemContext);
    } catch (openRouterError) {
      // OpenRouter failed, falling back to model
      // If OpenRouter fails, fall back to Gemini
      return await generateWithGemini(prompt, systemContext);
    }
  } catch (error) {
    // All providers failed
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Main function that uses Gemini with image as the primary provider
export async function generateMedicalResponseWithImage(imageData: string, prompt: string, systemContext?: string) {
  try {
    // Use Gemini with image as the primary provider
    return await generateWithGeminiWithImage(imageData, prompt, systemContext);
  } catch (error) {
    // Model with image failed
    throw new Error(`Failed to generate response with model and image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { googleGenerativeAI };