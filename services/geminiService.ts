
import { GoogleGenAI, Type } from "@google/genai";
import { FoodCategory } from "../types";

export const estimateNutrients = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Estimate the nutrition for: "${query}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          foodItem: { type: Type.STRING },
          category: { 
            type: Type.STRING, 
            description: "Must be one of: Proteins, Fruits, Vegetables, Dairy, Grains, Snacks, Drinks, Other" 
          },
          servingSize: { type: Type.NUMBER },
          unit: { type: Type.STRING },
          caloriesPerUnit: { type: Type.NUMBER },
        },
        required: ["foodItem", "category", "servingSize", "unit", "caloriesPerUnit"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getNutritionTips = async (history: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this food log and give 3 short health tips based on these entries: ${JSON.stringify(history)}. Be encouraging.`,
    config: {
      systemInstruction: "You are a professional nutritionist. Keep tips concise, bulleted, and encouraging.",
    }
  });

  return response.text;
};
