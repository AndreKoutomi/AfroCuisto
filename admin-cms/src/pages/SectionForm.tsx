import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Search, Utensils, Info, Settings2, Sparkles } from 'lucide-react';

interface Recipe {
    id: string;
    name: string;
    category: string;
    image: string;
    region: string;
    prep_time: string;
}

const INITIAL_STATE = {
    title: '',
    subtitle: '',
    recipe_ids: [] as string[],
    order_index: 0,
    type: 'manual' as 'manual' | 'query',
    config: {
        category: '',
        region: '',
        max_prep_time: '',
        limit: 10
    }
};

export function SectionForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: recipeData } = await supabase
                    .from('recipes')
                    .select('id, name, category, image, region, prep_time')
                    .order('name');

                if (recipeData) setRecipes(recipeData);

                if (id) {
                    const { data: sectionData, error } = await supabase
                        .from('home_sections')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (sectionData && !error) {
                        setFormData({
                            ...INITIAL_STATE,
                            ...sectionData,
                            config: { ...INITIAL_STATE.config, ...sectionData.config }
                        });
                    }
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('config.')) {
            const configKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                config: { ...prev.config, [configKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleToggleRecipe = (recipeId: string) => {
        setFormData(prev => {
            const ids = prev.recipe_ids.includes(recipeId)
                ? prev.recipe_ids.filter(rid => rid !== recipeId)
                : [...prev.recipe_ids, recipeId];
            return { ...prev, recipe_ids: ids };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title: formData.title,
                subtitle: formData.subtitle,
                type: formData.type,
                config: formData.config,
                recipe_ids: formData.type === 'manual' ? formData.recipe_ids : [],
                order_index: formData.order_index
            };

            if (id) {
                const { error } = await supabase
                    .from('home_sections')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const newId = `${Date.now()}`;
                const { error } = await supabase
                    .from('home_sections')
                    .insert([{ ...payload, id: newId }]);
                if (error) throw error;
            }
            navigate('/sections');
        } catch (err) {
            console.error('Save error:', err);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    };

    const filteredRecipes = recipes.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Preview for Smart Sections
    const smartPreview = recipes.filter(r => {
        if (formData.type !== 'query') return false;
        const { category, region } = formData.config;
        let match = true;
        if (category && r.category !== category) match = false;
        if (region && !r.region.toLowerCase().includes(region.toLowerCase())) match = false;
        return match;
    }).slice(0, 6);

    if (initialLoading) {
        return <div className="center-content"><div className="loader"></div></div>;
    }

    return (
        <div>
            <div className="flex items-center gap-4 mb-6">
                <Link to="/sections" className="btn btn-secondary">
                    <ArrowLeft size={18} /> Retour
                </Link>
                <h2 className="font-bold text-2xl">
                    {id ? 'Modifier la Section' : 'Ajouter une Section'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-3 grid-gap-4 items-start">
                {/* Left: Section Details */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header border-b flex justify-between items-center">
                        <h3 className="card-title">Configuration de la Section</h3>
                        <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'manual' }))}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${formData.type === 'manual' ? 'bg-white shadow-sm text-primary' : 'text-stone-500 hover:bg-stone-200'}`}
                            >
                                <Settings2 size={14} /> Manuel
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, type: 'query' }))}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${formData.type === 'query' ? 'bg-white shadow-sm text-primary' : 'text-stone-500 hover:bg-stone-200'}`}
                            >
                                <Sparkles size={14} /> Automatique
                            </button>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="form-group">
                            <label className="form-label">Titre de la Section</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Ex: Spécialités du Sud"
                                style={{ fontSize: '1.25rem', fontWeight: 800 }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Sous-titre / Description</label>
                            <textarea
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="form-control"
                                rows={2}
                                placeholder="Décrivez l'univers de cette section..."
                            />
                        </div>

                        {formData.type === 'query' ? (
                            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={18} className="text-primary" />
                                    <h4 className="font-bold text-stone-800">Paramètres de filtrage IA</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group mb-0">
                                        <label className="form-label text-xs">Catégorie</label>
                                        <select
                                            name="config.category"
                                            value={formData.config.category}
                                            onChange={handleChange}
                                            className="form-control bg-white"
                                        >
                                            <option value="">Toutes les catégories</option>
                                            <option value="Pâtes et Céréales (Wɔ̌)">Pâtes et Céréales</option>
                                            <option value="Sauces (Nùsúnnú)">Sauces</option>
                                            <option value="Plats de Résistance & Ragoûts">Plats de Résistance</option>
                                            <option value="Protéines & Grillades">Protéines & Grillades</option>
                                            <option value="Street Food & Snacks (Amuse-bouche)">Street Food</option>
                                            <option value="Boissons & Douceurs">Boissons</option>
                                            <option value="Condiments & Accompagnements">Condiments</option>
                                        </select>
                                    </div>
                                    <div className="form-group mb-0">
                                        <label className="form-label text-xs">Région</label>
                                        <select
                                            name="config.region"
                                            value={formData.config.region}
                                            onChange={handleChange}
                                            className="form-control bg-white"
                                        >
                                            <option value="">Toutes les régions</option>
                                            <option value="Sud">Sud Bénin</option>
                                            <option value="Nord">Nord Bénin</option>
                                            <option value="Centre">Centre Bénin</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="bg-white/60 p-4 rounded-2xl border border-white">
                                    <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3">Aperçu du contenu filtré</p>
                                    <div className="flex flex-wrap gap-2">
                                        {smartPreview.map(r => (
                                            <div key={r.id} className="badge badge-secondary flex items-center gap-2 py-1.5 px-3">
                                                <img src={r.image} className="w-5 h-5 rounded-full object-cover" />
                                                <span className="text-[11px] font-bold">{r.name}</span>
                                            </div>
                                        ))}
                                        {smartPreview.length === 0 && <p className="text-xs italic text-stone-400">Aucun plat ne correspond à vos filtres.</p>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Recettes sélectionnées manuellement ({formData.recipe_ids.length})
                                    </h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.recipe_ids.map(rid => {
                                        const r = recipes.find(rec => rec.id === rid);
                                        return r ? (
                                            <div key={rid} className="badge badge-primary flex items-center gap-2" style={{ padding: '8px 12px' }}>
                                                <img src={r.image} className="dish-thumbnail" style={{ width: '20px', height: '20px' }} />
                                                <span style={{ fontSize: '12px' }}>{r.name}</span>
                                                <button type="button" onClick={() => handleToggleRecipe(rid)} className="text-danger ml-1 hover:scale-110 transition-transform">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ) : null;
                                    })}
                                    {formData.recipe_ids.length === 0 && (
                                        <p className="text-muted text-sm font-medium italic">Aucun plat sélectionné. Utilisez la liste à droite pour en ajouter.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Recipe Selector (Visible only for manual) */}
                <div className="flex flex-col gap-4">
                    <div className={`card transition-opacity duration-300 ${formData.type === 'query' ? 'opacity-30 pointer-events-none' : ''}`}>
                        <div className="card-header border-b">
                            <h3 className="card-title">Catalogue des Plats</h3>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ paddingRight: '40px' }}
                                />
                                <Search size={16} className="absolute text-muted" style={{ right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>

                            <div className="overflow-y-auto" style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {filteredRecipes.map(recipe => (
                                    <button
                                        key={recipe.id}
                                        type="button"
                                        onClick={() => handleToggleRecipe(recipe.id)}
                                        className="flex items-center justify-between w-full p-2 rounded-xl transition-all hover:bg-gray-100"
                                        style={{
                                            border: '1px solid',
                                            borderColor: formData.recipe_ids.includes(recipe.id) ? 'var(--primary)' : 'transparent',
                                            backgroundColor: formData.recipe_ids.includes(recipe.id) ? 'rgba(67, 24, 255, 0.05)' : 'transparent'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={recipe.image} className="dish-thumbnail" style={{ width: '30px', height: '30px' }} />
                                            <div className="text-left">
                                                <p style={{ fontSize: '11px', fontWeight: 700 }}>{recipe.name}</p>
                                                <p style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{recipe.category}</p>
                                            </div>
                                        </div>
                                        <div style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: formData.recipe_ids.includes(recipe.id) ? 'var(--primary)' : 'var(--bg-color)',
                                            color: formData.recipe_ids.includes(recipe.id) ? '#fff' : 'var(--text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <Plus size={14} style={{ transform: formData.recipe_ids.includes(recipe.id) ? 'rotate(45deg)' : 'none' }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card p-6">
                        <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ padding: '0.875rem' }}>
                            {loading ? <div className="loader" style={{ width: 16, height: 16, borderLeftColor: '#fff' }}></div> : <><Save size={18} /> Enregistrer la Section</>}
                        </button>
                        <p className="text-muted mt-3 text-center" style={{ fontSize: '11px', fontWeight: 500 }}>
                            <Info size={12} className="inline mr-1" />
                            Les sections automatiques se mettent à jour seules quand vous ajoutez des plats.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
