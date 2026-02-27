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
  ChevronDown,
  Star,
  Wifi,
  Battery,
  Signal,
  LogOut,
  Mail,
  Lock,
  UserPlus,
  Moon,
  Sun,
  Globe,
  Ruler,
  ShieldCheck,
  Eye,
  Key,
  CheckCircle2
} from 'lucide-react';
import { recipes } from './data';
import { Recipe, Difficulty, User, UserSettings } from './types';
import { getAIRecipeRecommendation } from './aiService';
import { dbService } from './dbService';
import { translations, LanguageCode } from './translations';
import { App as CapacitorApp } from '@capacitor/app';

// --- Sub-Components & Helpers ---

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

// --- Deep Views ---

const AccountSecurityView = ({ currentUser, setCurrentUser, t, securitySubView, setSecuritySubView, goBack }: any) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ current: '', new: '', confirm: '', email: currentUser?.email || '' });

  const handleSave = () => {
    if (!currentUser) return;

    if (securitySubView === 'password') {
      if (!formData.new || formData.new !== formData.confirm) {
        alert("Les mots de passe ne correspondent pas");
        return;
      }
      if (formData.current !== currentUser.password) {
        alert("Mot de passe actuel incorrect");
        return;
      }
      const updatedUser = { ...currentUser, password: formData.new };
      setCurrentUser(updatedUser);
      dbService.setCurrentUser(updatedUser);
    } else if (securitySubView === 'email') {
      if (!formData.email || !formData.email.includes('@')) {
        alert("Email invalide");
        return;
      }
      const updatedUser = { ...currentUser, email: formData.email };
      setCurrentUser(updatedUser);
      dbService.setCurrentUser(updatedUser);
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSecuritySubView('main');
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4 animate-bounce">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="font-bold text-stone-800">{t.save} !</h3>
        <p className="text-stone-400 text-xs">Vos modifications ont été enregistrées avec succès.</p>
      </div>
    );
  }

  switch (securitySubView) {
    case 'password':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
            <h3 className="text-[10px] font-black uppercase text-stone-400 mb-4">{t.changePassword}</h3>
            <div className="space-y-4">
              <input
                type="password"
                placeholder={t.currentPassword}
                className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                value={formData.current}
                onChange={e => setFormData({ ...formData, current: e.target.value })}
              />
              <input
                type="password"
                placeholder={t.newPassword}
                className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                value={formData.new}
                onChange={e => setFormData({ ...formData, new: e.target.value })}
              />
              <input
                type="password"
                placeholder={t.confirmPassword}
                className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                value={formData.confirm}
                onChange={e => setFormData({ ...formData, confirm: e.target.value })}
              />
            </div>
            <p className="mt-4 text-[10px] text-stone-400 italic">{t.passwordSecurityNote}</p>
          </div>
          <button onClick={handleSave} className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-terracotta/20">{t.save}</button>
          <button onClick={() => setSecuritySubView('main')} className="w-full text-stone-400 py-2 font-bold text-sm">{t.back}</button>
        </motion.div>
      );
    case 'email':
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
            <h3 className="text-[10px] font-black uppercase text-stone-400 mb-4">{t.changeEmail}</h3>
            <div className="space-y-4">
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
              />
              <div className="relative">
                <input type="text" placeholder={t.authCode} className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                <button className="absolute right-2 top-1.5 px-3 py-1.5 bg-stone-100 rounded-lg text-[10px] font-bold text-stone-500 uppercase">Envoyer</button>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-stone-400 italic">{t.authCodeDesc}</p>
          </div>
          <button onClick={handleSave} className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-terracotta/20">{t.save}</button>
          <button onClick={() => setSecuritySubView('main')} className="w-full text-stone-400 py-2 font-bold text-sm">{t.back}</button>
        </motion.div>
      );
    default:
      return (
        <div className="space-y-3">
          <button onClick={() => setSecuritySubView('password')} className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 active:bg-stone-100 transition-colors">
            <div className="flex items-center gap-3">
              <Key size={18} className="text-stone-500" />
              <span className="font-bold text-stone-700 text-sm">{t.changePassword}</span>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </button>
          <button onClick={() => setSecuritySubView('email')} className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 active:bg-stone-100 transition-colors">
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-stone-500" />
              <span className="font-bold text-stone-700 text-sm">{t.changeEmail}</span>
            </div>
            <ChevronRight size={16} className="text-stone-400" />
          </button>
        </div>
      );
  }
};

