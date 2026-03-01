import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Search, Utensils, Info } from 'lucide-react';

interface Recipe {
    id: string;
    name: string;
    category: string;
    image: string;
}

const INITIAL_STATE = {
    title: '',
    subtitle: '',
    recipe_ids: [] as string[],
    order_index: 0
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
                    .select('id, name, category, image')
                    .order('name');

                if (recipeData) setRecipes(recipeData);

                if (id) {
                    const { data: sectionData, error } = await supabase
                        .from('home_sections')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (sectionData && !error) {
                        setFormData(sectionData);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            if (id) {
                const { error } = await supabase
                    .from('home_sections')
                    .update(formData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const newId = `${Date.now()}`;
                const { error } = await supabase
                    .from('home_sections')
                    .insert([{ ...formData, id: newId }]);
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
                    <div className="card-header border-b">
                        <h3 className="card-title">Configuration de la Section</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="form-group">
                            <label className="form-label">Titre de la Section (Thématique)</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="form-control"
                                placeholder="Ex: Spécialités du Sud"
                                style={{ fontSize: '1.25rem', fontWeight: 700 }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Sous-titre / Description</label>
                            <textarea
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                className="form-control"
                                rows={3}
                                placeholder="Décrivez l'univers de cette section..."
                            />
                        </div>

                        <div className="pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex items-center justify-between mb-4">
                                <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Recettes sélectionnées pour cette section ({formData.recipe_ids.length})
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
                    </div>
                </div>

                {/* Right: Recipe Selector & Save */}
                <div className="flex flex-col gap-4">
                    <div className="card">
                        <div className="card-header border-b">
                            <h3 className="card-title">Plats Disponibles</h3>
                        </div>
                        <div className="p-4 flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Rechercher un plat..."
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
                                        className="flex items-center justify-between w-full p-2 rounded-xl transition-all hover:bg-gray-50 mb-1"
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
                            {loading ? <div className="loader" style={{ width: 16, height: 16, borderLeftColor: '#fff' }}></div> : <><Save size={18} /> Publier la Section</>}
                        </button>
                        <p className="text-muted mt-3 text-center" style={{ fontSize: '11px', fontWeight: 500 }}>
                            <Info size={12} className="inline mr-1" />
                            Modification visible instantanément sur l'app mobile.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
