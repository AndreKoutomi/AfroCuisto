import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LayoutGrid, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SectionsManager() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchData() {
        try {
            setLoading(true);
            const { data: sectionData, error: sectionError } = await supabase
                .from('home_sections')
                .select('*')
                .order('order_index');

            if (sectionError && sectionError.code !== '42P01') throw sectionError;
            if (sectionData) setSections(sectionData);
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

    async function handleMoveGroup(id: string, direction: 'up' | 'down', group: any[]) {
        const index = group.findIndex(s => s.id === id);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= group.length) return;

        const newGroup = [...group];
        [newGroup[index], newGroup[targetIndex]] = [newGroup[targetIndex], newGroup[index]];

        const newSections = sections.map(s => {
            const groupItem = newGroup.find(g => g.id === s.id);
            if (groupItem) {
                return { ...s, order_index: newGroup.indexOf(groupItem) };
            }
            return s;
        });

        // re-sort based on order_index globally so everything stays consistent in UI
        newSections.sort((a, b) => a.order_index - b.order_index);
        setSections(newSections);

        try {
            const updates = newGroup.map((s, i) => ({
                id: s.id,
                title: s.title,
                subtitle: s.subtitle,
                recipe_ids: s.recipe_ids,
                type: s.type,
                config: s.config,
                order_index: i
            }));
            const { error } = await supabase.from('home_sections').upsert(updates);
            if (error) throw error;
        } catch (err) {
            console.error('Move error:', err);
            fetchData();
        }
    }

    const homeSections = sections.filter(s => !s.config?.page || s.config.page === 'home');
    const explorerSections = sections.filter(s => s.config?.page === 'explorer');

    const renderTable = (groupTitle: string, groupDescription: string, groupSections: any[]) => (
        <div className="mb-12">
            <h3 className="font-bold text-xl mb-1">{groupTitle}</h3>
            <p className="text-muted text-sm font-medium mb-4">{groupDescription}</p>
            <div className="card">
                <div className="table-wrapper" style={{ padding: 0 }}>
                    <table className="table" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                        <thead>
                            <tr style={{ backgroundColor: '#F4F7FE' }}>
                                <th style={{ width: '60px', padding: '1.5rem', borderRadius: '20px 0 0 0' }}>#</th>
                                <th style={{ padding: '1.5rem' }}>Thématique</th>
                                <th style={{ padding: '1.5rem' }}>Source</th>
                                <th style={{ padding: '1.5rem' }}>Description</th>
                                <th style={{ padding: '1.5rem', textAlign: 'center' }}>Ordre</th>
                                <th style={{ width: '150px', padding: '1.5rem', borderRadius: '0 20px 0 0' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupSections.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '5rem' }}>
                                        <div className="flex flex-col items-center gap-4 opacity-40">
                                            <LayoutGrid size={64} />
                                            <div className="max-w-xs">
                                                <p className="font-bold text-lg mb-1">Aucune section</p>
                                                <p className="text-sm font-medium">Créer une section pour cette page.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                groupSections.map((section, idx) => (
                                    <tr key={section.id}>
                                        <td className="text-muted" style={{ padding: '1.5rem', fontWeight: 700 }}>{idx + 1}</td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div className="flex flex-col gap-2">
                                                <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>{section.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            {section.type === 'manual' ? (
                                                <div className="flex flex-col gap-1">
                                                    <span className="badge" style={{ backgroundColor: 'rgba(112, 126, 174, 0.1)', color: '#707EAE', border: 'none', padding: '4px 8px', fontSize: '10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}>
                                                        Manuel
                                                    </span>
                                                    <span className="text-[10px] text-muted font-bold uppercase ml-1">
                                                        {section.recipe_ids?.length || 0} pépites
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <span className="badge" style={{ backgroundColor: 'rgba(67, 24, 255, 0.1)', color: 'var(--primary)', border: 'none', padding: '4px 8px', fontSize: '10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}>
                                                        <Sparkles size={10} className="mr-1" /> {
                                                            section.type === 'category' ? 'Catégorie' :
                                                                section.type === 'region' ? 'Région' :
                                                                    section.type === 'quick' ? 'Express' : 'Global'
                                                        }
                                                    </span>
                                                    <span className="text-[10px] text-muted font-bold uppercase ml-1">
                                                        {section.type === 'category' ? section.config?.category :
                                                            section.type === 'region' ? section.config?.region :
                                                                section.type === 'quick' ? `${section.config?.max_prep_time} min` : 'Tout'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="text-muted" style={{ padding: '1.5rem', maxWidth: '300px' }}>
                                            <p className="text-sm font-medium line-clamp-2">{section.subtitle || 'Aucune description'}</p>
                                        </td>
                                        <td style={{ padding: '1.5rem' }}>
                                            <div className="flex flex-col items-center gap-1">
                                                <button onClick={() => handleMoveGroup(section.id, 'up', groupSections)} disabled={idx === 0} className="btn-icon">
                                                    <ArrowUp size={16} />
                                                </button>
                                                <button onClick={() => handleMoveGroup(section.id, 'down', groupSections)} disabled={idx === groupSections.length - 1} className="btn-icon">
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
            </div>
        </div>
    );

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="font-bold text-2xl">Sections de l'Application</h2>
                    <p className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Gérez les thématiques affichées sur les pages d'accueil et explorer.</p>
                </div>
                <Link to="/sections/create" className="btn btn-primary">
                    <Plus size={18} />
                    Nouvelle Section
                </Link>
            </div>

            {loading ? (
                <div className="card">
                    <div className="center-content">
                        <div className="loader"></div>
                    </div>
                </div>
            ) : (
                <>
                    {renderTable("Page d'Accueil", "Ces sections sont affichées sur l'écran d'accueil.", homeSections)}
                    {renderTable("Page Explorer", "Ces sections sont affichées sur l'écran d'exploration de l'application.", explorerSections)}
                </>
            )}

            <div className="mt-10 p-6 bg-white rounded-3xl border border-stone-100 flex items-center gap-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <LayoutGrid size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-stone-800">Note sur la synchronisation</h4>
                    <p className="text-sm text-stone-500 font-medium">Les sections gérées ici apparaissent sur l'application mobile en temps réel.</p>
                </div>
            </div>
        </div>
    );
}
