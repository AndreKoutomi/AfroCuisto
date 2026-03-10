const fs = require('fs');
const path = require('path');

const descriptions = {
    'src/App.tsx': "Cœur de l'application mobile. Gère l'interface utilisateur (UI), la navigation entre les onglets (Accueil, Explorer, Favoris, Profil), les animations fluides, l'affichage des détails d'une recette, et l'état global de l'application.",
    'src/dbService.ts': "Service de gestion des données. Agit comme un pont intermédiaire entre l'application (le frontend) et Supabase (la base de données en nuage). Il contient toutes les requêtes (sauvegarde, connexion, déconnexion, récupération de recettes).",
    'src/data.ts': "Base de données locale de secours. Contient une liste de recettes pré-enregistrées en dur dans le code pour garantir que l'application fonctionne même sans connexion internet.",
    'src/aiService.ts': "Service d'Intelligence Artificielle. Se connecte aux API de Google Gemini ou Anthropic Claude pour générer des recommandations culinaires personnalisées et intelligentes aux utilisateurs.",
    'src/translations.ts': "Dictionnaire de langues. Il stocke tous les textes de l'application pour permettre une traduction instantanée (Français, Anglais, Espagnol).",
    'src/components/DishSuggestionForm.tsx': "Composant visuel représentant le formulaire permettant à un utilisateur de suggérer un nouveau plat (nom, ingrédients). Il vérifie les saisies avant envoi.",
    'src/components/FeaturedCarousel.tsx': "Composant affichant le carrousel (les cartes qui défilent horizontalement) des plats mis en vedette.",
    'admin-cms/src/App.tsx': "Point d'entrée de l'interface d'administration. Il vérifie si l'administrateur est connecté. Si oui, il affiche le tableau de bord, sinon il le renvoie sur la page de connexion.",
    'admin-cms/src/components/Sidebar.tsx': "Le menu de navigation latéral de l'espace d'administration pour passer d'une rubrique à l'autre (Recettes, Utilisateurs, Paramètres...).",
    'admin-cms/src/components/RecipeAIWizard.tsx': "L'assistant magique par IA. Permet de générer automatiquement tous les détails complexes d'une recette juste avec le nom du plat.",
    'admin-cms/src/pages/Dashboard.tsx': "Le tableau de bord central. Affiche des statistiques rapides (nombre total de recettes, utilisateurs récents) pour aider l'administrateur.",
    'admin-cms/src/pages/RecipesList.tsx': "La page qui liste toutes les recettes enregistrées dans la base de données sous forme de tableau interactif (recherche, filtre, suppression).",
    'admin-cms/src/pages/RecipeForm.tsx': "Formulaire massif permettant l'ajout ou la modification intégrale d'une recette (image, étapes, ingrédients, temps de cuisson, etc.).",
    'admin-cms/src/pages/Users.tsx': "Le gestionnaire des comptes utilisateurs. Affiche les personnes inscrites sur l'application.",
    'admin-cms/src/pages/Settings.tsx': "Page des paramètres pour personnaliser le comportement global de l'application.",
    'admin-cms/src/pages/Feedback.tsx': "Permet de consulter et lire les commentaires et notes laissées par les utilisateurs sur les différentes recettes.",
    'admin-cms/src/pages/SectionsManager.tsx': "Gère l'organisation dynamique des rubriques de la page d'accueil de l'application (pour les changer sans refaire de mise à jour).",
    'admin-cms/src/pages/SectionForm.tsx': "Permet de créer ou de modifier visuellement une rubrique dynamique de l'accueil (ex: 'Plats épicés', 'Recettes du mois').",
    'admin-cms/src/pages/Transactions.tsx': "Consigne et liste de façon sécurisée les transactions ou les achats liés à l'application.",
    'admin-cms/src/pages/Contributions.tsx': "Vue permettant à l'administrateur de valider ou rejeter les suggestions de plats (contributions) envoyées par les utilisateurs.",
    'admin-cms/src/lib/supabase.ts': "Fichier de configuration de Supabase. Il connecte en toute sécurité le projet admin à la base de données cloud grâce aux clés secrètes.",
    'admin-cms/src/lib/ai.ts': "Connecteur IA pour l'administration. Appelle spécialement les modèles intelligents pour la génération automatique de contenu des recettes."
};

const rootDir = 'd:\\\\AfriHub';

for (const [relPath, desc] of Object.entries(descriptions)) {
    const fullPath = path.join(rootDir, relPath);
    if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (!content.includes('EXPLICATION DU FICHIER')) {
            const commentBlock = `/**
 * ============================================================================
 * EXPLICATION DU FICHIER POUR LES DÉBUTANTS
 * ============================================================================
 * Rôle principal : ${desc}
 * 
 * Conseils de lecture :
 * - Cherchez les mots-clés "function" ou "const" pour voir les actions définies.
 * - Le mot "return" suivi de balises HTML (ex: <div>) indique un élément visuel (Composant React).
 * - "import" en haut signifie qu'on utilise des outils d'autres fichiers pour s'aider.
 * ============================================================================
 */
`;
            fs.writeFileSync(fullPath, commentBlock + '\n' + content);
            console.log('Ajouté à ' + relPath);
        } else {
            console.log('Déjà commenté: ' + relPath);
        }
    } else {
        console.log('Fichier introuvable: ' + relPath);
    }
}
