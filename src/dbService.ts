import { User, Recipe } from './types';

const USERS_KEY = 'afrocuisto_users';
const CURRENT_USER_KEY = 'afrocuisto_current_user';

export const dbService = {
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
    }
};
