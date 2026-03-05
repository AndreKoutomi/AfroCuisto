import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Mail, Calendar, Search, Shield, RefreshCw, Copy, Check, Heart, ShoppingBag } from 'lucide-react';

interface UserProfile {
    id: string;
    name?: string;
    email?: string;
    language?: string;
    dark_mode?: boolean;
    joined_date?: string;
    updated_at?: string;
    favorites?: string[];
    shopping_list?: any[];
    avatar?: string;
}

export function UsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'favorites'>('date');
    const [copied, setCopied] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            // Récupérer depuis user_profiles (données enrichies)
            const { data: profiles, error: profilesError } = await supabase
                .from('user_profiles')
                .select('*')
                .order('joined_date', { ascending: false });

            if (profilesError) {
                if (profilesError.code === '42P01') {
                    setError('La table user_profiles n\'existe pas encore. Les utilisateurs apparaîtront ici après leur première connexion.');
                    setUsers([]);
                    return;
                }
                throw profilesError;
            }
            setUsers(profiles || []);
        } catch (err: any) {
            console.error('Erreur chargement utilisateurs:', err);
            setError(err.message || 'Erreur lors du chargement des utilisateurs.');
        } finally {
            setLoading(false);
        }
    }

    const copyEmail = (email: string) => {
        navigator.clipboard.writeText(email).then(() => {
            setCopied(email);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const filtered = users
        .filter(u => {
            const q = search.toLowerCase();
            return !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        })
        .sort((a, b) => {
            if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
            if (sortBy === 'favorites') return (b.favorites?.length || 0) - (a.favorites?.length || 0);
            return new Date(b.joined_date || 0).getTime() - new Date(a.joined_date || 0).getTime();
        });

    const stats = {
        total: users.length,
        darkMode: users.filter(u => u.dark_mode).length,
        avgFavorites: users.length > 0
            ? (users.reduce((acc, u) => acc + (u.favorites?.length || 0), 0) / users.length).toFixed(1)
            : 0,
    };

    const getInitials = (name?: string, email?: string) => {
        if (name && name.trim()) return name.trim().slice(0, 2).toUpperCase();
        if (email) return email.slice(0, 2).toUpperCase();
        return '??';
    };

    const getAvatarColor = (id: string) => {
        const colors = [
            ['#fb5607', '#ff8c42'],
            ['#F94D00', '#ff8c42'],
            ['#059669', '#34d399'],
            ['#d97706', '#fbbf24'],
            ['#7c3aed', '#a78bfa'],
            ['#0891b2', '#22d3ee'],
        ];
        const idx = id.charCodeAt(0) % colors.length;
        return colors[idx];
    };

    const langLabel = (lang?: string) => {
        if (lang === 'en') return '🇬🇧 Anglais';
        if (lang === 'es') return '🇪🇸 Espagnol';
        return '🇫🇷 Français';
    };

    return (
        <div style={{ padding: '0 0 40px' }}>

            {/* ── Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Utilisateurs inscrits', value: stats.total, suffix: 'comptes', icon: <Users size={20} />, color: '#fb5607', bg: '#fff5f0' },
                    { label: 'Mode Sombre activé', value: stats.darkMode, suffix: 'utilisateurs', icon: <Shield size={20} />, color: '#7c3aed', bg: '#F5F3FF' },
                    { label: 'Favoris moyens', value: stats.avgFavorites, suffix: 'par compte', icon: <Heart size={20} />, color: '#fb5607', bg: '#FFF7ED' },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', borderRadius: '28px', padding: '24px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                                {s.icon}
                            </div>
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                            <span style={{ fontSize: '36px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{s.value}</span>
                            <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 600, paddingBottom: '4px' }}>{s.suffix}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                {/* Search */}
                <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '14px' }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un utilisateur par nom ou email..."
                        style={{
                            width: '100%', height: '46px', borderRadius: '14px',
                            border: '1.5px solid #e5e7eb', background: '#fff',
                            paddingLeft: '42px', paddingRight: '16px',
                            fontSize: '14px', fontWeight: 500, color: '#374151',
                            outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                </div>
                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as any)}
                    style={{
                        height: '46px', borderRadius: '14px', border: '1.5px solid #e5e7eb',
                        background: '#fff', padding: '0 14px', fontSize: '13px', fontWeight: 700,
                        color: '#374151', cursor: 'pointer', outline: 'none',
                    }}
                >
                    <option value="date">Trier par date</option>
                    <option value="name">Trier par nom</option>
                    <option value="favorites">Trier par favoris</option>
                </select>
                {/* Refresh */}
                <button
                    onClick={fetchUsers}
                    title="Actualiser"
                    style={{
                        width: '46px', height: '46px', borderRadius: '14px',
                        border: '1.5px solid #e5e7eb', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#6b7280', flexShrink: 0,
                        transition: 'all 0.15s',
                    }}
                >
                    <RefreshCw size={17} />
                </button>
            </div>

            {/* ── Content ── */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '16px', color: '#9ca3af' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e5e7eb', borderTopColor: '#fb5607', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ fontWeight: 600, margin: 0 }}>Chargement des utilisateurs...</p>
                </div>
            ) : error ? (
                <div style={{ background: '#fff', borderRadius: '28px', padding: '60px', textAlign: 'center', border: '1px dashed #e5e7eb' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Users size={28} color="#d97706" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Aucun utilisateur trouvé</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '28px', padding: '60px', textAlign: 'center', border: '1px dashed #e5e7eb' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Search size={28} color="#d1d5db" />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Aucun résultat</h3>
                    <p style={{ color: '#9ca3af', fontSize: '14px' }}>Aucun utilisateur ne correspond à "{search}".</p>
                </div>
            ) : (
                <div style={{ background: '#fff', borderRadius: '28px', border: '1px solid #f0f0f0', boxShadow: '0 1px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                    {/* Table Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px', gap: '12px', padding: '14px 24px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                        {['Utilisateur', 'Email', 'Langue', 'Favoris', 'Inscription', 'Mode'].map(h => (
                            <span key={h} style={{ fontSize: '10px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</span>
                        ))}
                    </div>

                    {/* Table Rows */}
                    {filtered.map((user, idx) => {
                        const [colorA, colorB] = getAvatarColor(user.id);
                        const isLast = idx === filtered.length - 1;
                        return (
                            <div
                                key={user.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 80px',
                                    gap: '12px',
                                    padding: '18px 24px',
                                    alignItems: 'center',
                                    borderBottom: isLast ? 'none' : '1px solid #f9fafb',
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#fafeff')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                {/* Avatar + Nom */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            style={{ width: 40, height: 40, borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '12px', flexShrink: 0,
                                            background: `linear-gradient(135deg, ${colorA}, ${colorB})`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '14px', fontWeight: 900, color: '#fff',
                                        }}>
                                            {getInitials(user.name, user.email)}
                                        </div>
                                    )}
                                    <div>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                                            {user.name || <span style={{ color: '#d1d5db', fontStyle: 'italic' }}>Sans nom</span>}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>
                                            {user.id.slice(0, 8)}...
                                        </p>
                                    </div>
                                </div>

                                {/* Email + Copier */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <Mail size={13} color="#9ca3af" style={{ flexShrink: 0 }} />
                                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.email || '—'}
                                    </span>
                                    {user.email && (
                                        <button
                                            onClick={() => copyEmail(user.email!)}
                                            title="Copier l'email"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === user.email ? '#059669' : '#d1d5db', padding: '2px', flexShrink: 0, display: 'flex' }}
                                        >
                                            {copied === user.email ? <Check size={13} /> : <Copy size={13} />}
                                        </button>
                                    )}
                                </div>

                                {/* Langue */}
                                <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>
                                    {langLabel(user.language)}
                                </span>

                                {/* Favoris */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        background: '#fff7ed', borderRadius: '20px', padding: '4px 10px',
                                        border: '1px solid #fed7aa'
                                    }}>
                                        <Heart size={11} color="#fb5607" fill="#fb5607" />
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#ea580c' }}>
                                            {user.favorites?.length || 0}
                                        </span>
                                    </div>
                                    {(user.shopping_list?.length || 0) > 0 && (
                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            background: '#f0fdf4', borderRadius: '20px', padding: '4px 10px',
                                            border: '1px solid #bbf7d0'
                                        }}>
                                            <ShoppingBag size={11} color="#059669" />
                                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669' }}>
                                                {user.shopping_list?.length}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Date inscription */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#9ca3af' }}>
                                    <Calendar size={12} />
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>
                                        {user.joined_date
                                            ? new Date(user.joined_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })
                                            : '—'}
                                    </span>
                                </div>

                                {/* Mode sombre */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span style={{
                                        fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '20px',
                                        background: user.dark_mode ? '#1e1b4b' : '#f3f4f6',
                                        color: user.dark_mode ? '#a5b4fc' : '#9ca3af',
                                    }}>
                                        {user.dark_mode ? '🌙 Sombre' : '☀️ Clair'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Footer count */}
                    <div style={{ padding: '12px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#9ca3af' }}>
                            {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
                            {search && ` · Recherche : "${search}"`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
