import { CATEGORIES } from '../pages/RecipeForm';
import { supabase } from '../lib/supabase';

const DEFAULT_MODEL = 'gemini-1.5-flash';

export interface AIServiceResponse {
    data?: any;
    error?: string;
}

/**
 * Centralisation des appels IA pour l'administration.
 * Cette classe permet de basculer facilement entre les modèles et de gérer les clés API.
 */
class AIService {
    // ---------------------------------------------------------------------
    // 1️⃣ Gestion de la clé API
    // ---------------------------------------------------------------------
    private getApiKey(): string {
        // Priorité absolue au localStorage pour la personnalisation utilisateur
        const userKey = localStorage.getItem('gemini_api_key');
        if (userKey) return userKey;

        // Repli sur la clé globale si configurée
        const globalKey = import.meta.env.VITE_GEMINI_API_KEY;
        return globalKey || '';
    }

    private getBaseUrl(): string {
        return localStorage.getItem('ai_base_url') || '';
    }

    // ---------------------------------------------------------------------
    // 2️⃣ Gestion du modèle (Gemini ou OpenAI)
    // ---------------------------------------------------------------------
    /** Retourne le modèle actuellement sélectionné (stocké en localStorage) */
    private getModel(): string {
        return localStorage.getItem('gemini_model') || DEFAULT_MODEL;
    }

    /** Permet de changer le modèle depuis l'UI (ex. via Settings) */
    setModel(modelId: string) {
        localStorage.setItem('gemini_model', modelId);
    }

    // ---------------------------------------------------------------------
    // 3️⃣ Méthode générique d'appel IA (supporte Gemini et OpenAI)
    // ---------------------------------------------------------------------
    private async callModel(prompt: string, systemPrompt: string): Promise<string> {
        const key = this.getApiKey();
        if (!key) throw new Error('Clé API manquante. Configurez-la dans les Réglages.');

        const model = this.getModel();
        const customUrl = this.getBaseUrl();
        const isGemini = model.startsWith('gemini');

        let endpoint = '';
        if (isGemini) {
            endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
        } else {
            // Utilisation du customUrl ou de l'URL par défaut d'OpenAI
            const baseUrl = customUrl.replace(/\/$/, '') || 'https://api.openai.com/v1';
            endpoint = `${baseUrl}/chat/completions`;
        }

        const body = isGemini
            ? {
                contents: [{ parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }],
                generationConfig: {
                    temperature: 0.8,
                    responseMimeType: 'application/json'
                },
            }
            : {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.8,
                response_format: { type: "json_object" } // Standard OpenAI JSON mode
            };

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (!isGemini) {
            (headers as any)['Authorization'] = `Bearer ${key}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Erreur API (${response.status}): ${err}`);
        }
        const json = await response.json();
        if (isGemini) {
            return json.candidates[0].content.parts[0].text;
        } else {
            return json.choices[0].message.content;
        }
    }

    // ---------------------------------------------------------------------
    // 4️⃣ Méthodes métier existantes, ré‑écrites avec callModel
    // ---------------------------------------------------------------------
    async generateRecipeDetails(recipeName: string): Promise<AIServiceResponse> {
        const systemPrompt = `Tu es un chef expert en cuisine africaine.\nGénère les détails complets pour la recette : "${recipeName}".\nRéponds UNIQUEMENT en JSON valide avec ces clés :\n{\n  \"alias\": \"nom local\",\n  \"region\": \"région d'origine\",\n  \"category\": \"une parmi: ${CATEGORIES.map((c: any) => c.value).join(', ')}\",\n  \"difficulty\": \"Facile, Moyen ou Difficile\",\n  \"prep_time\": \"ex: 15 min\",\n  \"cook_time\": \"ex: 45 min\",\n  \"description\": \"2 phrases d'histoire/culture\",\n  \"technique_title\": \"titre technique\",\n  \"technique_description\": \"2 phrases d'explication\",\n  \"benefits\": \"bienfaits en 1 phrase\",\n  \"style\": \"style de cuisson\",\n  \"type\": \"type de plat\"\n}`;
        try {
            const text = await this.callModel('', systemPrompt);
            return { data: JSON.parse(text) };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    async suggestSections(catalogContext: string, goal: string): Promise<AIServiceResponse> {
        const systemPrompt = `Expert UX Cuisine. Analyse ce catalogue et propose une section thématique pour l'objectif : "${goal}".\nCatalogue :\n${catalogContext}\n\nRéponds en JSON :\n{\n  \"title\": \"titre\",\n  \"subtitle\": \"sous-titre\",\n  \"type\": \"dynamic_carousel | horizontal_list | vertical_list_1 | featured\",\n  \"recipe_ids\": [\"id1\", \"id2\", \"...\"],\n  \"reasoning\": \"pourquoi ces choix ?\"\n}`;
        try {
            const text = await this.callModel('', systemPrompt);
            return { data: JSON.parse(text) };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    /** Retourne un échantillon de recettes (id + nom) pour le wizard */
    async getSampleRecipes(count: number): Promise<{ id: string; name: string }[]> {
        const { data, error } = await supabase
            .from('recipes')
            .select('id, name, category')
            .order('name') // popularity n'existe pas, on utilise name
            .limit(count);
        if (error) throw new Error(error.message);
        return data.map((r: any) => ({ id: r.id, name: `${r.name} (${r.category})` }));
    }

    async generateSection(type: string, theme: string, recipes: { id: string; name: string }[]): Promise<AIServiceResponse> {
        const catalogContext = recipes.map(r => `ID: ${r.id} | Nom: ${r.name}`).join('\n');
        const systemPrompt = `You are an expert UX designer for an African cuisine app called "AfroCuisto".
Your goal is to create a compelling content section for the admin dashboard.

SECTION TYPE: ${type}
THEME: ${theme}

AVAILABLE RECIPES (PICK FROM THESE):
${catalogContext}

REQUIRED JSON STRUCTURE:
{
  "title": "A catchy title in French",
  "subtitle": "An inviting subtitle in French",
  "type": "${type}",
  "recipe_ids": ["selected_id_1", "selected_id_2"],
  "reasoning": "Brief explanation in French",
  "page": "home or explorer"
}

IMPORTANT:
- Use only IDs from the catalog above.
- The title and subtitle must be in French.
- Return ONLY the JSON object.`;

        try {
            const text = await this.callModel('Generate the section JSON now.', systemPrompt);
            // Nettoyage au cas où l'IA ajoute des balises markdown ```json
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return { data: JSON.parse(cleanedText) };
        } catch (err: any) {
            console.error('AI Generation error:', err);
            return { error: err.message };
        }
    }
}

export const aiService = new AIService();