const ProfileSubViewRenderer = ({ profileSubView, setProfileSubView, currentUser, setCurrentUser, t, securitySubView, setSecuritySubView, goBack, updateSettings, handleLogout, settings, handleSaveSettings }: any) => {
  const views: Record<string, () => React.JSX.Element> = {
    'Informations personnelles': () => (
      <div className="space-y-6">
        <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
          <h3 className="text-xs font-black uppercase text-stone-400 mb-4 tracking-widest">{t.identity}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">{t.fullName}</label>
              <p className="font-bold text-stone-800 border-b border-stone-100 pb-2">{currentUser?.name}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">{t.emailAddr}</label>
              <p className="font-bold text-stone-800 border-b border-stone-100 pb-2">{currentUser?.email}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase">{t.memberSince}</label>
              <p className="font-bold text-stone-800">{currentUser?.joinedDate}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => alert("Fonctionnalité d'édition bientôt disponible")}
          className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold font-sm shadow-lg shadow-terracotta/20 active:scale-95 transition-transform"
        >
          {t.edit} {t.personalInfo.toLowerCase()}
        </button>
      </div>
    ),
    'Notifications': () => (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-stone-50 rounded-3xl border border-stone-100">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
          <Bell size={32} />
        </div>
        <h3 className="font-bold text-stone-800 mb-1">{t.noNotifications}</h3>
        <p className="text-stone-400 text-xs">{t.notificationDesc}</p>
      </div>
    ),
    'Paramètres': () => (
      <div className="space-y-3">
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Globe size={18} />
            </div>
            <span className="font-bold text-stone-700 text-sm">{t.language}</span>
          </div>
          <div className="flex gap-2">
            {(['fr', 'en', 'es'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => updateSettings({ language: lang })}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${settings.language === lang ? 'bg-terracotta text-white border-terracotta' : 'bg-white text-stone-500 border-stone-100'}`}
              >
                {lang === 'fr' ? 'FR' : lang === 'en' ? 'EN' : 'ES'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Ruler size={18} />
            </div>
            <span className="font-bold text-stone-700 text-sm">{t.units}</span>
          </div>
          <button
            onClick={() => updateSettings({ unitSystem: settings.unitSystem === 'metric' ? 'imperial' : 'metric' })}
            className="px-3 py-1.5 bg-white border border-stone-100 rounded-xl text-[10px] font-black uppercase text-terracotta font-bold"
          >
            {settings.unitSystem === 'metric' ? t.metric.split(' ')[0] : t.imperial.split(' ')[0]}
          </button>
        </div>
        <button
          onClick={() => {
            setProfileSubView('Sécurité du compte');
            setSecuritySubView('main');
          }}
          className="w-full flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100 active:bg-stone-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ShieldCheck size={18} />
            </div>
            <span className="font-bold text-stone-700 text-sm">{t.security}</span>
          </div>
          <ChevronRight size={16} className="text-stone-400" />
        </button>
        <button
          onClick={handleSaveSettings}
          className="w-full mt-6 bg-terracotta text-white py-4 rounded-2xl font-bold font-sm shadow-lg shadow-terracotta/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} />
          {t.save} {t.settings.toLowerCase()}
        </button>
      </div>
    ),
    'Sécurité du compte': () => (
      <AccountSecurityView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        t={t}
        securitySubView={securitySubView}
        setSecuritySubView={setSecuritySubView}
        goBack={goBack}
      />
    ),
    'Confidentialité': () => (
      <div className="space-y-6">
        <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
          <h3 className="text-[10px] font-black uppercase text-stone-400 mb-6">{t.privacyMenu}</h3>
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="pr-4">
                <h4 className="text-sm font-bold text-stone-700 mb-1">{t.tracking}</h4>
                <p className="text-[10px] text-stone-400 leading-relaxed">{t.trackingDesc}</p>
              </div>
              <div className="w-10 h-5 bg-terracotta rounded-full relative flex-shrink-0">
                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full border border-rose-100 bg-rose-50 text-rose-500 py-4 rounded-2xl font-bold text-sm">
          {t.deleteAccount}
        </button>
      </div>
    ),
    'À propos d\'AfroCuisto': () => (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center text-terracotta mx-auto mb-4">
          <ChefHat size={32} />
        </div>
        <h2 className="text-xl font-black text-stone-800">AfroCuisto v1.0.5</h2>
        <p className="text-stone-600 text-sm leading-relaxed italic">
          "Un hommage vivant au patrimoine culinaire du Bénin."
        </p>
      </div>
    )
  };

  return views[profileSubView] ? views[profileSubView]() : null;
};

// --- Main Application ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(dbService.getCurrentUser());
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '' });

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState<string[]>(['home']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [profileSubView, setProfileSubView] = useState<string | null>(null);
  const [securitySubView, setSecuritySubView] = useState<'main' | 'password' | 'email' | 'validation'>('main');
  const [aiRecommendation, setAiRecommendation] = useState<string>("Chargement de votre suggestion personnalisée...");

  // Navigation Logic
  const navigateTo = (tab: string) => {
    if (tab === activeTab) return;
    setHistory(prev => [...prev, tab]);
    setActiveTab(tab);
    setSelectedRecipe(null);
    setProfileSubView(null);
    setSecuritySubView('main');
  };

  const goBack = () => {
    if (selectedRecipe) {
      setSelectedRecipe(null);
      return;
    }
    if (profileSubView === 'Sécurité du compte' && securitySubView !== 'main') {
      setSecuritySubView('main');
      return;
    }
    if (profileSubView) {
      setProfileSubView(null);
      return;
    }
    if (selectedCategory || selectedRegion || searchQuery) {
      setSelectedCategory(null);
      setSelectedRegion(null);
      setSearchQuery('');
      return;
    }
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevTab = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setActiveTab(prevTab);
      return;
    }
    CapacitorApp.exitApp();
  };

  useEffect(() => {
    const handleBackButton = () => {
      goBack();
    };
    const listener = CapacitorApp.addListener('backButton', handleBackButton);
    return () => { listener.then(l => l.remove()); };
  }, [selectedRecipe, profileSubView, selectedCategory, selectedRegion, searchQuery, history, securitySubView]);

  const settings = currentUser?.settings || { darkMode: false, language: 'fr', unitSystem: 'metric' };
  const t = translations[settings.language as LanguageCode] || translations.fr;

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        settings: { ...(currentUser.settings || { darkMode: false, language: 'fr', unitSystem: 'metric' }), ...newSettings }
      };
      setCurrentUser(updatedUser);
      dbService.setCurrentUser(updatedUser);
    }
  };

  const handleSaveSettings = () => {
    if (currentUser) {
      dbService.setCurrentUser(currentUser);
      alert("Paramètres enregistrés !");
    }
  };

  const handleLogout = () => {
    dbService.setCurrentUser(null);
    setCurrentUser(null);
    setActiveTab('home');
    setHistory(['home']);
    setSelectedRecipe(null);
  };

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
      joinedDate: new Date().toLocaleDateString(),
      settings: { darkMode: false, language: 'fr', unitSystem: 'metric' }
    };
    dbService.saveUser(newUser);
    dbService.setCurrentUser(newUser);
    setCurrentUser(newUser);
  };

  const toggleFavorite = (recipeId: string) => {
    if (!currentUser) return;
    const updatedUser = dbService.toggleFavorite(currentUser.id, recipeId);
    if (updatedUser) setCurrentUser({ ...updatedUser });
  };

  useEffect(() => {
    if (currentUser) {
      getAIRecipeRecommendation(recipes, currentUser.name).then(setAiRecommendation);
    }
  }, [currentUser]);

  const filteredRecipes = useMemo(() => {
    let result = recipes;
    if (searchQuery) {
      result = result.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) result = result.filter(r => r.category === selectedCategory);
    if (selectedRegion) result = result.filter(r => r.region.toLowerCase().includes(selectedRegion.toLowerCase()));
    return result;
  }, [searchQuery, selectedCategory, selectedRegion]);

  const displayRecipes = filteredRecipes;
  const featuredRecipe = displayRecipes[0] || recipes[0];
  const otherRecipes = displayRecipes.length > 1 ? displayRecipes.slice(1) : (displayRecipes.length === 1 ? [] : recipes.slice(1));

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'search', icon: Search, label: 'Explorer' },
    { id: 'favs', icon: Heart, label: 'Favoris' },
    { id: 'profile', icon: UserIcon, label: 'Profil' },
  ];

  // --- Sub-Renderers (extracted for clarity) ---

  const renderHome = () => (
    <div className="flex-1 flex flex-col pb-44">
      {/* Sticky Top Header */}
      <header className="px-6 pt-14 pb-6 bg-white/90 backdrop-blur-2xl sticky top-0 z-50 border-b border-stone-100/50 shadow-sm flex items-center gap-3">
        <img src="/images/chef_icon.png" className="w-10 h-10 object-contain" alt="AfroCuisto Logo" />
        <div className="flex flex-col">
          <span className="text-sm font-black text-[#fb5607] uppercase tracking-widest flex items-center gap-1 mb-1">
            Bonjour, {currentUser?.name?.split(' ')[0]} 👋
          </span>
          <h1 className="text-sm font-bold text-stone-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis z-10">L'âme de la cuisine béninoise</h1>
        </div>
      </header>

      {/* Global Search Bar */}
      <section className="px-6 mb-6 mt-2">
        <div className="flex gap-2">
          <div className="relative flex-1 group shadow-sm rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-terracotta transition-colors" size={20} />
            <input
              type="text"
              placeholder="Chercher un plat, une envie..."
              onClick={() => setActiveTab('search')}
              readOnly
              className="w-full bg-stone-100/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:bg-white transition-all shadow-inner"
            />
          </div>
        </div>
      </section>

      {/* Categories Horizontal Pills */}
      <section className="mb-8 pl-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pr-6">
          {[
            { name: 'Pâtes et Céréales (Wɔ̌)', short: 'Pâtes', icon: '🥣' },
            { name: 'Sauces (Nùsúnnú)', short: 'Sauces', icon: '🍲' },
            { name: 'Protéines & Grillades', short: 'Grillades', icon: '🍗' },
            { name: 'Boissons & Douceurs', short: 'Boissons', icon: '🍹' },
          ].map((cat, i) => (
            <motion.div
              key={cat.short}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setSelectedCategory(cat.name); setActiveTab('search'); }}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl cursor-pointer shadow-sm border transition-all ${selectedCategory === cat.name ? 'bg-terracotta text-white border-terracotta shadow-terracotta/20' : 'bg-white text-stone-700 border-stone-100/80 hover:bg-stone-50'}`}
            >
              <span className="text-base">{cat.icon}</span>
              <span className="font-bold text-xs">{cat.short}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Hero: "Sélection de Chef" (Glassmorphic) */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-black text-stone-800 tracking-tight">Sélection du Chef</h2>
          <span className="text-terracotta text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform" onClick={() => setActiveTab('search')}>Voir tout <ChevronRight size={14} /></span>
        </div>

        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setSelectedRecipe(featuredRecipe)}
          className="relative h-72 rounded-[32px] overflow-hidden shadow-2xl shadow-stone-200 cursor-pointer group"
        >
          <img src={featuredRecipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(featuredRecipe.id); }}
              className={`p-2.5 backdrop-blur-md border rounded-full transition-all ${currentUser?.favorites.includes(featuredRecipe.id) ? 'bg-white text-rose-500 border-white shadow-lg' : 'bg-white/30 text-white border-white/40 hover:bg-white/50'}`}
            >
              <Heart size={18} fill={currentUser?.favorites.includes(featuredRecipe.id) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Glassmorphic Info Panel */}
          <div className="absolute bottom-3 left-3 right-3 bg-white/50 backdrop-blur-xl border border-white/40 p-4 rounded-[24px] shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-black font-black text-xl w-3/4 leading-tight">{featuredRecipe.name}</h3>
              <span className="bg-white text-stone-900 text-[10px] px-2.5 py-1.5 rounded-[10px] font-black shadow-sm">{featuredRecipe.cookTime}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-[#fb5607] font-black"><Star size={12} fill="currentColor" /> 4.9 (120+)</span>
              <span className="mx-1 text-black/40">•</span>
              <span className="flex items-center gap-1 text-black"><MapPin size={12} /> {featuredRecipe.region}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trending Recipes List */}
      <section className="px-6 mb-10">
        <h2 className="text-xl font-black text-stone-800 mb-5 tracking-tight">Tendances actuelles</h2>
        <div className="space-y-5">
          {otherRecipes.slice(0, 5).map(recipe => (
            <motion.div
              key={recipe.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white rounded-[28px] overflow-hidden border border-stone-100/80 shadow-sm cursor-pointer group hover:shadow-xl hover:shadow-stone-200/50 transition-shadow"
            >
              <div className="h-44 relative">
                <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-[12px] flex items-center gap-1.5 shadow-sm">
                  <Clock size={12} className="text-terracotta" /> <span className="text-xs font-black text-stone-800">{recipe.prepTime}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                  className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md w-9 h-9 rounded-full flex items-center justify-center shadow-md text-stone-400 hover:text-rose-500 transition-colors"
                >
                  <Heart size={18} fill={currentUser?.favorites.includes(recipe.id) ? 'currentColor' : 'none'} className={currentUser?.favorites.includes(recipe.id) ? 'text-rose-500' : ''} />
                </button>
              </div>
              <div className="p-4 pt-3">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-stone-800 text-lg leading-tight w-3/4 truncate">{recipe.name}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold bg-stone-50 border border-stone-100 px-2 py-1 rounded-[10px] h-fit">
                    <Star size={12} className="text-amber-500" fill="currentColor" /> 4.8
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 mb-3 font-medium flex items-center gap-1.5"><MapPin size={10} className="text-stone-400" /> {recipe.region}</p>
                <div className="flex items-center gap-2">
                  <DifficultyBadge difficulty={recipe.difficulty} />
                  <span className="text-[9px] bg-stone-100 text-stone-600 font-bold px-2 py-1 rounded-md border border-stone-200 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {recipe.cookTime}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderExplorer = () => (
    <div className="flex-1 flex flex-col pb-44">
      {/* Immersive Search Header */}
      <header className="px-6 pt-14 pb-6 bg-white/90 backdrop-blur-2xl sticky top-0 z-40 border-b border-stone-100/50 shadow-sm">
        <h1 className="text-3xl font-black text-stone-900 mb-6 drop-shadow-sm">{selectedCategory || 'Explorer'}</h1>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-terracotta transition-colors" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher un plat, une région..."
            className="w-full bg-white border border-stone-100/80 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30 transition-all font-medium"
          />
        </div>
      </header>

      {/* Dynamic Content Area */}
      {searchQuery || selectedCategory ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-6 pt-6 grid grid-cols-2 gap-4">
          {displayRecipes.map(recipe => (
            <motion.div
              key={recipe.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm shadow-stone-200/50 flex flex-col h-full cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="h-32 relative flex-shrink-0">
                <img src={recipe.image} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-black tracking-widest">
                  {recipe.cookTime}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-stone-800 text-sm leading-tight line-clamp-2 mb-1">{recipe.name}</h4>
                <p className="text-[10px] text-stone-400 mb-2 font-medium flex items-center gap-1"><MapPin size={10} /> {recipe.region}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-stone-50">
                  <DifficultyBadge difficulty={recipe.difficulty} />
                </div>
              </div>
            </motion.div>
          ))}
          {displayRecipes.length === 0 && (
            <div className="col-span-2 py-20 text-center text-stone-400 font-medium">Aucun résultat trouvé.</div>
          )}
        </motion.div>
      ) : (
        <div className="pt-2 space-y-12 pb-10">

          {/* Hero Section: Discovery of the day */}
          <section className="px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative h-72 rounded-[32px] overflow-hidden shadow-2xl shadow-stone-300/50 cursor-pointer group"
              onClick={() => setSelectedRecipe(recipes[Math.floor(Math.random() * recipes.length)])}
            >
              <img src="https://picsum.photos/seed/culinary/800/600" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="absolute top-4 left-4">
                <span className="bg-terracotta text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                  <Flame size={12} /> Découverte du jour
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-3xl font-black text-white mb-2 leading-tight">L'Art du Pilon</h2>
                <p className="text-white/80 text-sm font-medium leading-relaxed mb-4 line-clamp-2">
                  Plongez dans les secrets ancestraux de la préparation de l'Agoun et du Télibô. Une expérience texturale unique.
                </p>
                <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 group-hover:bg-white group-hover:text-terracotta transition-colors">
                  <BookOpen size={14} /> Lire l'histoire
                </button>
              </div>
            </motion.div>
          </section>

          {/* Special Collections */}
          <section>
            <div className="px-6 flex justify-between items-end mb-5">
              <h2 className="text-xl font-bold text-stone-800 tracking-tight">Collections</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-4 pt-1">
              {[
                { title: 'Épices & Feu', desc: 'Plats relevés', img: 'https://picsum.photos/seed/spicy/400/400' },
                { title: 'Douceurs', desc: 'Desserts locaux', img: 'https://picsum.photos/seed/sweet/400/400' },
                { title: 'Street Food', desc: 'Sur le pouce', img: 'https://picsum.photos/seed/street/400/400' },
              ].map((collection, i) => (
                <motion.div
                  key={collection.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 w-40 h-40 rounded-[28px] overflow-hidden relative cursor-pointer shadow-lg shadow-stone-200/50 group"
                >
                  <img src={collection.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1">{collection.desc}</p>
                    <h3 className="text-white font-black text-lg leading-tight">{collection.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* --- Nouvelles Sections --- */}
          {/* Plats Faciles */}
          <section className="mt-8">
            <div className="px-6 flex justify-between items-end mb-4">
              <h2 className="text-xl font-black text-stone-800 tracking-tight">Vite fait, bien fait ⚡</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-6">
              {recipes.filter(r => r.difficulty === 'Facile' || r.difficulty === 'Très Facile').slice(0, 6).map(recipe => (
                <motion.div whileTap={{ scale: 0.95 }} key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="flex-shrink-0 w-36 cursor-pointer group">
                  <div className="h-32 rounded-[24px] overflow-hidden mb-3 relative shadow-sm border border-stone-100">
                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-stone-800 text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <Clock size={10} className="text-terracotta" /> {recipe.cookTime}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-stone-800 leading-tight truncate mb-1">{recipe.name}</h4>
                  <p className="text-[10px] text-stone-500 font-medium truncate">{recipe.region}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Plats des Restaurants (Stars des Maquis) */}
          <section className="mt-2 bg-[#fb5607] py-8 text-[#ffffff] rounded-[40px] shadow-inner mx-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/5 pointer-events-none mix-blend-overlay"></div>
            <div className="px-6 flex justify-between items-end mb-5 relative z-10">
              <h2 className="text-xl font-black tracking-tight text-[#ffffff]">Stars des Maquis 🍽️</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2 relative z-10">
              {recipes.slice(1, 7).map(recipe => (
                <motion.div whileTap={{ scale: 0.95 }} key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="flex-shrink-0 w-44 cursor-pointer group">
                  <div className="h-44 rounded-[28px] overflow-hidden mb-3 relative shadow-xl shadow-black/30 border border-white/20">
                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-bold text-[13px] text-[#ffffff] leading-tight mb-1">{recipe.name}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/90 uppercase tracking-widest">
                        <Star size={10} fill="currentColor" /> Très demandé
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Plats Moins Connus */}
          <section className="mt-8 mb-6">
            <div className="px-6 flex justify-between items-end mb-4">
              <h2 className="text-xl font-black text-stone-800 tracking-tight">Trésors cachés 🗺️</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-6">
              {recipes.slice(-6).map(recipe => (
                <motion.div whileTap={{ scale: 0.95 }} key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="flex-shrink-0 w-36 cursor-pointer group">
                  <div className="h-32 rounded-[24px] overflow-hidden mb-3 relative shadow-sm border border-stone-100">
                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter sepia-[0.3]" />
                    <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-black shadow-sm tracking-widest uppercase">
                      Rare
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-stone-800 leading-tight truncate mb-1">{recipe.name}</h4>
                  <p className="text-[10px] text-stone-500 font-medium truncate">{recipe.category}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Regional Tours */}
          {['Sud', 'Centre', 'Nord'].map((regionFilter, index) => {
            const regionalRecipes = recipes.filter(r => r.region.toLowerCase().includes(regionFilter.toLowerCase()));
            if (regionalRecipes.length === 0) return null;

            const regionDescriptions: Record<string, string> = {
              'Sud': "Sublime mariage de produits marins, d'huile rouge et de maïs.",
              'Centre': "Terre de tubercules, de sauces gluantes et de viandes fumées.",
              'Nord': "Saveurs robustes, céréales anciennes et grillades épicées."
            };

            return (
              <section key={regionFilter} className="relative">
                <div className="px-6 mb-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">Saveurs du {regionFilter}</h2>
                  </div>
                  <p className="text-stone-500 text-sm font-medium italic pl-13">"{regionDescriptions[regionFilter]}"</p>
                </div>

                <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar pb-8 pt-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex-shrink-0 w-32 h-72 rounded-[32px] bg-[#fb5607] p-5 flex flex-col justify-between text-[#ffffff] shadow-xl shadow-[#fb5607]/20 border border-[#fb5607]/30"
                  >
                    <Star size={24} className="text-white/80" />
                    <div>
                      <h3 className="text-2xl font-black leading-none mb-2">{regionalRecipes.length}</h3>
                      <p className="text-xs font-bold text-white/90 uppercase tracking-widest">Recettes</p>
                    </div>
                  </motion.div>

                  {regionalRecipes.map((recipe, idx) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ type: 'spring', damping: 20, stiffness: 100, delay: idx * 0.1 }}
                      whileTap={{ scale: 0.92, rotate: -1 }}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="flex-shrink-0 w-52 relative cursor-pointer group"
                    >
                      <div className="h-72 rounded-[32px] overflow-hidden shadow-xl shadow-stone-200/80 relative bg-white">
                        <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent" />

                        <div className="absolute top-4 right-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                            className={`p-2.5 backdrop-blur-md rounded-full transition-all ${currentUser?.favorites.includes(recipe.id) ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-white/20 border border-white/20 text-white hover:bg-white/40'}`}
                          >
                            <Heart size={18} fill={currentUser?.favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <div className="absolute bottom-6 left-5 right-5">
                          <span className="bg-white/90 text-stone-900 text-[10px] px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest mb-3 inline-block shadow-sm">
                            {recipe.cookTime}
                          </span>
                          <h4 className="font-black text-white text-lg leading-tight mb-2 drop-shadow-md">{recipe.name}</h4>
                          <div className="flex items-center justify-between mt-3">
                            <DifficultyBadge difficulty={recipe.difficulty} />
                            <div className="flex items-center gap-1 text-white/50 text-xs font-bold">
                              <ChefHat size={14} /> Pro
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFavorites = () => (
    <div className="flex-1 flex flex-col pb-44 pt-10">
      <header className="p-6 pt-8">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Favoris</h1>
      </header>
      <div className="px-6 space-y-4">
        {dbService.getFavorites(currentUser!, recipes).map(recipe => (
          <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white p-3 rounded-3xl border border-stone-100 flex items-center gap-4">
            <img src={recipe.image} className="w-16 h-16 rounded-2xl object-cover" />
            <div className="flex-1">
              <h4 className="font-bold text-stone-800 text-sm">{recipe.name}</h4>
              <p className="text-[10px] text-stone-400">{recipe.region}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); toggleFavorite(recipe.id); }} className="text-rose-500 p-2"><Heart size={20} fill="currentColor" /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex-1 flex flex-col pb-44 pt-10 relative bg-stone-50">
      <AnimatePresence>
        {profileSubView && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-0 z-50 bg-white p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
              <button onClick={goBack} className="p-2 bg-stone-50 rounded-xl"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">{profileSubView}</h2>
            </header>
            <ProfileSubViewRenderer
              profileSubView={profileSubView}
              setProfileSubView={setProfileSubView}
              currentUser={currentUser}
              setCurrentUser={setCurrentUser}
              t={t}
              securitySubView={securitySubView}
              setSecuritySubView={setSecuritySubView}
              goBack={goBack}
              updateSettings={updateSettings}
              handleLogout={handleLogout}
              settings={settings}
              handleSaveSettings={handleSaveSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col items-center py-10">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">{currentUser?.name}</h2>
        <p className="text-stone-500 text-sm">{currentUser?.email}</p>
      </header>

      <section className="px-6 space-y-3">
        {[
          { icon: UserIcon, label: t.personalInfo, view: 'Informations personnelles' },
          { icon: Settings, label: t.settings, view: 'Paramètres' },
          { icon: Info, label: t.about, view: "À propos d'AfroCuisto" },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => setProfileSubView(item.view)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-3xl border border-stone-100 shadow-sm active:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600"><item.icon size={20} /></div>
              <span className="font-bold text-stone-700 text-sm">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-stone-300" />
          </button>
        ))}
        <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 bg-rose-50 rounded-3xl text-rose-600 font-bold mt-6"><LogOut size={20} /> {t.logout}</button>
      </section>
    </div>
  );

  const renderDetail = () => {
    if (!selectedRecipe) return null;

    const charCodeSum = selectedRecipe.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fakeCalories = 250 + (charCodeSum % 300);
    const fakeProtein = 10 + (charCodeSum % 30);
    const fakeCarbs = 20 + (charCodeSum % 50);
    const fakeFat = 5 + (charCodeSum % 25);

    let related = recipes.filter(r => r.category === selectedRecipe.category && r.id !== selectedRecipe.id).slice(0, 3);
    if (related.length === 0) {
      related = recipes.filter(r => r.id !== selectedRecipe.id).slice(0, 3);
    }
    const youtubeQuery = encodeURIComponent(`préparation recette ${selectedRecipe.name}`);

    return (
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 350, mass: 0.8 }}
        className="absolute inset-0 z-[100] bg-white overflow-hidden w-full flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 z-[110] pointer-events-none p-6 pt-12">
          <div className="relative w-full flex justify-between items-start pointer-events-none">
            <button onClick={goBack} className="w-10 h-10 bg-[#fb5607]/80 backdrop-blur-md rounded-full text-white flex items-center justify-center border border-white/30 shadow-lg shadow-[#fb5607]/20 pointer-events-auto"><ChevronLeft size={24} /></button>
            <button onClick={() => toggleFavorite(selectedRecipe.id)} className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-all pointer-events-auto ${currentUser?.favorites.includes(selectedRecipe.id) ? 'bg-white border-white text-rose-500' : 'bg-white border-stone-100 text-stone-400'}`}><Heart size={20} fill={currentUser?.favorites.includes(selectedRecipe.id) ? 'currentColor' : 'none'} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-36 relative min-h-0">
          <div className="relative h-[40vh] w-full shrink-0">
            <img src={selectedRecipe.image} className="w-full h-full object-cover" />
          </div>
          <div className="p-6 -mt-8 bg-white rounded-t-[32px] relative z-10">
            <h1 className="text-2xl font-bold text-stone-800 mb-2">{selectedRecipe.name}</h1>
            <p className="text-terracotta font-bold text-sm mb-6 flex items-center gap-1"><MapPin size={16} />{selectedRecipe.region}</p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-stone-50 p-4 rounded-2xl flex flex-col items-center"><Clock size={18} className="text-terracotta" /><span className="text-[10px] uppercase font-black text-stone-400 mt-2">Prép</span><span className="text-sm font-bold">{selectedRecipe.prepTime}</span></div>
              <div className="bg-stone-50 p-4 rounded-2xl flex flex-col items-center"><Flame size={18} className="text-terracotta" /><span className="text-[10px] uppercase font-black text-stone-400 mt-2">Cuisson</span><span className="text-sm font-bold">{selectedRecipe.cookTime}</span></div>
              <div className="bg-stone-50 p-4 rounded-2xl flex flex-col items-center"><UtensilsCrossed size={18} className="text-terracotta" /><span className="text-[10px] uppercase font-black text-stone-400 mt-2">Niveau</span><span className="text-sm font-bold">{selectedRecipe.difficulty}</span></div>
            </div>

            <h3 className="text-lg font-bold mb-4">Ingrédients</h3>
            <ul className="space-y-2 mb-8">
              {selectedRecipe.ingredients?.map((ing, i) => (
                <li key={i} className="flex justify-between p-3 bg-stone-50 rounded-xl text-sm font-medium">
                  <span>{ing.item}</span>
                  <span className="text-terracotta font-bold">{ing.amount}</span>
                </li>
              ))}
            </ul>

            <h3 className="text-lg font-bold mb-4">Préparation</h3>
            <div className="space-y-4 mb-8">
              {selectedRecipe.steps?.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <span className="w-6 h-6 flex-shrink-0 bg-terracotta text-white rounded-full text-[10px] flex items-center justify-center font-bold shadow-sm">{i + 1}</span>
                  <p className="text-stone-600 text-sm leading-relaxed">{step}</p>
                </div>
              ))}
            </div>

            <hr className="mb-8 border-stone-100" />

            {/* Nutrition Section */}
            <h3 className="text-lg font-bold mb-4">Valeurs Nutritionnelles (est.)</h3>
            <div className="bg-stone-50 border border-stone-100 rounded-3xl p-5 mb-8">
              <div className="grid grid-cols-4 gap-2 text-center divide-x divide-stone-200/60">
                <div>
                  <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Calories</span>
                  <span className="text-lg font-black text-terracotta">{fakeCalories}</span>
                  <span className="text-[9px] text-stone-400 font-bold block mt-0.5">kcal</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Protéines</span>
                  <span className="text-lg font-black text-stone-800">{fakeProtein}</span>
                  <span className="text-[9px] text-stone-400 font-bold block mt-0.5">g</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Glucides</span>
                  <span className="text-lg font-black text-stone-800">{fakeCarbs}</span>
                  <span className="text-[9px] text-stone-400 font-bold block mt-0.5">g</span>
                </div>
                <div>
                  <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Lipides</span>
                  <span className="text-lg font-black text-stone-800">{fakeFat}</span>
                  <span className="text-[9px] text-stone-400 font-bold block mt-0.5">g</span>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <h3 className="text-lg font-bold mb-4">Guide en Vidéo</h3>
            <div className="mb-10 rounded-[24px] overflow-hidden bg-stone-900 h-56 relative shadow-md group">
              <iframe
                className="w-full h-full absolute inset-0 z-10"
                src={`https://www.youtube.com/embed?listType=search&list=${youtubeQuery}&controls=1`}
                title="Tutoriel de préparation"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              {/* Fallback pattern underneath while loading */}
              <div className="absolute inset-0 flex items-center justify-center flex-col text-stone-500 bg-stone-100 z-0">
                <span className="w-12 h-12 border-4 border-stone-200 border-t-terracotta rounded-full animate-spin mb-3"></span>
                <p className="text-xs font-bold uppercase tracking-widest">Chargement Vidéo...</p>
              </div>
            </div>

            {/* Related Recipes Section */}
            {related.length > 0 && (
              <>
                <h3 className="text-lg font-bold mb-4">Plats similaires</h3>
                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pr-6 -mr-6">
                  {related.map(r => (
                    <motion.div whileTap={{ scale: 0.95 }} key={r.id} onClick={() => setSelectedRecipe(r)} className="flex-shrink-0 w-36 cursor-pointer group">
                      <div className="h-32 rounded-[20px] overflow-hidden mb-3 relative shadow-sm border border-stone-100">
                        <img src={r.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                      <h4 className="font-bold text-sm text-stone-800 leading-tight truncate mb-1">{r.name}</h4>
                      <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><Clock size={10} className="text-terracotta" /> {r.cookTime} • {r.difficulty}</span>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </motion.div>
    );
  };

  const renderAuth = () => (
    <div className="flex-1 flex flex-col bg-white p-8 justify-center h-full">
      <div className="text-center mb-10"><ChefHat size={60} className="text-terracotta mx-auto mb-4" /><h1 className="text-3xl font-black text-stone-800">AfroCuisto</h1></div>
      <div className="bg-stone-50 p-1 rounded-2xl flex mb-8">
        <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold ${authMode === 'login' ? 'bg-white shadow-sm' : 'text-stone-400'}`}>Connexion</button>
        <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-bold ${authMode === 'signup' ? 'bg-white shadow-sm' : 'text-stone-400'}`}>Inscription</button>
      </div>
      <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
        {authMode === 'signup' && <input type="text" placeholder="Nom complet" required value={authFormData.name} onChange={e => setAuthFormData({ ...authFormData, name: e.target.value })} className="w-full bg-stone-50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium" />}
        <input type="email" placeholder="Email" required value={authFormData.email} onChange={e => setAuthFormData({ ...authFormData, email: e.target.value })} className="w-full bg-stone-50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium" />
        <input type="password" placeholder="Mot de passe" required value={authFormData.password} onChange={e => setAuthFormData({ ...authFormData, password: e.target.value })} className="w-full bg-stone-50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium" />
        <button type="submit" className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold shadow-lg shadow-terracotta/20">{authMode === 'login' ? 'Se connecter' : "C'est parti !"}</button>
      </form>
    </div>
  );

  // --- Return JSX ---

  if (!currentUser) return <div className="h-screen bg-stone-50 max-w-md mx-auto relative overflow-hidden flex flex-col shadow-2xl">{renderAuth()}</div>;

  return (
    <div className="h-screen bg-stone-50 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col transition-all">
      <div className="absolute top-0 left-0 right-0 h-10 bg-stone-50/80 backdrop-blur-md z-[100] pointer-events-none" />
      <main className="flex-1 overflow-y-auto no-scrollbar relative min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">{renderHome()}</motion.div>}
          {activeTab === 'search' && <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">{renderExplorer()}</motion.div>}
          {activeTab === 'favs' && <motion.div key="favs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">{renderFavorites()}</motion.div>}
          {activeTab === 'profile' && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">{renderProfile()}</motion.div>}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedRecipe && renderDetail()}
      </AnimatePresence>

      {/* Floating Glassmorphic Bottom Navigation */}
      <nav className="absolute bottom-6 left-6 right-6 bg-[#fb5607] backdrop-blur-3xl border border-[#fb5607]/80 px-6 py-3 rounded-[32px] flex justify-between items-center z-[110] shadow-[0_20px_40px_rgba(251,86,7,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`flex flex-col items-center relative transition-all duration-300 ${isActive ? 'text-[#fb5607]' : 'text-white/70 hover:text-white'}`}>
              <motion.div
                whileTap={{ scale: 0.8 }}
                className={`p-2.5 rounded-2xl relative transition-all duration-300 ${isActive ? 'bg-white text-[#fb5607] shadow-lg shadow-black/10 scale-110 -translate-y-2' : ''}`}
              >
                <Icon size={22} fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              {!isActive && <span className="text-[9px] font-bold mt-1 text-white/80">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
