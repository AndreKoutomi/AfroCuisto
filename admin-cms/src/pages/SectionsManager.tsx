import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SectionsManager() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchSections() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('home_sections')
                .select('*')
                .order('order_index');

            if (error && error.code !== '42P01') throw error;
            if (data) {
                setSections(data);
            }
        } catch (err) {
            console.error('Error fetching sections:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSections();
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

        // Update local state for UI speed
        setSections(newSections.map((s, i) => ({ ...s, order_index: i })));

        // Update in Supabase
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
            fetchSections(); // Revert on failure
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="font-bold text-2xl">Gestion des Sections</h2>
                    <p className="text-muted" style={{ fontSize: '14px', fontWeight: 500 }}>Organisez le contenu de l'accueil de l'application</p>
                </div>
                <Link to="/sections/create" className="btn btn-primary">
                    <Plus size={18} />
                    Ajouter Nouvelle
                </Link>
            </div>

            <div className="card">
                {loading ? (
                    <div className="center-content">
                        <div className="loader"></div>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>#</th>
                                    <th>Titre</th>
                                    <th>Sous-titre</th>
                                    <th>Plats</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Ordre</th>
                                    <th style={{ width: '120px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                                            <div className="flex flex-col items-center gap-3">
                                                <LayoutGrid size={40} className="text-muted opacity-30" />
                                                <p className="text-muted">Aucune section thématique configurée.</p>
                                                <Link to="/sections/create" className="text-primary font-bold">Créer la première section</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sections.map((section, idx) => (
                                        <tr key={section.id}>
                                            <td className="text-muted" style={{ fontSize: '12px' }}>{idx + 1}</td>
                                            <td style={{ fontWeight: 600 }}>{section.title}</td>
                                            <td className="text-muted" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {section.subtitle || '—'}
                                            </td>
                                            <td>
                                                <span className="badge badge-primary">{section.recipe_ids?.length || 0} plats</span>
                                            </td>
                                            <td>
                                                <div className="flex justify-center gap-1">
                                                    <button onClick={() => handleMove(section.id, 'up')} disabled={idx === 0} className="btn-icon">
                                                        <ArrowUp size={16} />
                                                    </button>
                                                    <button onClick={() => handleMove(section.id, 'down')} disabled={idx === sections.length - 1} className="btn-icon">
                                                        <ArrowDown size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Link to={`/sections/edit/${section.id}`} className="btn-icon">
                                                        <Edit2 size={18} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(section.id)} className="btn-icon text-danger">
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
        </div>
    );
}
