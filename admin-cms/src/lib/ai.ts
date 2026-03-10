/**
 * ============================================================================
 * EXPLICATION DU FICHIER POUR LES DÉBUTANTS
 * ============================================================================
 * Rôle principal : Connecteur IA pour l'administration. Appelle spécialement les modèles intelligents pour la génération automatique de contenu des recettes.
 * 
 * Conseils de lecture :
 * - Cherchez les mots-clés "function" ou "const" pour voir les actions définies.
 * - Le mot "return" suivi de balises HTML (ex: <div>) indique un élément visuel (Composant React).
 * - "import" en haut signifie qu'on utilise des outils d'autres fichiers pour s'aider.
 * ============================================================================
 */

import { CATEGORIES } from '../pages/RecipeForm'; // Importation des catégories de recettes
import { supabase } from '../lib/supabase'; // Importation du client de base de données

const DEFAULT_MODEL = 'gemini-1.5-flash'; // Modèle d'intelligence artificielle utilisé par défaut

// Structure d'une réponse renvoyée par ce service
export interface AIServiceResponse {
    data?: any; // Les données générées (si succès)
    error?: string; // Le message d'erreur (si échec)
}

/**
 * Service central pour toutes les opérations d'Intelligence Artificielle de l'Admin.
 */
class AIService {

    // Récupère la clé secrète (API Key) pour parler à l'IA
    private getApiKey(): string {
        // On regarde d'abord si l'utilisateur a enregistré sa propre clé dans son navigateur
        const userKey = localStorage.getItem('gemini_api_key');
        if (userKey) return userKey;

        // Sinon on utilise la clé par défaut du projet
        return (import.meta as any).env.VITE_GEMINI_API_KEY || '';
    }

