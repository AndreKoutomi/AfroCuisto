export type Difficulty = 'Très Facile' | 'Facile' | 'Intermédiaire' | 'Moyen' | 'Difficile' | 'Très Difficile' | 'Extrême' | 'N/A';
export type Category =
  | 'Pâtes et Céréales (Wɔ̌)'
  | 'Sauces (Nùsúnnú)'
  | 'Plats de Résistance & Ragoûts'
  | 'Protéines & Grillades'
  | 'Street Food & Snacks (Amuse-bouche)'
  | 'Boissons & Douceurs'
  | 'Condiments & Accompagnements'
  | 'National';

export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  alias?: string;
  region: string;
  category: string; // Made generic to support the 100 items easily
  difficulty: Difficulty;
  prepTime: string;
  cookTime: string;
  image: string;
  ingredients?: Ingredient[];
  techniqueTitle?: string;
  techniqueDescription?: string;
  description?: string;
  steps?: string[];
  diasporaSubstitutes?: string;
  suggestedSides?: string[];
  benefits?: string;
  pedagogicalNote?: string;
  type?: string;
  base?: string;
  style?: string;
  origine_humaine?: string; // Avoiding collision with 'origine' if used as region
  videoUrl?: string;
}
export interface UserSettings {
  darkMode: boolean;
  language: 'fr' | 'en' | 'es';
  unitSystem: 'metric' | 'imperial';
}

export interface ShoppingItem {
  id: string;
  item: string;
  amount: string;
  isPurchased: boolean;
  recipeName?: string;
  recipeId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  favorites: string[]; // List of recipe IDs
  shoppingList: ShoppingItem[];
  joinedDate: string;
  settings?: UserSettings;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
