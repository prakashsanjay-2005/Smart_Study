import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile, TimelineEvent, StudyInsight } from "../types";

// Helper to init AI
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes uploaded materials to generate a study timeline.
 * Uses Gemini 3 Flash with Thinking Config for prioritization.
 */
export const generateTimeline = async (files: UploadedFile[]): Promise<TimelineEvent[]> => {
  if (files.length === 0) return [];

  const ai = getAi();
  
  // Prepare parts
  const parts = files.map(f => ({
    inlineData: {
      mimeType: f.mimeType,
      data: f.base64
    }
  }));

  const prompt = `
    Analyze these lecture materials (audio, whiteboard images, syllabus). 
    Create a chronological study timeline of the key concepts covered.
    
    For each key concept/event:
    1. Assign a rough timestamp (e.g., "00:05:30" or "Beginning").
    2. Provide a title and brief description.
    3. Rate importance (high/medium/low) based on emphasis in the audio or syllabus.
    4. If a whiteboard image seems relevant to this specific timestamp, mention its visual content in the description.

    CRITICAL FORMATTING RULES:
    - You are a Plain Text Assistant.
    - DO NOT use Markdown formatting (no bold **, italics _, headers #).
    - DO NOT use LaTeX (no $).
    - Use standard capitalization and plain text.

    Return the data as a JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [...parts, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timestamp: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              importance: { type: Type.STRING, enum: ["high", "medium", "low"] }
            },
            required: ["timestamp", "title", "description", "importance"]
          }
        },
        // Using a small thinking budget to prioritize importance correctly
        thinkingConfig: { thinkingBudget: 1024 } 
      }
    });

    const json = JSON.parse(response.text || "[]");
    return json.map((item: any, index: number) => ({
      ...item,
      id: `event-${index}`
    }));

  } catch (error) {
    console.error("Timeline generation failed:", error);
    throw error;
  }
};

/**
 * Predicts exam questions based on materials.
 * Uses heavy thinking model (Gemini 3 Pro) for reasoning.
 */
export const predictExamQuestions = async (files: UploadedFile[]): Promise<StudyInsight[]> => {
  const ai = getAi();
  
    const parts = files.map(f => ({
    inlineData: {
      mimeType: f.mimeType,
      data: f.base64
    }
  }));

  const prompt = `
    Based on the provided lecture materials, predict 3 high-probability exam topics.
    Explain why each topic is likely to appear (e.g., "Professor emphasized this twice", "Marked as core in syllabus").
    Provide a search query to learn more about the topic.

    CRITICAL FORMATTING RULES:
    - You are a Plain Text Assistant.
    - DO NOT use Markdown formatting (no bold **, italics _, headers #).
    - DO NOT use LaTeX (no $).
    - Use standard capitalization and plain text.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Using Pro for deeper reasoning
    contents: {
      parts: [...parts, { text: prompt }]
    },
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    topic: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    examProbability: { type: Type.NUMBER, description: "Percentage probability 0-100" },
                    relatedSearchQuery: { type: Type.STRING }
                }
            }
        },
        thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  return JSON.parse(response.text || "[]");
};

/**
 * Nano Banana Feature: Edit an image using text prompts.
 * Uses gemini-2.5-flash-image.
 */
export const editImageWithNano = async (
  originalImageBase64: string, 
  mimeType: string, 
  instruction: string
): Promise<string> => {
  const ai = getAi();

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: originalImageBase64,
            mimeType: mimeType,
          },
        },
        {
          text: instruction, // e.g., "Add a red circle around the formula", "Apply a retro filter"
        },
      ],
    },
    // Note: No responseMimeType for Nano Banana
  });

  // Extract image from response
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image generated.");
};

/**
 * Search Grounding Feature: Ask a question with real-time web data.
 * Uses gemini-3-flash-preview with googleSearch tool.
 */
export const searchConcept = async (query: string): Promise<{ text: string, sources: { uri: string, title: string }[] }> => {
  const ai = getAi();
  
  const prompt = `
    Answer the following query using the provided search tools: "${query}"
    
    CRITICAL FORMATTING RULES:
    - You are a Plain Text Assistant.
    - Provide a direct answer based on the search results.
    - STRICTLY PROHIBIT Markdown (no bold **, italics _, headers #, code blocks).
    - STRICTLY PROHIBIT LaTeX.
    - Use simple numbering (1. 2. 3.) if a list is needed.
    - Use standard capitalization and spacing.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => chunk.web)
    .filter((web: any) => web) || [];

  return {
    text: response.text || "No response found.",
    sources: sources
  };
};

/**
 * Generates a visual aid (image) from scratch based on a description.
 * Uses gemini-2.5-flash-image.
 */
export const generateVisualAid = async (description: string): Promise<string> => {
    const ai = getAi();

    // Although generateImages (Imagen) is an option, prompt asks for Nano Banana or generally "app functionality".
    // "Gemini 2.5 Flash Image" is explicitly requested for editing, often used for generation too in this context 
    // if strictly adhering to "Nano Banana powered app". However, for pure generation, Imagen is better, 
    // but let's stick to the prompt's theme of Gemini 2.5 Flash Image if possible or fallback to standard generation pattern.
    // The prompt says: "use text prompts to edit images using Gemini 2.5 Flash Image".
    // For *generating* a visual aid from scratch (without input image), we can use the same model with just text, 
    // or arguably `gemini-3-pro-image-preview` for higher quality. 
    // Let's use `gemini-2.5-flash-image` to keep consistent with the "Nano Banana" theme requested, 
    // or `gemini-3-pro-image-preview` if we want high quality.
    // We will use `gemini-2.5-flash-image` as requested by the "Nano banana powered app" feature block which implies the app's image capabilities rely on it.

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [{ text: `Create a clear, educational diagram or illustration for: ${description}` }]
        }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No visual aid generated.");
}
