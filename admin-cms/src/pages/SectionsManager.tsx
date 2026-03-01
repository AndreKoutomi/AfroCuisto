import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LayoutGrid, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Recipe {
    id: string;
    image: string;
}

export function SectionsManager() {
    const [sections, setSections] = useState<any[]>([]);
    const [recipes, setRecipes] = useState<Record<string, Recipe>>({});
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        try {
            setLoading(true);

            // Fetch sections
            const { data: sectionData, error: sectionError } = await supabase
                .from('home_sections')
                .select('*')
                .order('order_index');

            if (sectionError && sectionError.code !== '42P01') throw sectionError;

            if (sectionData) {
                setSections(sectionData);

                // Extract all unique recipe IDs to fetch their images
                const recipeIds = Array.from(new Set(sectionData.flatMap(s => s.recipe_ids || [])));

                if (recipeIds.length > 0) {
                    const { data: recipeData, error: recipeError } = await supabase
                        .from('recipes')
                        .select('id, image')
                        .in('id', recipeIds);

                    if (!recipeError && recipeData) {
                        const recipeMap = recipeData.reduce((acc, r) => ({ ...acc, [r.id]: r }), {});
                        setRecipes(recipeMap);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleDelete(id: string) {
        if (window.confirm("Voulez-vous vraiment supprimer cette section ?")) {
            try {
                const { error } = await supabase.from('home_sections').delete().eq('id', id);
                if (error) throw error;
                setSections(sections.filter(s => s.id !== id));
            } catch (err) {
                console.error('Failed to delete:', err);
                alert('Erreur lors de la suppression.');
            }
        }
    }

    async function handleMove(id: string, direction: 'up' | 'down') {
        const index = sections.findIndex(s => s.id === id);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= sections.length) return;

        const newSections = [...sections];
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];

        setSections(newSections.map((s, i) => ({ ...s, order_index: i })));

        try {
            const updates = newSections.map((s, i) => ({
                id: s.id,
                title: s.title,
                subtitle: s.subtitle,
                recipe_ids: s.recipe_ids,
                order_index: i
            }));
            const { error } = await supabase.from('home_sections').upsert(updates);
            if (error) throw error;
        } catch (err) {
            console.error('Move error:', err);
            fetchData();
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-bold text-2xl">Sections de l'Accueil</h2>
                    <p className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Gérez les thématiques affichées sur la page d'accueil de l'application.</p>
                </div>
                <Link to="/sections/create" className="btn btn-primary">
                    <Plus size={18} />
                    Nouvelle Section
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <div className="center-content">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="table-wrapper" style={{ padding: 0 }}>
                        <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F4F7FE' }}>
                                    <th style={{ width: '60px', padding: '1.5rem', borderRadius: '20px 0 0 0' }}>#</th>
                                    <th style={{ padding: '1.5rem' }}>Thématique & Aperçu</th>
                                    <th style={{ padding: '1.5rem' }}>Description</th>
                                    <th style={{ padding: '1.5rem', textAlign: 'center' }}>Ordre</th>
                                    <th style={{ width: '150px', padding: '1.5rem', borderRadius: '0 20px 0 0' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '5rem' }}>
                                            <div className="flex flex-col items-center gap-4 opacity-40">
                                                <LayoutGrid size={64} />
                                                <div className="max-w-xs">
                                                    <p className="font-bold text-lg mb-1">Aucune section active</p>
                                                    <p className="text-sm font-medium">Vos sections apparaîtront entre la sélection du chef et les suggestions IA.</p>
                                                </div>
                                                <Link to="/sections/create" className="btn btn-secondary mt-2">Créer ma première section</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sections.map((section, idx) => (
                                        <tr key={section.id}>
                                            <td className="text-muted" style={{ padding: '1.5rem', fontWeight: 700 }}>{idx + 1}</td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div className="flex flex-col gap-3">
                                                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>{section.title}</span>
                                                    <div className="flex -space-x-2">
                                                        {(section.recipe_ids || []).slice(0, 4).map((rid: string) => (
                                                            <div key={rid} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-stone-100 shadow-sm">
                                                                {recipes[rid] ? (
                                                                    <img src={recipes[rid].image} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                                        <ImageIcon size={12} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {section.recipe_ids?.length > 4 && (
                                                            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                                                                +{section.recipe_ids.length - 4}
                                                            </div>
                                                        )}
                                                        {(!section.recipe_ids || section.recipe_ids.length === 0) && (
                                                            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Aucun plat selectionné</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-muted" style={{ padding: '1.5rem', maxWidth: '300px' }}>
                                                <p className="text-sm font-medium line-clamp-2">{section.subtitle || 'Aucune description'}</p>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div className="flex flex-col items-center gap-1">
                                                    <button onClick={() => handleMove(section.id, 'up')} disabled={idx === 0} className="btn-icon">
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button onClick={() => handleMove(section.id, 'down')} disabled={idx === sections.length - 1} className="btn-icon">
                                                        <ArrowDown size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.5rem' }}>
                                                <div className="flex gap-2">
                                                    <Link to={`/sections/edit/${section.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                                                        <Edit2 size={16} /> Modifier
                                                    </Link>
                                                    <button onClick={() => handleDelete(section.id)} className="btn-icon text-danger hover:bg-red-50">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-10 p-6 bg-white rounded-3xl border border-stone-100 flex items-center gap-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-800">Note sur la synchronisation</h4>
                    <p className="text-sm text-stone-500 font-medium">Les sections gérées ici apparaissent sur l'application mobile en temps réel pour tous les utilisateurs connectés.</p>
                </div>
            </div>
        </div>
    );
}
