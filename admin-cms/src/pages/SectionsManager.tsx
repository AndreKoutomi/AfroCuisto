import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    LayoutGrid,
    Save,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    Search,
    ChevronUp,
    ChevronDown,
    Info,
    ExternalLink,
    Utensils
} from 'lucide-react';

interface Recipe {
    id: string;
    name: string;
    category: string;
    image: string;
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
    const [recipeSearch, setRecipeSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: recipeData, error: recipeError } = await supabase
                .from('recipes')
                .select('id, name, category, image')
                .order('name');

            if (recipeError) throw recipeError;
            setRecipes(recipeData || []);

            const { data, error } = await supabase
                .from('home_sections')
                .select('*')
                .order('order_index');

            if (error && error.code !== '42P01') throw error;
            setSections(data || []);
        } catch (err: any) {
            console.error('Fetch error:', err);
            setMessage({ text: 'Erreur lors du chargement des données.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSection = () => {
        const newSection: HomeSection = {
            id: `${Date.now()}`,
            title: 'Nouvelle thématique',
            subtitle: 'Partagez une description inspirante...',
            recipe_ids: [],
            order_index: sections.length
        };
        setSections([...sections, newSection]);
        // Scroll to bottom after state update
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
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
        if (confirm("Voulez-vous vraiment supprimer cette section ? Cette action sera appliquée dès que vous cliquerez sur Enregistrer.")) {
            setSections(sections.filter(s => s.id !== id));
        }
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections.map((s, i) => ({ ...s, order_index: i })));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            // 1. Delete all existing sections first to ensure a clean sync of the new order/set
            // (This is standard for small config tables to avoid complex diffing)
            const { error: deleteError } = await supabase
                .from('home_sections')
                .delete()
                .neq('id', '__placeholder__'); // Safety delete

            if (deleteError) throw deleteError;

            // 2. Re-insert current set
            if (sections.length > 0) {
                const { error: upsertError } = await supabase
                    .from('home_sections')
                    .insert(
                        sections.map((s, i) => ({
                            id: s.id,
                            title: s.title,
                            subtitle: s.subtitle,
                            recipe_ids: s.recipe_ids,
                            order_index: i
                        }))
                    );
                if (upsertError) throw upsertError;
            }

            setMessage({ text: 'Toutes les sections ont été mises à jour !', type: 'success' });
        } catch (err: any) {
            console.error('Save error:', err);
            setMessage({ text: `Erreur: ${err.message}`, type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(recipeSearch.toLowerCase())
    );

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <LayoutGrid size={48} className="text-indigo-100 mb-4" />
            <p className="text-gray-400 font-medium">Chargement de votre univers...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                            <LayoutGrid size={24} />
                        </div>
                        <h2 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-main)' }}>Sections d'accueil</h2>
                    </div>
                    <p className="text-gray-500 font-medium ml-13">Pilotez le contenu dynamique de l'application mobile en temps réel.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddSection}
                        className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all active:scale-95"
                    >
                        <Plus size={20} /> Nouvelle section
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
                    >
                        {isSaving ? 'Enregistrement...' : <><Save size={20} /> Publier les changements</>}
                    </button>
                </div>
            </div>

            {/* Floating Alert Message */}
            {message && (
                <div className={`fixed bottom-8 right-8 z-50 p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 ${message.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="font-black text-sm uppercase tracking-wider">{message.text}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Side: Sections List */}
                <div className="lg:col-span-8 space-y-6">
                    {sections.length === 0 ? (
                        <div className="bg-white/50 border-2 border-dashed border-gray-200 p-20 rounded-[40px] text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Utensils size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-400 mb-2">Aucune section active</h3>
                            <p className="text-gray-400 text-sm max-w-sm mx-auto mb-8">Créez des thématiques pour organiser vos meilleures recettes et guider vos utilisateurs.</p>
                            <button onClick={handleAddSection} className="btn btn-primary px-8">Commencer maintenant</button>
                        </div>
                    ) : (
                        sections.map((section, index) => (
                            <div
                                key={section.id}
                                className="group bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 relative overflow-hidden"
                            >
                                {/* Section Context Controls */}
                                <div className="absolute top-6 right-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => moveSection(index, 'up')}
                                        disabled={index === 0}
                                        className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronUp size={18} />
                                    </button>
                                    <button
                                        onClick={() => moveSection(index, 'down')}
                                        disabled={index === sections.length - 1}
                                        className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronDown size={18} />
                                    </button>
                                    <div className="w-px h-6 bg-gray-100 mx-2" />
                                    <button
                                        onClick={() => handleRemoveSection(section.id)}
                                        className="p-2 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="max-w-2xl space-y-4">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em] mb-2 block">Configuration thématique</span>
                                            <input
                                                className="w-full text-2xl font-black bg-transparent border-none focus:ring-0 placeholder:text-gray-200 p-0 text-stone-800"
                                                value={section.title}
                                                onChange={(e) => handleUpdate(section.id, { title: e.target.value })}
                                                placeholder="Ex: Spécialités du Sud..."
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <textarea
                                                className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder:text-gray-300 p-0 resize-none min-h-[40px] font-medium leading-relaxed"
                                                value={section.subtitle}
                                                onChange={(e) => handleUpdate(section.id, { subtitle: e.target.value })}
                                                placeholder="Décrivez l'univers de cette section en quelques mots..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-50">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Utensils size={16} className="text-indigo-600" />
                                                <span className="text-xs font-black uppercase text-stone-800 tracking-widest">Recettes sélectionnées</span>
                                            </div>
                                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                                {section.recipe_ids.length} Plats
                                            </span>
                                        </div>

                                        {section.recipe_ids.length === 0 ? (
                                            <div className="p-8 bg-gray-50/50 rounded-2xl text-center border-2 border-dashed border-gray-100">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cliquez sur les recettes à droite pour les ajouter</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-2">
                                                {section.recipe_ids.map(rid => {
                                                    const r = recipes.find(rec => rec.id === rid);
                                                    return r ? (
                                                        <div
                                                            key={rid}
                                                            className="group/tag flex items-center gap-2 bg-indigo-600 text-white pl-1.5 pr-2 py-1.5 rounded-xl text-xs font-bold animate-in fade-in zoom-in-95"
                                                        >
                                                            <img src={r.image} className="w-5 h-5 rounded-md object-cover border border-white/20" />
                                                            <span>{r.name}</span>
                                                            <button
                                                                onClick={() => handleToggleRecipe(section.id, rid)}
                                                                className="hover:text-red-300 transition-colors ml-1"
                                                            >
                                                                <Plus size={14} className="rotate-45" />
                                                            </button>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right Side: Recipe Tool (Sticky) */}
                <div className="lg:col-span-4 h-fit sticky top-8">
                    <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl shadow-stone-200/50 overflow-hidden flex flex-col max-h-[calc(100vh-100px)]">
                        <div className="p-6 pb-4 border-b border-gray-50 space-y-4">
                            <div className="flex items-center gap-2">
                                <Search size={18} className="text-indigo-600" />
                                <h4 className="font-bold text-stone-800">Catalogue Recettes</h4>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Rechercher un plat..."
                                    className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-4 pr-10 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300"
                                    value={recipeSearch}
                                    onChange={(e) => setRecipeSearch(e.target.value)}
                                />
                                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                            {filteredRecipes.map(recipe => (
                                <div key={recipe.id} className="p-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-2">{recipe.category}</p>
                                    {sections.map(section => (
                                        <button
                                            key={`${section.id}-${recipe.id}`}
                                            onClick={() => handleToggleRecipe(section.id, recipe.id)}
                                            className={`w-full group/item flex items-center justify-between p-3 rounded-2xl transition-all mb-1 ${section.recipe_ids.includes(recipe.id) ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-gray-50 border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                    <img src={recipe.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="text-left">
                                                    <p className={`text-xs font-bold leading-tight ${section.recipe_ids.includes(recipe.id) ? 'text-indigo-700' : 'text-stone-800'}`}>{recipe.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Vers: {section.title.substring(0, 15)}...</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${section.recipe_ids.includes(recipe.id) ? 'bg-indigo-600 text-white rotate-0' : 'bg-gray-100 text-gray-400 rotate-0 hover:bg-indigo-100 hover:text-indigo-600'}`}>
                                                <Plus size={14} className={section.recipe_ids.includes(recipe.id) ? 'rotate-45' : ''} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-gray-50/50 border-t border-gray-50">
                            <div className="flex gap-2 p-3 bg-white rounded-2xl border border-indigo-100/50 italic text-[11px] text-indigo-400 leading-relaxed font-medium">
                                <Info size={28} className="flex-shrink-0 opacity-50" />
                                <span>Cliquez sur l'icône + d'un plat pour l'ajouter à la section correspondante.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
