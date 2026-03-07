import { GoogleGenerativeAI } from "@google/generative-ai";
import { Recipe } from "./types";

const GEMINI_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || (process.env.GEMINI_API_KEY as string);
const OPENAI_KEY = (import.meta as any).env.VITE_OPENAI_API_KEY || (process.env.OPENAI_API_KEY as string);
const AI_MODEL = (import.meta as any).env.VITE_AI_MODEL || "gemini-1.5-flash";

const genAI = GEMINI_KEY ? new GoogleGenerativeAI(GEMINI_KEY) : null;

export async function getAIRecipeRecommendation(recipes: Recipe[], userName: string): Promise<string> {
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

    try {
        if (AI_MODEL.startsWith("gpt") && OPENAI_KEY) {
            // Utilisation de GPT-4o via OpenAI API
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENAI_KEY}`
                },
                body: JSON.stringify({
                    model: AI_MODEL,
                    messages: [
                        { role: "system", content: "Tu es un assistant culinaire expert d'AfroCuisto." },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!response.ok) throw new Error(`OpenAI Error: ${response.statusText}`);
            const json = await response.json();
            return json.choices[0].message.content.trim();
        } else if (genAI) {
            // Utilisation de Gemini
            const model = genAI.getGenerativeModel({ model: AI_MODEL.includes("gemini") ? AI_MODEL : "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        throw new Error("Aucun modèle ou clé API configurés correctement.");
    } catch (error) {
        console.error("AI Error:", error);
        return "Découvrez notre spécialité du jour sélectionnée pour vous !";
    }
}
