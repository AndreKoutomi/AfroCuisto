import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutGrid, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface Recipe {
    id: string;
    name: string;
}

interface HomeSection {
    id: string;
    title: string;
    subtitle: string;
    recipe_ids: string[];
    order_index: number;
}

export function SectionsManager() {
    const [sections, setSections] = useState<HomeSection[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: recipeData, error: recipeError } = await supabase.from('recipes').select('id, name');
            if (recipeError) throw recipeError;
            setRecipes(recipeData || []);

            const { data, error } = await supabase.from('home_sections').select('*').order('order_index');
            if (error) {
                if (error.code === '42P01') {
                    console.warn("Table home_sections might not exist yet.");
                    setSections([]);
                } else {
                    throw error;
                }
            } else {
                setSections(data || []);
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSection = () => {
        const newSection: HomeSection = {
            id: `section-${Date.now()}`,
            title: 'Nouvelle Section',
            subtitle: 'Description de la section',
            recipe_ids: [],
            order_index: sections.length
        };
        setSections([...sections, newSection]);
    };

    const handleUpdate = (id: string, updates: Partial<HomeSection>) => {
        setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const handleToggleRecipe = (sectionId: string, recipeId: string) => {
        setSections(sections.map(s => {
            if (s.id === sectionId) {
                const ids = s.recipe_ids.includes(recipeId)
                    ? s.recipe_ids.filter(id => id !== recipeId)
                    : [...s.recipe_ids, recipeId];
                return { ...s, recipe_ids: ids };
            }
            return s;
        }));
    };

    const handleRemoveSection = (id: string) => {
        if (confirm("Supprimer cette section ?")) {
            setSections(sections.filter(s => s.id !== id));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            // First remove all existing sections to simplify sync?
            // Or just upsert
            const { error: deleteError } = await supabase.from('home_sections').delete().neq('id', 'fake');
            if (deleteError && deleteError.code !== '42P01') throw deleteError;

            if (sections.length > 0) {
                const { error: upsertError } = await supabase.from('home_sections').upsert(
                    sections.map((s, i) => ({ ...s, order_index: i }))
                );
                if (upsertError) throw upsertError;
            }

            setMessage({ text: 'Sections enregistrées avec succès !', type: 'success' });
        } catch (err: any) {
            console.error('Save error:', err);
            setMessage({ text: `Erreur: ${err.message || 'Impossible d\'enregistrer. Assurez-vous que la table "home_sections" existe dans Supabase.'}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Chargement des données...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>Gestion des Sections Accueil</h2>
                    <p className="text-gray-500 text-sm">Organisez les blocs de contenu sur l'application mobile.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleAddSection} className="btn btn-secondary flex items-center gap-2">
                        <Plus size={18} /> Ajouter une section
                    </button>
                    <button onClick={handleSave} disabled={isSaving} className="btn btn-primary flex items-center gap-2">
                        {isSaving ? 'Enregistrement...' : <><Save size={18} /> Enregistrer tout</>}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium text-sm">{message.text}</span>
                </div>
            )}

            {sections.length === 0 && (
                <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-sm">
                    <LayoutGrid size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">Aucune section personnalisée pour le moment.</p>
                    <button onClick={handleAddSection} className="text-indigo-600 font-bold text-sm mt-4 hover:underline">Créer la première section</button>
                </div>
            )}

            <div className="grid gap-6">
                {sections.map((section, idx) => (
                    <div key={section.id} className="admin-card p-6 border border-gray-100 shadow-sm relative overflow-hidden">

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1 space-y-4 max-w-xl">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Titre de la section</label>
                                    <input
                                        className="w-full text-xl font-bold bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none pb-1"
                                        value={section.title}
                                        onChange={(e) => handleUpdate(section.id, { title: e.target.value })}
                                        placeholder="Nom de la section..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Sous-titre (Description)</label>
                                    <input
                                        className="w-full text-sm text-gray-600 bg-transparent border-b border-gray-100 focus:border-indigo-500 outline-none pb-1"
                                        value={section.subtitle}
                                        onChange={(e) => handleUpdate(section.id, { subtitle: e.target.value })}
                                        placeholder="Petit texte d'accompagnement..."
                                    />
                                </div>
                            </div>
                            <button onClick={() => handleRemoveSection(section.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-bold uppercase text-gray-400 tracking-wider">Sélectionnez les recettes à afficher ({section.recipe_ids.length})</label>
                            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-2xl border border-gray-100">
                                {recipes.map(recipe => (
                                    <button
                                        key={recipe.id}
                                        onClick={() => handleToggleRecipe(section.id, recipe.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${section.recipe_ids.includes(recipe.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'}`}
                                    >
                                        {recipe.name}
                                    </button>
                                ))}
                                {recipes.length === 0 && <p className="text-xs text-gray-400">Aucune recette disponible.</p>}
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 flex items-center justify-center font-bold text-gray-300 pointer-events-none">
                            #{idx + 1}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mt-10">
                <h3 className="text-amber-800 font-bold mb-2 flex items-center gap-2">
                    <AlertCircle size={18} /> Rappel Technique
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                    Pour que ces sections s'affichent sur l'application mobile, vous devez créer la table <code>home_sections</code> dans votre SQL Editor Supabase avec ces colonnes : <code>id (text)</code>, <code>title (text)</code>, <code>subtitle (text)</code>, <code>recipe_ids (text[])</code>, <code>order_index (int)</code>.
                </p>
            </div>
        </div>
    );
}
