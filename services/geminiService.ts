import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getDistance = async (origin: string, destination: string): Promise<number | null> => {
  const model = 'gemini-2.5-flash';
  // Updated prompt to request just the number, making the response easier to parse.
  const prompt = `Qual a distância de carro em quilômetros entre "${origin}" e "${destination}"? Responda apenas com o número.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
        temperature: 0.1,
      },
    });
    
    const text = response.text.trim();

    // Standardize decimal separators for robust parsing.
    const sanitizedText = text.replace(',', '.');

    // More robust parsing logic:
    // 1. Try to parse the whole string as a number.
    let distance = parseFloat(sanitizedText);

    // 2. If it fails (e.g., "Approx. 450.5 km"), use a regex to find the first number.
    if (isNaN(distance)) {
        const distanceMatch = sanitizedText.match(/(\d+(?:\.\d+)?)/);
        if (distanceMatch) {
            distance = parseFloat(distanceMatch[1]);
        }
    }

    if (!isNaN(distance) && distance > 0) {
      return distance;
    }

    console.error("Could not parse a valid distance from Gemini response:", text);
    if (response.candidates?.[0]?.groundingMetadata) {
        console.error("Grounding Metadata:", JSON.stringify(response.candidates[0].groundingMetadata));
    }
    return null;

  } catch (error) {
    console.error("Error calling Gemini API for distance:", error);
    return null;
  }
};
