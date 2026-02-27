import { User, Recipe } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const USERS_KEY = 'afrocuisto_users';
const CURRENT_USER_KEY = 'afrocuisto_current_user';
const REMOTE_RECIPES_KEY = 'afrocuisto_remote_recipes';

export const dbService = {
    // Recipe Sync
    async getRemoteRecipes(): Promise<Recipe[]> {
        try {
            const { data, error } = await supabase
                .from('recipes')
                .select('*')
                .order('name');

            if (error) throw error;

            if (data) {
                const recipes: Recipe[] = data.map(r => ({
                    id: r.id,
                    name: r.name,
                    alias: r.alias,
                    base: r.base,
                    type: r.type,
                    style: r.style,
                    region: r.region,
                    category: r.category,
                    difficulty: r.difficulty,
                    prepTime: r.prep_time,
                    cookTime: r.cook_time,
                    image: r.image,
                    description: r.description,
                    ingredients: r.ingredients,
                    steps: r.steps,
                    techniqueTitle: r.technique_title,
                    techniqueDescription: r.technique_description,
                    benefits: r.benefits
                }));
                // Cache locally for offline use
                localStorage.setItem(REMOTE_RECIPES_KEY, JSON.stringify(recipes));
                return recipes;
            }
        } catch (err) {
            console.error('Remote sync error:', err);
        }

        // Fallback to local storage if offline/error
        const cached = localStorage.getItem(REMOTE_RECIPES_KEY);
        return cached ? JSON.parse(cached) : [];
    },
    // User Management
    getUsers: (): User[] => {
        const data = localStorage.getItem(USERS_KEY);
        return data ? JSON.parse(data) : [];
    },

    saveUser: (user: User) => {
        const users = dbService.getUsers();
        const index = users.findIndex(u => u.id === user.id || u.email === user.email);
        if (index > -1) {
            users[index] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    getCurrentUser: (): User | null => {
        const data = localStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    setCurrentUser: (user: User | null) => {
        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            dbService.saveUser(user); // Ensure global list is updated
        } else {
            localStorage.removeItem(CURRENT_USER_KEY);
        }
    },

    // Favorites Management
    toggleFavorite: (userId: string, recipeId: string): User | null => {
        const users = dbService.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return null;

        const favIndex = user.favorites.indexOf(recipeId);
        if (favIndex > -1) {
            user.favorites.splice(favIndex, 1);
        } else {
            user.favorites.push(recipeId);
        }

        dbService.saveUser(user);
        const currentUser = dbService.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            dbService.setCurrentUser(user);
        }
        return user;
    },

    // Dynamic Querying (Simulation)
    getFavorites: (user: User, allRecipes: Recipe[]): Recipe[] => {
        return allRecipes.filter(r => user.favorites.includes(r.id));
    },

    updateAvatar: (userId: string, avatarData: string): User | null => {
        const users = dbService.getUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return null;

        user.avatar = avatarData;
        dbService.saveUser(user);

        const currentUser = dbService.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            dbService.setCurrentUser(user);
        }
        return user;
    }
};
