import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Settings, Sparkles, CheckCircle2 } from 'lucide-react';

export function AIGenerator() {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const storedKey = localStorage.getItem('gemini_api_key');
        if (storedKey) setApiKey(storedKey);
        else setShowSettings(true);
    }, []);

    const saveApiKey = (key: string) => {
        localStorage.setItem('gemini_api_key', key);
        setApiKey(key);
        setShowSettings(false);
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            alert('Veuillez configurer votre clé API Google Gemini d\'abord.');
            setShowSettings(true);
            return;
        }
        if (!prompt) return;

        setLoading(true);
        setResult(null);

        try {
            const systemPrompt = `Tu es un chef cuisinier expert en gastronomie africaine.
On te donne un prompt pour créer une recette.
Renvoie la recette SOUS FORME D'OBJET JSON STRICTEMENT VALIDE. NE RENVOIE QUE LE JSON, SANS MARKDOWN NI TEXTE AUTOUR. 
Assure-toi de respecter le format de clés suivant :
{
  "name": "Nom du plat",
  "alias": "Autre nom usuel",
  "region": "Ex: Sud-Bénin, Sénégal, National",
  "category": "Choisis strictement parmi: Pâtes et Céréales (Wɔ̌), Sauces (Nùsúnnú), Plats de Résistance & Ragoûts, Protéines & Grillades, Street Food & Snacks (Amuse-bouche), Boissons & Douceurs, Condiments & Accompagnements",
  "difficulty": "Choisis parmi: Très Facile, Facile, Intermédiaire, Moyen, Difficile, Très Difficile",
  "prep_time": "ex: 15 min",
  "cook_time": "ex: 45 min",
  "description": "Une belle description commerciale et culturelle du plat",
  "technique_title": "Nom d'une technique de préparation clé de ce plat",
  "technique_description": "Comment l'exécuter",
  "benefits": "Bienfaits santé",
  "style": "ex: Braisé, Vapeur, Ragoût",
  "type": "ex: Plat Principal, Dessert",
  "base": "Ingrédient principal, ex: Manioc, Poulet"
}`;

            const payload = {
                contents: [
                    {
                        parts: [
                            { text: systemPrompt },
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                }
            };

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errJson = await response.json();
                throw new Error(errJson.error?.message || 'Erreur API Google Gemini');
            }

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;

            // Extract JSON if wrapped in markdown
            let jsonString = textResponse;
            if (jsonString.includes('```json')) {
                jsonString = jsonString.split('```json')[1].split('```')[0].trim();
            } else if (jsonString.includes('```')) {
                jsonString = jsonString.split('```')[1].split('```')[0].trim();
            }

            const parsedResult = JSON.parse(jsonString);
            setResult(parsedResult);

        } catch (error: any) {
            console.error(error);
            alert(`Erreur de l'intelligence artificielle : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveToDb = async () => {
        if (!result) return;
        setSaving(true);
        try {
            // Exclure les champs virtuels que l'IA pourrait avoir inventé
            const cleanData = { ...result, id: `ai_${Date.now()}` };
            delete cleanData.origine_humaine;

            const { data, error } = await supabase.from('recipes').insert([cleanData]).select();
            if (error) throw error;

            if (data && data[0]) {
                navigate(`/recipes/edit/${data[0].id}`);
            } else {
                navigate('/recipes');
            }
        } catch (err: any) {
            console.error('Erreur sauvegarde:', err);
            alert(`Impossible de sauvegarder la recette dans la base. ${err.message || ''}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-bold text-2xl" style={{ background: '-webkit-linear-gradient(45deg, #4318FF, #868CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Assistant IA de Création
                    </h2>
                    <p className="text-muted mt-2 text-sm">Générez des fiches recettes complètes et culturelles en un clin d'œil avec Google Gemini AI.</p>
                </div>
                <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary">
                    <Settings size={18} /> Configuration Clé API
                </button>
            </div>

            {showSettings && (
                <div className="card p-6 mb-8" style={{ borderLeft: '4px solid #4318FF', backgroundColor: '#F4F7FE' }}>
                    <h3 className="card-title mb-4">Configuration Google Gemini AI</h3>
                    <p className="text-sm text-muted mb-4">
                        Pour utiliser le générateur, vous devez fournir une clé API Gemini gratuite (obtenable sur Google AI Studio). La clé est conservée en toute sécurité dans votre navigateur local.
                    </p>
                    <div className="flex gap-4">
                        <div className="form-group mb-0" style={{ flex: 1 }}>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Collez votre clé secrète AIzaSy..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>
                        <button onClick={() => saveApiKey(apiKey)} className="btn btn-primary">
                            Enregistrer la clé
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 grid-gap-6">
                <div className="card flex-col">
                    <div className="card-header border-b">
                        <h3 className="card-title flex items-center gap-2"><Sparkles size={20} color="#4318FF" /> Formuler une demande</h3>
                    </div>
                    <div className="p-6 flex-col flex-grow">
                        <div className="form-group flex-grow flex-col flex">
                            <label className="form-label">Description du plat à générer</label>
                            <textarea
                                className="form-control flex-grow"
                                style={{ minHeight: '200px' }}
                                placeholder="Ex: Rédige une recette détaillée sur le Garba ivoirien avec une note d'humour, précise que c'est du poisson thon frit et de la semoule de manioc."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn btn-primary mt-4"
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? <div className="loader" style={{ borderColor: 'rgba(255,255,255,0.2)', borderLeftColor: '#fff', width: 20, height: 20 }}></div> : <><Sparkles size={20} /> Générer le profil culinaire</>}
                        </button>
                    </div>
                </div>

                <div className="card flex-col">
                    <div className="card-header border-b">
                        <h3 className="card-title">Résultat de l'Intelligence Artificielle</h3>
                    </div>
                    <div className="p-6 flex-grow flex-col bg-gray-50" style={{ backgroundColor: '#fafafa', overflowY: 'auto', maxHeight: '500px' }}>
                        {loading && (
                            <div className="center-content">
                                <div className="loader" style={{ width: 32, height: 32 }}></div>
                                <p className="mt-4 text-muted font-medium">Rédaction culturelle en cours...</p>
                            </div>
                        )}
                        {!loading && !result && (
                            <div className="center-content text-muted text-center flex-col gap-4">
                                <Sparkles size={48} style={{ opacity: 0.2 }} />
                                <p>L'aperçu de la recette apparaîtra ici.</p>
                            </div>
                        )}
                        {!loading && result && (
                            <div>
                                <h2 className="text-2xl font-bold text-primary mb-2">{result.name}</h2>
                                <div className="flex gap-2 mb-6 flex-wrap">
                                    <span className="badge badge-success">{result.category}</span>
                                    <span className="badge badge-primary">{result.region}</span>
                                    <span className="badge">{result.difficulty}</span>
                                </div>

                                <p className="text-muted mb-6 bg-white p-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>{result.description}</p>

                                <div className="grid grid-cols-2 grid-gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                                        <p className="text-xs text-muted mb-1 text-uppercase">Temps Prépa</p>
                                        <p className="font-bold">{result.prep_time}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                                        <p className="text-xs text-muted mb-1 text-uppercase">Temps Cuisson</p>
                                        <p className="font-bold">{result.cook_time}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl mb-6" style={{ border: '1px solid var(--border)' }}>
                                    <h4 className="font-bold mb-2">Technique : {result.technique_title}</h4>
                                    <p className="text-sm text-muted">{result.technique_description}</p>
                                </div>

                                <button
                                    className="btn btn-success mt-4"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1rem', backgroundColor: '#05CD99', color: '#fff', boxShadow: '0 4px 12px rgba(5,205,153,0.3)' }}
                                    onClick={handleSaveToDb}
                                    disabled={saving}
                                >
                                    {saving ? <div className="loader" style={{ borderColor: 'rgba(255,255,255,0.2)', borderLeftColor: '#fff', width: 20, height: 20 }}></div> : <><CheckCircle2 size={20} /> Valider & Importer dans la base</>}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
