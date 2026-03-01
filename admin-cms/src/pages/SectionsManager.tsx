import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, LayoutGrid, GalleryHorizontal, List, AlignJustify, Smartphone, Compass, Sparkles, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    dynamic_carousel: { label: 'Carrousel', icon: GalleryHorizontal, color: '#7c3aed', bg: '#ede9fe' },
    horizontal_list: { label: 'Horizontal', icon: AlignJustify, color: '#0891b2', bg: '#e0f2fe' },
    vertical_list_1: { label: 'Liste simple', icon: List, color: '#059669', bg: '#d1fae5' },
    vertical_list_2: { label: 'Grille 2col', icon: LayoutGrid, color: '#d97706', bg: '#fef3c7' },
};

function getTypeMeta(type: string) {
    return TYPE_META[type] || { label: type, icon: LayoutGrid, color: '#6b7280', bg: '#f3f4f6' };
}

export function SectionsManager() {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    useEffect(() => { fetchData(); }, []);

    async function handleDelete(id: string) {
        if (!window.confirm('Supprimer cette section ?')) return;
        setDeletingId(id);
        try {
            const { error } = await supabase.from('home_sections').delete().eq('id', id);
            if (error) throw error;
            setSections(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            console.error('Failed to delete:', err);
            alert('Erreur lors de la suppression.');
        } finally {
            setDeletingId(null);
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
            if (groupItem) return { ...s, order_index: newGroup.indexOf(groupItem) };
            return s;
        });
        newSections.sort((a, b) => a.order_index - b.order_index);
        setSections(newSections);

        try {
            const updates = newGroup.map((s, i) => ({
                id: s.id, title: s.title, subtitle: s.subtitle,
                recipe_ids: s.recipe_ids, type: s.type, config: s.config, order_index: i
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

    const SectionCard = ({ section, idx, group }: { section: any; idx: number; group: any[] }) => {
        const meta = getTypeMeta(section.type);
        const Icon = meta.icon;
        const isFirst = idx === 0;
        const isLast = idx === group.length - 1;
        const isDeleting = deletingId === section.id;

        return (
            <div style={{
                background: '#ffffff',
                borderRadius: '18px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                transition: 'box-shadow 0.2s, transform 0.15s',
                opacity: isDeleting ? 0.5 : 1,
            }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
            >
                {/* Rank badge */}
                <div style={{
                    width: '32px', height: '32px', flexShrink: 0,
                    background: '#f9fafb', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#9ca3af', border: '1px solid #f0f0f0',
                }}>
                    {idx + 1}
                </div>

                {/* Type icon */}
                <div style={{
                    width: '44px', height: '44px', flexShrink: 0,
                    background: meta.bg, borderRadius: '13px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Icon size={20} color={meta.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {section.title || 'Sans titre'}
                        </span>
                        <span style={{
                            flexShrink: 0,
                            fontSize: '10px', fontWeight: 700,
                            background: meta.bg, color: meta.color,
                            borderRadius: '8px', padding: '2px 8px',
                            textTransform: 'uppercase', letterSpacing: '0.4px',
                        }}>
                            {meta.label}
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {section.subtitle || 'Aucune description'}
                        {section.recipe_ids?.length > 0 && (
                            <span style={{ marginLeft: '8px', color: '#d1d5db' }}>·</span>
                        )}
                        {section.recipe_ids?.length > 0 && (
                            <span style={{ marginLeft: '8px', color: '#6b7280', fontWeight: 600 }}>
                                {section.recipe_ids.length} plat{section.recipe_ids.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </p>
                </div>

                {/* Reorder controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                    <button
                        onClick={() => handleMoveGroup(section.id, 'up', group)}
                        disabled={isFirst}
                        style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            border: '1px solid #e5e7eb', background: isFirst ? '#f9fafb' : '#fff',
                            cursor: isFirst ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isFirst ? '#d1d5db' : '#6b7280', transition: 'all 0.15s',
                        }}
                    >
                        <ArrowUp size={14} />
                    </button>
                    <button
                        onClick={() => handleMoveGroup(section.id, 'down', group)}
                        disabled={isLast}
                        style={{
                            width: '28px', height: '28px', borderRadius: '8px',
                            border: '1px solid #e5e7eb', background: isLast ? '#f9fafb' : '#fff',
                            cursor: isLast ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: isLast ? '#d1d5db' : '#6b7280', transition: 'all 0.15s',
                        }}
                    >
                        <ArrowDown size={14} />
                    </button>
                </div>

                {/* Divider */}
                <div style={{ width: '1px', height: '40px', background: '#f0f0f0', flexShrink: 0 }} />

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <Link
                        to={`/sections/edit/${section.id}`}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '8px 14px', borderRadius: '10px',
                            background: '#f3f4f6', border: '1px solid #e5e7eb',
                            fontSize: '12px', fontWeight: 700, color: '#374151',
                            textDecoration: 'none', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#e5e7eb';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = '#f3f4f6';
                        }}
                    >
                        <Edit2 size={13} /> Modifier
                    </Link>
                    <button
                        onClick={() => handleDelete(section.id)}
                        disabled={isDeleting}
                        style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            border: '1px solid #fee2e2', background: '#fff5f5',
                            cursor: 'pointer', color: '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#fee2e2';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = '#fff5f5';
                        }}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        );
    };

    const GroupPanel = ({ title, description, icon: GroupIcon, iconColor, iconBg, groupSections }: {
        title: string; description: string; icon: any; iconColor: string; iconBg: string; groupSections: any[];
    }) => (
        <div style={{ marginBottom: '32px' }}>
            {/* Group Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '38px', height: '38px', borderRadius: '12px',
                        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <GroupIcon size={18} color={iconColor} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#111827' }}>{title}</h3>
                        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{description}</p>
                    </div>
                </div>
                <span style={{
                    fontSize: '12px', fontWeight: 700, color: '#6b7280',
                    background: '#f3f4f6', borderRadius: '10px', padding: '4px 12px',
                }}>
                    {groupSections.length} section{groupSections.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Cards */}
            {groupSections.length === 0 ? (
                <div style={{
                    background: '#fafafa', border: '2px dashed #e5e7eb',
                    borderRadius: '18px', padding: '48px 24px', textAlign: 'center',
                }}>
                    <div style={{ width: '52px', height: '52px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                        <LayoutGrid size={24} color="#d1d5db" />
                    </div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: '#374151' }}>Aucune section</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }}>Créez une section pour cette page via le bouton ci-dessus.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {groupSections.map((section, idx) => (
                        <SectionCard key={section.id} section={section} idx={idx} group={groupSections} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                        Administration
                    </p>
                    <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '2px 0 6px' }}>
                        Sections de l'Application
                    </h1>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                        Gérez les thématiques affichées sur les pages de l'application mobile.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={fetchData}
                        style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: '#f3f4f6', border: '1px solid #e5e7eb',
                            cursor: 'pointer', color: '#6b7280',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.15s',
                        }}
                        title="Rafraîchir"
                    >
                        <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                    <Link
                        to="/sections/create"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            background: '#4318ff', color: '#fff',
                            border: 'none', borderRadius: '14px',
                            padding: '10px 20px', fontSize: '14px', fontWeight: 700,
                            cursor: 'pointer', textDecoration: 'none',
                            boxShadow: '0 4px 16px rgba(67,24,255,0.25)',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Plus size={17} /> Nouvelle Section
                    </Link>
                </div>
            </div>

            {/* Stats bar */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px',
            }}>
                {[
                    { label: 'Total sections', value: sections.length, icon: LayoutGrid, color: '#4318ff', bg: '#ede9fe' },
                    { label: 'Page Accueil', value: homeSections.length, icon: Smartphone, color: '#059669', bg: '#d1fae5' },
                    { label: 'Page Explorer', value: explorerSections.length, icon: Compass, color: '#d97706', bg: '#fef3c7' },
                ].map(stat => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} style={{
                            background: '#fff', borderRadius: '16px',
                            border: '1px solid #f0f0f0', padding: '16px 20px',
                            display: 'flex', alignItems: 'center', gap: '14px',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.03)',
                        }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={stat.color} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{stat.value}</p>
                                <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#9ca3af', fontWeight: 600 }}>{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            height: '80px', borderRadius: '18px',
                            background: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 1.5s infinite',
                        }} />
                    ))}
                </div>
            ) : (
                <>
                    <GroupPanel
                        title="Page d'Accueil"
                        description="Sections affichées sur l'écran principal de l'app"
                        icon={Smartphone}
                        iconColor="#059669"
                        iconBg="#d1fae5"
                        groupSections={homeSections}
                    />
                    <GroupPanel
                        title="Page Explorer"
                        description="Sections affichées sur l'écran d'exploration"
                        icon={Compass}
                        iconColor="#d97706"
                        iconBg="#fef3c7"
                        groupSections={explorerSections}
                    />
                </>
            )}

            {/* Footer note */}
            <div style={{
                marginTop: '24px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                borderRadius: '18px', padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: '14px',
            }}>
                <div style={{ width: '38px', height: '38px', background: '#7c3aed', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={18} color="#fff" />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#5b21b6' }}>Synchronisation en temps réel</p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#7c3aed', fontWeight: 500 }}>
                        Les sections gérées ici apparaissent sur l'application mobile instantanément.
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0; }
                    100% { background-position:  200% 0; }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
