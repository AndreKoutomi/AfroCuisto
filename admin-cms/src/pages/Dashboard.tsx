/**
 * ============================================================================
 * EXPLICATION DU FICHIER POUR LES DÉBUTANTS
 * ============================================================================
 * Rôle principal : Le tableau de bord central. Affiche des statistiques rapides (nombre total de recettes, utilisateurs récents) pour aider l'administrateur.
 * 
 * Conseils de lecture :
 * - Cherchez les mots-clés "function" ou "const" pour voir les actions définies.
 * - Le mot "return" suivi de balises HTML (ex: <div>) indique un élément visuel (Composant React).
 * - "import" en haut signifie qu'on utilise des outils d'autres fichiers pour s'aider.
 * ============================================================================
 */

import { useEffect, useState } from 'react'; // Outils pour gérer le cycle de vie et la mémoire du composant
import { supabase } from '../lib/supabase'; // Client pour lire les données dans la base Supabase
import { Book, Users, Star } from 'lucide-react'; // Icônes pour illustrer les statistiques

export function Dashboard() {
    // État (mémoire) pour stocker les statistiques (ex: nombre de recettes)
    const [stats, setStats] = useState({ recipes: 0 });
    // État pour savoir si on est encore en train de charger les données
    const [loading, setLoading] = useState(true);

    // useEffect : s'exécute automatiquement quand la page s'affiche pour la première fois
    useEffect(() => {
        // Fonction interne pour aller chercher les chiffres dans la base de données
        async function fetchStats() {
            try {
                // On demande à Supabase de compter combien il y a de lignes dans la table 'recipes'
                const { count, error } = await supabase
                    .from('recipes')
                    .select('*', { count: 'exact', head: true });

                if (!error && count !== null) {
                    setStats({ recipes: count }); // On met à jour la mémoire avec le vrai nombre
                }
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false); // On dit que le chargement est terminé, peu importe le résultat
            }
        }
        fetchStats(); // Lancement de la fonction
    }, []); // Les crochets vides [] signifient "ne le fais qu'une seule fois au démarrage"

    // Rendu visuel de la page
    return (
        <div>
            {/* Titre de la page */}
            <h2 className="mb-6 font-bold text-2xl">Aperçu</h2>

            {/* Grille de 3 colonnes pour afficher les KPI (chiffres clés) */}
            <div className="grid grid-cols-3 grid-gap-6 mb-8">
                {/* Carte 1 : Nombre de recettes */}
                <div className="card kpi-card">
                    <div className="kpi-icon-wrapper">
                        <Book size={28} />
                    </div>
                    <div className="kpi-info">
                        <p>Total Recettes</p>
                        <h3>{loading ? '...' : stats.recipes}</h3>
                    </div>
                </div>

                {/* Carte 2 : Utilisateurs actifs (Chiffre simulé pour cet exemple) */}
                <div className="card kpi-card">
                    <div className="kpi-icon-wrapper" style={{ color: 'var(--success)', backgroundColor: 'rgba(5, 205, 153, 0.1)' }}>
                        <Users size={28} />
                    </div>
                    <div className="kpi-info">
                        <p>Utilisateurs Actifs</p>
                        <h3>14</h3>
                    </div>
                </div>

                {/* Carte 3 : Avis & Notes (Chiffre simulé) */}
                <div className="card kpi-card">
                    <div className="kpi-icon-wrapper" style={{ color: 'var(--warning)', backgroundColor: 'rgba(255, 206, 32, 0.1)' }}>
                        <Star size={28} />
                    </div>
                    <div className="kpi-info">
                        <p>Avis & Notes</p>
                        <h3>4.8</h3>
                    </div>
                </div>
            </div>

            {/* Section basse pour l'activité récente (en attente d'implémentation réelle) */}
            <div className="mt-8 card">
                <div className="card-header">
                    <h3 className="card-title">Activité Récente</h3>
                </div>
                <div className="p-6 center-content text-muted">
                    L'historique des modifications apparaîtra ici.
                </div>
            </div>
        </div>
    );
}