    // Fonction pour tester si une clé API est valide
    async testKey(key: string, model: string, baseUrl?: string): Promise<{ success: boolean; message: string }> {
        const isOpenAI = model.startsWith('gpt'); // Vérifie si c'est un modèle de chez OpenAI (ChatGPT)
        try {
            if (isOpenAI) {
                // Test pour OpenAI
                const endpoint = `${baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1'}/chat/completions`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model,
                        messages: [{ role: 'user', content: 'Say hi' }],
                        max_tokens: 5
                    })
                });
                if (!response.ok) {
                    const err = await response.text();
                    return { success: false, message: `Erreur OpenAI: ${response.status} - ${err}` };
                }
                return { success: true, message: 'Connexion OpenAI réussie !' };
            } else {
                // Test pour Google Gemini
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: 'hi' }] }],
                        generationConfig: { maxOutputTokens: 5 }
                    })
                });
                if (!response.ok) {
                    const err = await response.text();
                    return { success: false, message: `Erreur Gemini: ${response.status} - ${err}` };
                }
                return { success: true, message: 'Connexion Gemini réussie !' };
            }
        } catch (err: any) {
            return { success: false, message: `Erreur de connexion: ${err.message}` };
        }
    }

    // Récupère le nom du modèle IA à utiliser
    private getModel(): string {
        let model = localStorage.getItem('gemini_model') || (import.meta as any).env.VITE_AI_MODEL || DEFAULT_MODEL;

        // Vérification si le modèle est supporté (Gemini ou GPT)
        const isSupported = model.startsWith('gemini') || model.startsWith('gpt');
        if (!isSupported) {
            console.warn(`Modèle non supporté (${model}), retour à ${DEFAULT_MODEL}`);
            return DEFAULT_MODEL;
        }
        return model;
    }

    // Enregistre le choix du modèle IA
    setModel(modelId: string) {
        localStorage.setItem('gemini_model', modelId);
    }

    // MÉTHODE INTERNE : Envoie une requête à l'IA et récupère la réponse brute
    private async callModel(prompt: string, systemPrompt: string): Promise<string> {
        const key = this.getApiKey();
        if (!key) throw new Error('Clé API manquante. Configurez-la dans les Réglages.');

        let model = this.getModel();
        const isOpenAI = model.startsWith('gpt');
        const customBaseUrl = localStorage.getItem('ai_base_url');

        if (isOpenAI) {
            // Logique pour les modèles OpenAI
            const endpoint = `${customBaseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1'}/chat/completions`;
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${key}`
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt || "Génère les données demandées." }
                    ],
                    temperature: 0.7,
                    response_format: { type: "json_object" } // Demande à l'IA de répondre en format JSON
                })
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Erreur OpenAI (${response.status}): ${err}`);
            }

            const json = await response.json();
            return json.choices[0].message.content;
        } else {
            // Logique pour les modèles Google Gemini
            const tryFetch = async (version: string, modelName: string) => {
                const endpoint = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${key}`;
                const body = {
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }],
                    generationConfig: {
                        temperature: 0.8,
                        responseMimeType: 'application/json'
                    },
                };
                return fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
            };

            // On essaie différentes versions de l'API (v1beta puis v1)
            let response = await tryFetch('v1beta', model);
            if (response.status === 404) response = await tryFetch('v1', model);
            if (response.status === 404 && model !== DEFAULT_MODEL) {
                response = await tryFetch('v1beta', DEFAULT_MODEL);
            }

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`Erreur API Gemini (${response.status}): ${err}`);
            }

            const json = await response.json();
            try {
                return json.candidates[0].content.parts[0].text;
            } catch (e) {
                throw new Error('Format de réponse Gemini invalide ou contenu bloqué.');
            }
        }
    }

    // Génère les petits détails d'une recette
    async generateRecipeDetails(recipeName: string): Promise<AIServiceResponse> {
        const systemPrompt = `Tu es un chef expert en cuisine africaine.\nGénère les détails complets pour la recette : "${recipeName}".\nRéponds UNIQUEMENT en JSON valide avec ces clés :\n{\n  \"alias\": \"nom local\",\n  \"region\": \"région d'origine\",\n  \"category\": \"une parmi: ${CATEGORIES.map((c: any) => c.value).join(', ')}\",\n  \"difficulty\": \"Facile, Moyen ou Difficile\",\n  \"prep_time\": \"ex: 15 min\",\n  \"cook_time\": \"ex: 45 min\",\n  \"description\": \"2 phrases d'histoire/culture\",\n  \"technique_title\": \"titre technique\",\n  \"technique_description\": \"2 phrases d'explication\",\n  \"benefits\": \"bienfaits en 1 phrase\",\n  \"style\": \"style de cuisson\",\n  \"type\": \"type de plat\"\n}`;
        try {
            const text = await this.callModel('', systemPrompt);
            return { data: JSON.parse(text) };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    // Génère une recette ENTIÈREMENT remplie (ingrédients, étapes...)
    async generateFullRecipe(dishName: string, context?: string): Promise<AIServiceResponse> {
        const systemPrompt = `Tu es un chef cuisinier expert en cuisine africaine...`; // (Prompt tronqué pour la lisibilité)
        // Note : Le prompt contient toutes les instructions pour que l'IA respecte le format JSON désiré.
        try {
            const text = await this.callModel(`Génère la fiche complète pour: ${dishName}`, systemPrompt);
            const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(cleaned);
            return { data: parsed };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    // Suggère des sections de plats pour animer la page d'accueil
    async suggestSections(catalogContext: string, goal: string): Promise<AIServiceResponse> {
        const systemPrompt = `Expert UX Cuisine. Analyse ce catalogue et propose une section thématique...`;
        try {
            const text = await this.callModel('', systemPrompt);
            return { data: JSON.parse(text) };
        } catch (err: any) {
            return { error: err.message };
        }
    }

    // Récupère quelques recettes au hasard pour donner des idées à l'IA
    async getSampleRecipes(count: number): Promise<{ id: string; name: string }[]> {
        const { data, error } = await supabase
            .from('recipes')
            .select('id, name, category')
            .order('name')
            .limit(count);
        if (error) throw new Error(error.message);
        return data.map((r: any) => ({ id: r.id, name: `${r.name} (${r.category})` }));
    }

    // Crée une section entière de l'accueil
    async generateSection(type: string, theme: string, recipes: { id: string; name: string }[]): Promise<AIServiceResponse> {
        const catalogContext = recipes.map(r => `ID: ${r.id} | Nom: ${r.name}`).join('\n');
        const systemPrompt = `You are an expert UX designer for an African cuisine app called "AfroCuisto"...`;
        try {
            const text = await this.callModel('Generate the section JSON now.', systemPrompt);
            const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return { data: JSON.parse(cleanedText) };
        } catch (err: any) {
            console.error('AI Generation error:', err);
            return { error: err.message };
        }
    }
}

// On exporte une instance déjà prête à l'emploi
export const aiService = new AIService();
