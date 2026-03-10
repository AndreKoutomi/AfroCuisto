/**
 * ============================================================================
 * EXPLICATION DU FICHIER POUR LES DÉBUTANTS
 * ============================================================================
 * Rôle principal : Le menu de navigation latéral de l'espace d'administration pour passer d'une rubrique à l'autre (Recettes, Utilisateurs, Paramètres...).
 * 
 * Conseils de lecture :
 * - Cherchez les mots-clés "function" ou "const" pour voir les actions définies.
 * - Le mot "return" suivi de balises HTML (ex: <div>) indique un élément visuel (Composant React).
 * - "import" en haut signifie qu'on utilise des outils d'autres fichiers pour s'aider.
 * ============================================================================
 */

import { NavLink } from 'react-router-dom'; // Outil pour créer des liens de navigation qui savent s'ils sont cliqués
import { LayoutDashboard, BookText, LayoutGrid, MessageSquare, Users, Settings, Heart, CreditCard } from 'lucide-react'; // Icônes visuelles

// Composant Sidebar (La barre latérale gauche)
export function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Haut de la barre latérale : Logo et Nom de l'app */}
            <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/images/chef_icon_v2.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                    <span style={{ color: 'var(--text-main)' }}>Afro</span><span style={{ color: 'var(--primary)' }}>Cuisto</span>
                </div>
                {/* Petit badge pour indiquer une version Pro ou démo */}
                <span className="badge badge-primary text-xs ml-2" style={{ marginLeft: 'auto' }}>PRO</span>
            </div>

            {/* Une ligne de séparation élégante */}
            <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '0 2rem 1rem 2rem' }}></div>

            {/* Navigation : la liste des liens vers les différentes pages */}
            <nav className="sidebar-nav">
                {/* Lien vers le Tableau de bord */}
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} style={{ marginRight: '8px' }} />
                    <span>Tableau de bord</span>
                </NavLink>

                {/* Lien vers la liste des Recettes */}
                <NavLink
                    to="/recipes"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <BookText size={20} style={{ marginRight: '8px' }} />
                    <span>Recettes</span>
                </NavLink>

                {/* Lien vers la gestion des Sections (rubriques de l'accueil) */}
                <NavLink
                    to="/sections"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <LayoutGrid size={20} style={{ marginRight: '8px' }} />
                    <span>Sections</span>
                </NavLink>

                {/* Lien vers la liste des Utilisateurs */}
                <NavLink
                    to="/users"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Users size={20} style={{ marginRight: '8px' }} />
                    <span>Utilisateurs</span>
                </NavLink>

                {/* Lien vers les Transactions financières */}
                <NavLink
                    to="/transactions"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <CreditCard size={20} style={{ marginRight: '8px' }} />
                    <span>Transactions</span>
                </NavLink>

                {/* Lien vers les Retours clients (avis) */}
                <NavLink
                    to="/feedback"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <MessageSquare size={20} style={{ marginRight: '8px' }} />
                    <span>Retour client</span>
                </NavLink>

                {/* Lien vers les Contributions (suggestions de plats par les gens) */}
                <NavLink
                    to="/contributions"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Heart size={20} style={{ marginRight: '8px' }} />
                    <span>Contributions Utilisateur</span>
                    <span className="badge badge-primary text-[10px] ml-auto">NEW</span>
                </NavLink>

                {/* Lien vers les réglages de l'Intelligence Artificielle */}
                <NavLink
                    to="/settings"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Settings size={20} style={{ marginRight: '8px' }} />
                    <span>Réglages IA</span>
                </NavLink>
            </nav>

        </aside> // Fin du composant Sidebar
    );
}
