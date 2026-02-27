import { GoogleGenerativeAI } from "@google/generative-ai";
import { Recipe } from "./types";

const genAI = new GoogleGenerativeAI((import.meta as any).env.VITE_GEMINI_API_KEY || (process.env.GEMINI_API_KEY as string));

export async function getAIRecipeRecommendation(recipes: Recipe[], userName: string): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      Tu es l'assistant culinaire expert d'AfroCuisto, une application dédiée à la cuisine béninoise et africaine.
      
      Voici la liste des plats disponibles :
      ${recipes.map(r => `- ${r.name} (${r.region}) : ${r.description}`).join('\n')}
      
      L'utilisateur s'appelle ${userName}.
      
      Choisis un plat du jour parmi cette liste de manière intelligente et originale. 
      Explique ton choix en une seule phrase courte et chaleureuse (maximum 150 caractères). 
      Le ton doit être invitant et mettre en valeur la culture béninoise.
      Donne uniquement la phrase de recommandation.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "Découvrez notre spécialité du jour sélectionnée pour vous !";
    }
}
