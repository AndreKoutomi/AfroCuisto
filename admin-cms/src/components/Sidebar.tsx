import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookText, LayoutGrid, MessageSquare, Users, Settings } from 'lucide-react';

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/chef_icon_v2.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--text-main)' }}>Afro</span><span style={{ color: 'var(--primary)' }}>Cuisto</span>
                </div>
                <span className="badge badge-primary text-xs ml-2" style={{ marginLeft: 'auto' }}>PRO</span>
            </div>

            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '0 2rem 1rem 2rem' }}></div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                    <span>Tableau de bord</span>
                </NavLink>
                <NavLink
                    to="/recipes"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <BookText size={20} style={{ marginRight: '8px' }} />
                    <span>Recettes</span>
                </NavLink>
                <NavLink
                    to="/sections"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutGrid size={20} style={{ marginRight: '8px' }} />
                    <span>Sections</span>
                </NavLink>
                <NavLink
                    to="/users"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Users size={20} style={{ marginRight: '8px' }} />
                    <span>Utilisateurs</span>
                </NavLink>
                <NavLink
                    to="/feedback"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    <span>Retour client</span>
                    <span className="badge badge-primary text-[10px] ml-auto">NEW</span>
                </NavLink>
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Settings size={20} style={{ marginRight: '8px' }} />
                    <span>Réglages IA</span>
                </NavLink>
            </nav>

        </aside>
    );
}
