import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChefHat,
  Clock,
  MapPin,
  ChevronLeft,
  Flame,
  UtensilsCrossed,
  Info,
  BookOpen,
  Home,
  Search,
  Heart,
  User as UserIcon,
  Bell,
  Settings,
  ChevronRight,
  Star,
  Wifi,
  Battery,
  Signal,
  LogOut,
  Mail,
  Lock,
  UserPlus
} from 'lucide-react';
import { recipes } from './data';
import { Recipe, Difficulty, User } from './types';
import { getAIRecipeRecommendation } from './aiService';
import { dbService } from './dbService';

const StatusBar = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-10 px-6 flex justify-between items-center bg-transparent absolute top-0 left-0 right-0 z-[100] pointer-events-none">
      <span className="text-xs font-bold text-stone-800">{time}</span>
      <div className="flex items-center gap-1.5">
        <Signal size={14} className="text-stone-800" />
        <Wifi size={14} className="text-stone-800" />
        <Battery size={14} className="text-stone-800" />
      </div>
    </div>
  );
};

const DifficultyBadge = ({ difficulty }: { difficulty: Difficulty }) => {
  const colors = {
    'Facile': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Moyen': 'bg-amber-100 text-amber-700 border-amber-200',
    'Difficile': 'bg-rose-100 text-rose-700 border-rose-200'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors[difficulty]}`}>
      {difficulty}
    </span>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(dbService.getCurrentUser());
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '' });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [profileSubView, setProfileSubView] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<string>("Chargement de votre suggestion personnalisée...");

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'search', icon: Search, label: 'Explorer' },
    { id: 'favs', icon: Heart, label: 'Favoris' },
    { id: 'profile', icon: UserIcon, label: 'Profil' },
  ];

  // These will be derived from filteredRecipes now

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (searchQuery) {
      result = result.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      result = result.filter(r => r.category === selectedCategory);
    }
    if (selectedRegion) {
      result = result.filter(r => r.region.toLowerCase().includes(selectedRegion.toLowerCase()));
    }
    return result;
  }, [searchQuery, selectedCategory, selectedRegion]);

  useEffect(() => {
    if (currentUser) {
      const fetchAIRecommendation = async () => {
        const recommendation = await getAIRecipeRecommendation(recipes, currentUser.name);
        setAiRecommendation(recommendation);
      };
      fetchAIRecommendation();
    }
  }, [currentUser]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = dbService.getUsers();
    const user = users.find(u => u.email === authFormData.email && u.password === authFormData.password);
    if (user) {
      dbService.setCurrentUser(user);
      setCurrentUser(user);
    } else {
      alert("Email ou mot de passe incorrect");
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: authFormData.name,
      email: authFormData.email,
      password: authFormData.password,
      favorites: [],
      joinedDate: new Date().toLocaleDateString()
    };
    dbService.saveUser(newUser);
    dbService.setCurrentUser(newUser);
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    dbService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveTab('home');
    setSelectedRecipe(null);
  };

  const toggleFavorite = (recipeId: string) => {
    if (!currentUser) return;
    const updatedUser = dbService.toggleFavorite(currentUser.id, recipeId);
    if (updatedUser) setCurrentUser({ ...updatedUser });
  };

  const displayRecipes = filteredRecipes;
  const featuredRecipe = displayRecipes[0] || recipes[0];
  const otherRecipes = displayRecipes.length > 1 ? displayRecipes.slice(1) : (displayRecipes.length === 1 ? [] : recipes.slice(1));

  const renderHome = () => (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 pt-10">
      {/* Header */}
      <header className="p-6 pt-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-800">Bonjour, {currentUser?.name || "Invité"} 👋</h1>
          <p className="text-stone-500 text-sm font-medium">L'application aux 100 saveurs béninoises</p>
        </div>
        <button className="w-10 h-10 bg-white rounded-full shadow-sm border border-stone-100 flex items-center justify-center text-stone-600">
          <Bell size={20} />
        </button>
      </header>

      {/* Featured Recipe */}
      <section className="px-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold text-stone-800">Recette du jour</h2>
          <span className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
            <Settings size={10} className="animate-spin-slow" /> Assistant IA
          </span>
        </div>

        <div className="bg-indigo-600/5 border border-indigo-100 rounded-2xl p-4 mb-4">
          <p className="text-indigo-900 text-xs italic font-medium">
            "{aiRecommendation}"
          </p>
        </div>
        <motion.div
          layoutId={`card-${featuredRecipe.id}`}
          onClick={() => setSelectedRecipe(featuredRecipe)}
          className="relative h-64 rounded-[32px] overflow-hidden shadow-xl cursor-pointer group"
        >
          <motion.img
            layoutId={`image-${featuredRecipe.id}`}
            src={featuredRecipe.image}
            alt={featuredRecipe.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex gap-2 mb-2">
              <DifficultyBadge difficulty={featuredRecipe.difficulty} />
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase border border-white/30">
                Populaire
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{featuredRecipe.name}</h3>
            <div className="flex items-center gap-3 text-white/80 text-xs">
              <span className="flex items-center gap-1"><Clock size={14} /> {featuredRecipe.cookTime}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {featuredRecipe.region}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <div className="px-6 flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-stone-800">Régions</h2>
          <button
            onClick={() => setSelectedRegion(null)}
            className="text-terracotta text-sm font-bold"
          >
            Voir tout
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2">
          {['Sud', 'Centre', 'Nord', 'National'].map((region) => {
            const isActive = selectedRegion === region;
            return (
              <button
                key={region}
                onClick={() => setSelectedRegion(isActive ? null : region)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl border transition-all duration-300 font-bold text-sm shadow-sm
                  ${isActive
                    ? 'bg-terracotta text-white border-terracotta shadow-terracotta/20 scale-105'
                    : 'bg-white text-stone-700 border-stone-100 hover:border-terracotta/30 hover:bg-stone-50'}`}
              >
                {region === 'National' ? 'Tout le Bénin' : region}
              </button>
            );
          })}
        </div>
      </section>

      {/* Popular List */}
      <section className="px-6 mb-12">
        <h2 className="text-lg font-bold text-stone-800 mb-4">
          {selectedRegion ? `Spécialités : ${selectedRegion}` : 'À découvrir'}
        </h2>
        <div className="space-y-4">
          {otherRecipes.length > 0 ? (
            otherRecipes.slice(0, 10).map((recipe) => (
              <motion.div
                key={recipe.id}
                layoutId={`card-${recipe.id}`}
                onClick={() => setSelectedRecipe(recipe)}
                className="flex gap-4 bg-white p-3 rounded-3xl border border-stone-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <motion.img
                    layoutId={`image-${recipe.id}`}
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 py-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-stone-800">{recipe.name}</h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={12} fill="currentColor" />
                      <span className="text-[10px] font-bold">4.8</span>
                    </div>
                  </div>
                  <p className="text-stone-400 text-xs mb-2">{recipe.region}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-stone-500 flex items-center gap-1">
                      <Clock size={12} /> {recipe.cookTime}
                    </span>
                    <DifficultyBadge difficulty={recipe.difficulty} />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-stone-400 italic text-sm">Plus de recettes à venir pour cette zone...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );

  const renderExplorer = () => (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 pt-10">
      <header className="p-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-stone-800">
            {selectedCategory ? selectedCategory : 'Explorer'}
          </h1>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-terracotta text-sm font-bold flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Retour
            </button>
          )}
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une recette, un ingrédient..."
            className="w-full bg-white border border-stone-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 text-sm"
          />
        </div>
      </header>

      {(!selectedCategory && !searchQuery) ? (
        <>
          <section className="mb-10">
            <div className="px-6 flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-stone-800">Catégories</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2">
              {[
                { name: 'Pâtes et Céréales (Wɔ̌)', color: 'bg-rose-500', icon: '🥣' },
                { name: 'Sauces (Nùsúnnú)', color: 'bg-amber-500', icon: '🍲' },
                { name: 'Plats de Résistance & Ragoûts', color: 'bg-emerald-500', icon: '🥘' },
                { name: 'Protéines & Grillades', color: 'bg-violet-500', icon: '🍗' },
                { name: 'Street Food & Snacks (Amuse-bouche)', color: 'bg-blue-500', icon: '🍢' },
                { name: 'Boissons & Douceurs', color: 'bg-orange-500', icon: '🍹' },
                { name: 'Condiments & Accompagnements', color: 'bg-indigo-500', icon: '🌶️' },
              ].map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`${cat.color} flex-shrink-0 min-w-[140px] w-max h-24 rounded-2xl px-6 py-4 relative overflow-hidden cursor-pointer group shadow-md active:scale-95 transition-transform`}
                >
                  <span className="text-white font-bold text-xs relative z-10 leading-tight block whitespace-nowrap">{cat.name}</span>
                  <span className="absolute bottom-1 right-1 text-2xl opacity-30 group-hover:scale-110 transition-transform">{cat.icon}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <div className="px-6 flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-stone-800">Gastronomie Béninoise</h2>
              <span className="bg-terracotta/10 text-terracotta text-[10px] px-2 py-1 rounded-full font-bold uppercase">Patrimoine</span>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar">
              {recipes.filter(r => r.region.toLowerCase().includes('bénin') || r.region.toLowerCase() === 'national').map((recipe) => (
                <motion.div
                  key={recipe.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="flex-shrink-0 w-48 bg-white rounded-[24px] overflow-hidden border border-stone-100 shadow-sm cursor-pointer"
                >
                  <div className="h-32 relative">
                    <img src={recipe.image} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-bold">
                      {recipe.cookTime}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-stone-800 text-sm mb-1 truncate">{recipe.name}</h4>
                    <p className="text-[10px] text-stone-400 mb-2 truncate">{recipe.region}</p>
                    <div className="flex items-center justify-between">
                      <DifficultyBadge difficulty={recipe.difficulty} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(recipe.id);
                        }}
                        className={`p-1.5 rounded-lg transition-all ${currentUser?.favorites.includes(recipe.id) ? 'text-rose-500 bg-rose-50' : 'text-stone-300 bg-stone-50'}`}
                      >
                        <Heart size={16} fill={currentUser?.favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="px-6">
            <h2 className="text-lg font-bold text-stone-800 mb-4">Recommandations</h2>
            <div className="space-y-4">
              {recipes.slice().reverse().map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer"
                >
                  <img src={recipe.image} className="w-16 h-16 rounded-2xl object-cover" />
                  <div>
                    <h4 className="font-bold text-stone-800">{recipe.name}</h4>
                    <p className="text-xs text-stone-400">{recipe.region}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(recipe.id);
                    }}
                    className={`ml-auto p-2 rounded-xl transition-all ${currentUser?.favorites.includes(recipe.id) ? 'text-rose-500 bg-rose-50' : 'text-stone-300 bg-stone-50'}`}
                  >
                    <Heart size={20} fill={currentUser?.favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="px-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-stone-800">
              {searchQuery ? `Résultats pour "${searchQuery}"` : (selectedCategory === 'National' ? 'Spécialités Nationales' : `Plats : ${selectedCategory}`)}
            </h2>
            <span className="text-xs font-bold text-stone-400">{filteredRecipes.length} plats</span>
          </div>

          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <motion.div
                  key={recipe.id}
                  layoutId={`card-${recipe.id}`}
                  onClick={() => setSelectedRecipe(recipe)}
                  className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm cursor-pointer"
                >
                  <div className="h-32 relative">
                    <motion.img
                      layoutId={`image-${recipe.id}`}
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className={`absolute top-2 right-2 p-1.5 rounded-xl backdrop-blur-md transition-all ${currentUser?.favorites.includes(recipe.id) ? 'bg-rose-500 text-white' : 'bg-white/40 text-white'}`}
                    >
                      <Heart size={14} fill={currentUser?.favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-stone-800 text-sm truncate">{recipe.name}</h3>
                    <p className="text-[10px] text-stone-400 mb-2">{recipe.region}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-terracotta">{recipe.cookTime}</span>
                      <DifficultyBadge difficulty={recipe.difficulty} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-stone-400 italic">Aucun plat trouvé...</p>
            </div>
          )}
        </section>
      )}
    </div>
  );

  const renderFavorites = () => {
    const favoriteRecipes = currentUser ? dbService.getFavorites(currentUser, recipes) : [];

    return (
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 pt-10">
        <header className="p-6 pt-8">
          <h1 className="text-2xl font-bold text-stone-800 mb-2">Mis en favoris</h1>
          <p className="text-stone-500 text-sm">{favoriteRecipes.length} recettes sauvegardées</p>
        </header>

        {favoriteRecipes.length > 0 ? (
          <div className="px-6 grid grid-cols-1 gap-4">
            {favoriteRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => setSelectedRecipe(recipe)}
                className="bg-white p-4 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 cursor-pointer"
              >
                <img src={recipe.image} className="w-20 h-20 rounded-2xl object-cover shadow-inner" />
                <div className="flex-1">
                  <h4 className="font-bold text-stone-800">{recipe.name}</h4>
                  <p className="text-xs text-stone-400 mb-2">{recipe.region}</p>
                  <DifficultyBadge difficulty={recipe.difficulty} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(recipe.id);
                  }}
                  className="text-rose-500 bg-rose-50 p-2 rounded-xl"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
              <Heart size={40} />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Aucun favori pour l'instant</h3>
            <p className="text-stone-500 text-sm mb-6">Explorez les recettes et cliquez sur le coeur pour les ajouter ici.</p>
            <button
              onClick={() => setActiveTab('home')}
              className="bg-terracotta text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-terracotta/20"
            >
              Découvrir des recettes
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderProfileSubView = () => {
    if (!profileSubView) return null;

    const views: Record<string, () => React.JSX.Element> = {
      'Informations personnelles': () => (
        <div className="space-y-6">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
            <h3 className="text-xs font-black uppercase text-stone-400 mb-4 tracking-widest">Identité</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase">Nom Complet</label>
                <p className="font-bold text-stone-800 border-b border-stone-100 pb-2">{currentUser?.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase">Adresse Email</label>
                <p className="font-bold text-stone-800 border-b border-stone-100 pb-2">{currentUser?.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase">Membre depuis</label>
                <p className="font-bold text-stone-800">{currentUser?.joinedDate}</p>
              </div>
            </div>
          </div>
          <button className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold font-sm shadow-lg shadow-terracotta/20">
            Modifier mes informations
          </button>
        </div>
      ),
      'Notifications': () => (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
            <Bell size={32} />
          </div>
          <h3 className="font-bold text-stone-800 mb-1">Aucune notification</h3>
          <p className="text-stone-400 text-xs">Nous vous préviendrons dès qu'il y aura du nouveau !</p>
        </div>
      ),
      'Paramètres': () => (
        <div className="space-y-3">
          {[
            'Mode Sombre',
            'Langue (Français)',
            'Unités de mesure',
            'Sécurité du compte',
            'Confidentialité'
          ].map(opt => (
            <div key={opt} className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <span className="font-bold text-stone-700 text-sm">{opt}</span>
              <div className="w-10 h-5 bg-stone-200 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ),
      'À propos d\'AfroCuisto': () => (
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center text-terracotta mx-auto mb-4">
              <ChefHat size={32} />
            </div>
            <h2 className="text-xl font-black text-stone-800">AfroCuisto v1.0.4</h2>
            <p className="text-stone-400 text-xs">Made with ❤️ in Benin</p>
          </div>
          <p className="text-stone-600 text-sm leading-relaxed text-center italic">
            "AfroCuisto est bien plus qu'une application de cuisine. C'est un hommage vivant au patrimoine culinaire du Bénin, conçu pour préserver et partager nos saveurs ancestrales dans le monde moderne."
          </p>
          <div className="bg-stone-50 p-4 rounded-2xl text-xs text-stone-500 space-y-2">
            <div className="flex justify-between"><span>Conditions d'utilisation</span><ChevronRight size={14} /></div>
            <div className="flex justify-between"><span>Politique de confidentialité</span><ChevronRight size={14} /></div>
          </div>
        </div>
      )
    };

    return (
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        className="absolute inset-0 z-[60] bg-white flex flex-col p-6 pt-10"
      >
        <header className="flex items-center gap-4 mb-8 pt-8">
          <button onClick={() => setProfileSubView(null)} className="p-2 bg-stone-50 rounded-xl text-stone-600">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-stone-800">{profileSubView}</h2>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {views[profileSubView]?.()}
        </div>
      </motion.div>
    );
  };

  const renderProfile = () => (
    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-24 pt-10 relative">
      <AnimatePresence>
        {profileSubView && renderProfileSubView()}
      </AnimatePresence>

      <header className="p-6 pt-8 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 relative group">
          <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} alt="Profile" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <span className="text-[10px] text-white font-bold uppercase">Modifier</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-stone-800">{currentUser?.name}</h1>
        <p className="text-stone-500 text-sm font-medium mb-4">{currentUser?.email}</p>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-stone-100">
            <span className="block text-lg font-bold text-stone-800">{currentUser?.favorites.length}</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Favoris</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-stone-100">
            <span className="block text-lg font-bold text-stone-800">1</span>
            <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Compte</span>
          </div>
        </div>
      </header>

      <section className="px-6 space-y-3">
        {[
          { icon: UserIcon, label: 'Informations personnelles' },
          { icon: Bell, label: 'Notifications' },
          { icon: Settings, label: 'Paramètres' },
          { icon: Info, label: 'À propos d\'AfroCuisto' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setProfileSubView(item.label)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-3xl border border-stone-100 shadow-sm hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600">
                <item.icon size={20} />
              </div>
              <span className="font-bold text-stone-700 text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-stone-300" />
          </button>
        ))}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-rose-50 rounded-3xl border border-rose-100 shadow-sm hover:bg-rose-100 transition-colors mt-8"
        >
          <div className="flex items-center gap-3 text-rose-600">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <span className="font-bold text-sm">Déconnexion</span>
          </div>
        </button>
      </section>
    </div>
  );

  const renderDetail = () => {
    if (!selectedRecipe) return null;
    return (
      <motion.div
        key="detail"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100) setSelectedRecipe(null);
        }}
        className="absolute inset-x-0 top-0 bottom-[80px] z-[100] flex flex-col bg-white overflow-y-auto no-scrollbar"
      >
        {/* Detail Header / Image */}
        <div className="relative h-[40vh] flex-shrink-0">
          <motion.img
            layoutId={`image-${selectedRecipe.id}`}
            src={selectedRecipe.image}
            alt={selectedRecipe.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

          <button
            onClick={() => setSelectedRecipe(null)}
            className="absolute top-12 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 hover:bg-white/40 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => toggleFavorite(selectedRecipe.id)}
            className={`absolute top-12 right-6 w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center border transition-all ${currentUser?.favorites.includes(selectedRecipe.id) ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white/20 border-white/30 text-white'}`}
          >
            <Heart size={20} fill={currentUser?.favorites.includes(selectedRecipe.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 -mt-8 bg-white rounded-t-[32px] p-6 shadow-2xl relative z-10"
        >
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-stone-800 leading-tight">{selectedRecipe.name}</h1>
            <div className="flex-shrink-0">
              <DifficultyBadge difficulty={selectedRecipe.difficulty} />
            </div>
          </div>

          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-1 text-sage font-bold text-sm">
              <MapPin size={16} />
              <span>{selectedRecipe.region}</span>
            </div>
            {selectedRecipe.alias && (
              <span className="text-xs text-stone-400 italic">Également connu sous le nom de : {selectedRecipe.alias}</span>
            )}
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-stone-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
              <Clock size={18} className="text-terracotta" />
              <span className="text-[10px] uppercase font-bold text-stone-400">Prép</span>
              <span className="text-sm font-bold text-stone-700">{selectedRecipe.prepTime}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
              <Flame size={18} className="text-terracotta" />
              <span className="text-[10px] uppercase font-bold text-stone-400">Cuisson</span>
              <span className="text-sm font-bold text-stone-700">{selectedRecipe.cookTime}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-2xl flex flex-col items-center justify-center gap-1">
              <UtensilsCrossed size={18} className="text-terracotta" />
              <span className="text-[10px] uppercase font-bold text-stone-400">Difficulté</span>
              <span className="text-sm font-bold text-stone-700">{selectedRecipe.difficulty}</span>
            </div>
          </div>

          {/* Ingredients */}
          {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={20} className="text-terracotta" />
                <h3 className="text-lg font-bold text-stone-800">Ingrédients</h3>
              </div>
              <ul className="space-y-3">
                {selectedRecipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex justify-between items-center p-3 bg-stone-50/50 rounded-xl border border-stone-100">
                    <span className="text-stone-700 font-medium">{ing.item}</span>
                    <span className="text-terracotta font-bold text-sm">{ing.amount}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Preparation Steps */}
          {selectedRecipe.steps && selectedRecipe.steps.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-6">
                <ChefHat size={20} className="text-terracotta" />
                <h3 className="text-lg font-bold text-stone-800">Préparation</h3>
              </div>
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-stone-100">
                {selectedRecipe.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-10">
                    <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-white border-2 border-terracotta flex items-center justify-center z-10 shadow-sm">
                      <span className="text-[10px] font-bold text-terracotta">{idx + 1}</span>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {/* Diaspora & Sides Info */}
          {(selectedRecipe.diasporaSubstitutes || selectedRecipe.suggestedSides) && (
            <section className="mb-12 grid grid-cols-1 gap-4">
              {selectedRecipe.diasporaSubstitutes && (
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Info size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">💡 Astuce Diaspora</h4>
                    <p className="text-stone-600 text-xs leading-relaxed">{selectedRecipe.diasporaSubstitutes}</p>
                  </div>
                </div>
              )}
              {selectedRecipe.suggestedSides && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">🍽️ Accompagnements</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecipe.suggestedSides.map(side => (
                        <span key={side} className="px-2 py-1 bg-white border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-700">
                          {side}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Benefits & Pedagogical Note */}
          {(selectedRecipe.benefits || selectedRecipe.pedagogicalNote) && (
            <section className="mb-12 grid grid-cols-1 gap-4">
              {selectedRecipe.benefits && (
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Star size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">✨ Bienfaits Nutritionnels</h4>
                    <p className="text-stone-600 text-xs leading-relaxed">{selectedRecipe.benefits}</p>
                  </div>
                </div>
              )}
              {selectedRecipe.pedagogicalNote && (
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} className="text-stone-600" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-600 mb-1">📖 Note Pédagogique</h4>
                    <p className="text-stone-600 text-xs leading-relaxed italic">{selectedRecipe.pedagogicalNote}</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Technique Section (Chef's Tip) */}
          {selectedRecipe.techniqueTitle && selectedRecipe.techniqueDescription && (
            <section className="bg-amber-50/50 rounded-3xl p-6 border border-amber-100 mb-12">
              <div className="flex items-center gap-2 mb-3">
                <Info size={20} className="text-amber-600" />
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">Le Secret du Chef</h3>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-stone-800 text-sm">{selectedRecipe.techniqueTitle.split(':').pop()?.trim()}</h4>
                <p className="text-stone-600 text-xs leading-relaxed italic opacity-80">
                  "{selectedRecipe.techniqueDescription}"
                </p>
              </div>
            </section>
          )}
        </motion.div>
      </motion.div>
    );
  };

  const renderAuth = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col bg-white p-8 justify-center h-full"
    >
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-terracotta/10 rounded-3xl flex items-center justify-center text-terracotta mx-auto mb-4">
          <ChefHat size={40} />
        </div>
        <h1 className="text-3xl font-black text-stone-800 mb-2">AfroCuisto</h1>
        <p className="text-stone-500 font-medium">L'âme de la cuisine béninoise</p>
      </div>

      <div className="bg-stone-50 p-1 rounded-2xl flex mb-8">
        <button
          onClick={() => setAuthMode('login')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'login' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
        >
          Connexion
        </button>
        <button
          onClick={() => setAuthMode('signup')}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${authMode === 'signup' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400'}`}
        >
          Inscription
        </button>
      </div>

      <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
        {authMode === 'signup' && (
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Nom complet"
              required
              value={authFormData.name}
              onChange={e => setAuthFormData({ ...authFormData, name: e.target.value })}
              className="w-full bg-white border border-stone-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium"
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="email"
            placeholder="Email"
            required
            value={authFormData.email}
            onChange={e => setAuthFormData({ ...authFormData, email: e.target.value })}
            className="w-full bg-white border border-stone-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
          <input
            type="password"
            placeholder="Mot de passe"
            required
            value={authFormData.password}
            onChange={e => setAuthFormData({ ...authFormData, password: e.target.value })}
            className="w-full bg-white border border-stone-100 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold shadow-lg shadow-terracotta/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {authMode === 'login' ? <Home size={20} /> : <UserPlus size={20} />}
          {authMode === 'login' ? 'Se connecter' : "Créer mon compte"}
        </button>
      </form>
    </motion.div>
  );

  const currentContent = useMemo(() => {
    if (!currentUser) return renderAuth();
    switch (activeTab) {
      case 'home': return renderHome();
      case 'search': return renderExplorer();
      case 'favs': return renderFavorites();
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  }, [activeTab, selectedRecipe, currentUser, profileSubView, authMode, authFormData, searchQuery, selectedCategory, selectedRegion, aiRecommendation]);

  return (
    <div className="h-screen bg-stone-50 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col">
      <StatusBar />

      <AnimatePresence mode="wait">
        {currentContent}
      </AnimatePresence>

      <AnimatePresence>
        {selectedRecipe && renderDetail()}
      </AnimatePresence>

      {/* Bottom Navigation - Persistent */}
      {currentUser && (
        <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-100 px-6 py-4 flex justify-between items-center z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedRecipe(null);
                  setProfileSubView(null);
                  setActiveTab(item.id);
                }}
                className="flex flex-col items-center gap-1 relative"
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'text-terracotta bg-terracotta/10' : 'text-stone-400'}`}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-terracotta' : 'text-stone-400'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-1 w-1 h-1 bg-terracotta rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
