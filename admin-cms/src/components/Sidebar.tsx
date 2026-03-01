import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookText } from 'lucide-react';

export function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span style={{ color: 'var(--text-main)' }}>Afri</span><span style={{ color: 'var(--primary)' }}>Hub</span>
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
                    to="/ai-generator"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <circle cx="12" cy="12" r="4" />
                    </svg>
                    <span style={{ background: '-webkit-linear-gradient(45deg, #4318FF, #868CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>Générateur IA</span>
                </NavLink>
            </nav>

        </aside>
    );
}
