import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Search, Utensils, Info, Sparkles, Star, LayoutGrid, List, AlignJustify, GalleryHorizontal, CheckCircle2 } from 'lucide-react';

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
    type: 'dynamic_carousel',
    config: {
        page: 'home',
        icon: '',
        design_style: 'design_1'
    } as Record<string, any>
};

const SECTION_TYPES = [
    { value: 'hero_carousel', label: 'Hero Carrousel', sublabel: 'Bannière principale · Accueil', icon: Sparkles },
    { value: 'dynamic_carousel', label: 'Carrousel', sublabel: 'Défilement dynamique', icon: GalleryHorizontal },
    { value: 'horizontal_list', label: 'Horizontal', sublabel: 'Liste défilante', icon: AlignJustify },
    { value: 'vertical_list_1', label: 'Liste simple', sublabel: '1 colonne', icon: List },
    { value: 'vertical_list_2', label: 'Grille', sublabel: '2 colonnes', icon: LayoutGrid },
];

const PAGES = [
    { value: 'home', label: 'Page d\'accueil' },
    { value: 'explorer', label: 'Page Explorer' },
];

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

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    config: { ...prev.config, icon: reader.result as string }
                }));
            };
            reader.readAsDataURL(file);
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
                recipe_ids: formData.recipe_ids,
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

    if (initialLoading) {
        return <div className="center-content"><div className="loader"></div></div>;
    }

    const inputStyle: React.CSSProperties = {
        height: '48px',
        borderRadius: '12px',
        border: '1.5px solid #e5e7eb',
        fontSize: '14px',
        fontWeight: 600,
        color: '#111827',
        backgroundColor: '#ffffff',
        padding: '0 16px',
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '11px',
        fontWeight: 800,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: '8px',
        display: 'block',
    };

    const cardStyle: React.CSSProperties = {
        background: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #f0f0f0',
        boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        overflow: 'hidden',
    };

    return (
        <div style={{ maxWidth: '1400px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Link to="/sections" style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: '#f3f4f6', border: 'none', cursor: 'pointer',
                        color: '#374151', transition: 'background 0.15s',
                        textDecoration: 'none',
                    }}>
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                            Sections
                        </p>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>
                            {id ? 'Modifier la Section' : 'Nouvelle Section'}
                        </h1>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleSubmit as any}
                    disabled={loading}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: '#4318ff', color: '#fff',
                        border: 'none', borderRadius: '14px',
                        padding: '12px 24px', fontSize: '14px', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        boxShadow: '0 4px 16px rgba(67,24,255,0.25)',
                        transition: 'all 0.2s',
                    }}
                >
                    {loading
                        ? <div className="loader" style={{ width: 18, height: 18, borderLeftColor: '#fff' }}></div>
                        : <><Save size={17} /> Enregistrer</>
                    }
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* Panel 1: Identité de la section */}
                    <div style={cardStyle}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sparkles size={16} color="#7c3aed" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Identité</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Titre, description et page cible</p>
                            </div>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>Titre de la section</label>
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Ex: Spécialités du Sud"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Page de destination</label>
                                    <select
                                        name="config.page"
                                        value={formData.config?.page || 'home'}
                                        onChange={(e) => setFormData(prev => ({ ...prev, config: { ...prev.config, page: e.target.value } }))}
                                        style={{ ...inputStyle, cursor: 'pointer' }}
                                    >
                                        {PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Description / Sous-titre</label>
                                <input
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    placeholder="Une courte description de la section..."
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>Icône de la section</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <label style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        background: '#f9fafb', border: '1.5px dashed #d1d5db',
                                        borderRadius: '12px', padding: '10px 18px',
                                        fontSize: '13px', fontWeight: 600, color: '#6b7280',
                                        cursor: 'pointer',
                                    }}>
                                        📎 Choisir un fichier
                                        <input type="file" accept="image/*" onChange={handleIconChange} style={{ display: 'none' }} />
                                    </label>
                                    {formData.config?.icon && (
                                        <img src={formData.config.icon} alt="icon" style={{ height: '44px', width: '44px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e5e7eb' }} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Type de la section */}
                    <div style={cardStyle}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LayoutGrid size={16} color="#d97706" />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Type d'affichage</h3>
                                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Choisissez le format de rendu</p>
                            </div>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                {SECTION_TYPES.map(({ value, label, sublabel, icon: Icon }) => {
                                    const isActive = formData.type === value;
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                                            style={{
                                                border: isActive ? '2px solid #4318ff' : '2px solid #f0f0f0',
                                                background: isActive ? 'linear-gradient(135deg, #eef2ff, #ede9fe)' : '#fafafa',
                                                borderRadius: '16px',
                                                padding: '16px 12px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s',
                                                position: 'relative',
                                            }}
                                        >
                                            {isActive && (
                                                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#4318ff' }}>
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            )}
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '12px',
                                                background: isActive ? '#4318ff' : '#e5e7eb',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s',
                                            }}>
                                                <Icon size={20} color={isActive ? '#fff' : '#6b7280'} />
                                            </div>
                                            <div style={{ textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: isActive ? '#4318ff' : '#374151' }}>{label}</p>
                                                <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{sublabel}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Options conditionnelles */}
                            {formData.type === 'dynamic_carousel' && (
                                <div style={{ marginTop: '20px', background: '#fafafa', borderRadius: '14px', padding: '16px', border: '1px solid #f0f0f0' }}>
                                    <p style={{ ...labelStyle, marginBottom: '12px' }}>Options du carrousel</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {[
                                            { id: 'autoplay', key: 'autoplay', label: 'Défilement automatique' },
                                            { id: 'show_dots', key: 'show_dots', label: 'Points de pagination' },
                                        ].map(opt => (
                                            <label key={opt.id} htmlFor={opt.id} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                background: '#fff', borderRadius: '12px', padding: '12px 14px',
                                                border: '1px solid #e5e7eb', cursor: 'pointer',
                                            }}>
                                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#374151' }}>{opt.label}</span>
                                                <input
                                                    type="checkbox"
                                                    id={opt.id}
                                                    checked={formData.config?.[opt.key] === 'true' || formData.config?.[opt.key] === true}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, config: { ...prev.config, [opt.key]: e.target.checked } }))}
                                                    style={{ width: '18px', height: '18px', accentColor: '#4318ff', cursor: 'pointer' }}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Panel 3: Plats sélectionnés */}
                    <div style={cardStyle}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #fef2f2, #fecaca)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Utensils size={16} color="#ef4444" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Plats sélectionnés</h3>
                                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                                        {formData.recipe_ids.length === 0 ? 'Aucun plat — sélectionnez dans le catalogue' : `${formData.recipe_ids.length} plat${formData.recipe_ids.length > 1 ? 's' : ''} épinglé${formData.recipe_ids.length > 1 ? 's' : ''}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: '24px' }}>
                            {formData.recipe_ids.length === 0 ? (
                                <div style={{
                                    background: '#fafafa', border: '2px dashed #e5e7eb',
                                    borderRadius: '16px', padding: '40px 24px', textAlign: 'center',
                                }}>
                                    <div style={{ width: '52px', height: '52px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                        <Utensils size={24} color="#9ca3af" />
                                    </div>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#374151' }}>Aucun plat sélectionné</p>
                                    <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#9ca3af' }}>Cliquez sur les plats dans le catalogue →</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                                    {formData.recipe_ids.map(rid => {
                                        const r = recipes.find(rec => rec.id === rid);
                                        return r ? (
                                            <div key={rid} className="group" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleRecipe(rid)}
                                                    style={{
                                                        position: 'absolute', top: '8px', right: '8px',
                                                        width: '26px', height: '26px', borderRadius: '50%',
                                                        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
                                                        border: 'none', cursor: 'pointer', color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        opacity: 0, transition: 'opacity 0.15s',
                                                        zIndex: 2,
                                                    }}
                                                    className="group-hover:opacity-100"
                                                    onMouseEnter={e => (e.currentTarget.style.background = '#ef4444')}
                                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
                                                >
                                                    <Trash2 size={12} strokeWidth={2.5} />
                                                </button>
                                                <div style={{ height: '100px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                                    <img src={r.image} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#111827', lineHeight: 1.3 }} className="line-clamp-1">{r.name}</p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '4px' }}>
                                                        {[1, 2, 3, 4].map(s => <Star key={s} size={10} color="#f59e0b" fill="#f59e0b" />)}
                                                        <span style={{ fontSize: '9px', color: '#9ca3af', fontWeight: 700, marginLeft: '3px' }}>4.5</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN — Catalogue */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
                    <div style={cardStyle}>
                        <div style={{ padding: '20px 20px 0' }}>
                            <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Catalogue des Plats</h3>
                            <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>
                                {filteredRecipes.length} plat{filteredRecipes.length !== 1 ? 's' : ''} disponible{filteredRecipes.length !== 1 ? 's' : ''}
                            </p>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px' }} />
                                <input
                                    type="text"
                                    placeholder="Rechercher..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ ...inputStyle, paddingLeft: '40px', background: '#f9fafb', border: '1.5px solid #f0f0f0' }}
                                />
                            </div>
                        </div>

                        <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', padding: '8px 12px 12px' }}>
                            {filteredRecipes.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                                    <Utensils size={28} color="#d1d5db" style={{ marginBottom: '8px' }} />
                                    <p style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600, margin: 0 }}>Aucun résultat</p>
                                </div>
                            ) : filteredRecipes.map(recipe => {
                                const selected = formData.recipe_ids.includes(recipe.id);
                                return (
                                    <div
                                        key={recipe.id}
                                        onClick={() => handleToggleRecipe(recipe.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px',
                                            borderRadius: '12px', cursor: 'pointer',
                                            background: selected ? 'rgba(67,24,255,0.04)' : 'transparent',
                                            border: selected ? '1px solid rgba(67,24,255,0.1)' : '1px solid transparent',
                                            marginBottom: '4px', transition: 'all 0.15s',
                                        }}
                                    >
                                        <img src={recipe.image} style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: selected ? '2px solid #4318ff' : '2px solid transparent', transition: 'border 0.15s' }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: selected ? '#4318ff' : '#111827', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {recipe.name}
                                            </p>
                                            <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>{recipe.category}</p>
                                        </div>
                                        <div style={{
                                            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                                            background: selected ? '#4318ff' : '#f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s',
                                        }}>
                                            <CheckCircle2 size={15} color={selected ? '#fff' : '#d1d5db'} fill="none" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ background: '#f9fafb', borderRadius: '14px', padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '10px', border: '1px solid #f0f0f0' }}>
                        <Info size={15} color="#9ca3af" style={{ flexShrink: 0, marginTop: '1px' }} />
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: 500, lineHeight: 1.5 }}>
                            L'ordre d'affichage des sections se gère depuis la liste des sections.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
