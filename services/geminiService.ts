
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getDistance = async (origin: string, destination: string): Promise<number | null> => {
  const model = 'gemini-2.5-flash';
  
  // Prompt otimizado para usar Search e Maps, garantindo maior taxa de sucesso na localização
  const prompt = `Tarefa: Calcular a distância de carro (em km) entre "${origin}" e "${destination}".
  Contexto: Minas Gerais, Brasil.
  
  Instruções Críticas:
  1. O objetivo é obter um valor numérico para cálculo de frete.
  2. Use o 'googleSearch' para encontrar a distância rodoviária se o 'googleMaps' falhar ou for ambíguo. (Pesquise termos como "distância de carro entre ${origin} e ${destination}").
  3. Se houver ambiguidade no nome da cidade (ex: "Palma"), assuma SEMPRE que é o município dentro de Minas Gerais (Palma, MG).
  4. Se não encontrar um endereço exato (rua/número), use o centro da cidade ou bairro.
  5. PRIORIDADE: Você DEVE retornar um número. Se não conseguir a precisão exata, retorne a melhor estimativa baseada em dados de busca. NÃO retorne mensagens de erro ou explicações de que não conseguiu calcular.
  6. Formato: Responda APENAS com o número (exemplo: 150.5).`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        // Habilita tanto Maps quanto Search para robustez na localização de pontos de interesse
        tools: [{ googleMaps: {}, googleSearch: {} }],
        temperature: 0.1,
      },
    });
    
    const text = response.text?.trim();

    if (!text) {
        console.error("Empty response from Gemini");
        return null;
    }

    // Normaliza separadores decimais (vírgula para ponto) para parsing correto
    const sanitizedText = text.replace(',', '.');

    // Tenta extrair o primeiro número válido encontrado na string (inteiro ou float)
    // Isso previne erros caso o modelo responda algo como "A distância é 45.5 km"
    const distanceMatch = sanitizedText.match(/(\d+(\.\d+)?)/);
    
    if (distanceMatch) {
        const distance = parseFloat(distanceMatch[0]);
        if (!isNaN(distance) && distance > 0) {
            return distance;
        }
    }

    console.error("Could not parse a valid distance from Gemini response:", text);
    return null;

  } catch (error) {
    console.error("Error calling Gemini API for distance:", error);
    return null;
  }
};
