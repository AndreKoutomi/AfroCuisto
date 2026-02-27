import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  EyeOff,
  Key,
  CheckCircle2,
  Camera,
  Edit2
} from 'lucide-react';
import { recipes } from './data';
import { Recipe, Difficulty, User, UserSettings } from './types';
import { getAIRecipeRecommendation } from './aiService';
import { dbService } from './dbService';
import { translations, LanguageCode } from './translations';
import { App as CapacitorApp } from '@capacitor/app';

// --- Constants & Config ---
const springTransition = { type: 'spring', stiffness: 500, damping: 28, mass: 0.5 };
const layoutTransition = { type: 'spring', stiffness: 350, damping: 25 };

// --- Sub-Components & Helpers ---

const DifficultyBadge = ({ difficulty, t }: { difficulty: Difficulty; t: any }) => {
  const colors = {
    'Facile': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Très Facile': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Moyen': 'bg-amber-100 text-amber-700 border-amber-200',
    'Difficile': 'bg-rose-100 text-rose-700 border-rose-200'
  };

  const labels = {
    'Facile': t.easy,
    'Très Facile': t.veryEasy,
    'Moyen': t.medium,
    'Difficile': t.hard
  };

  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${colors[difficulty as keyof typeof colors] || 'bg-stone-100 text-stone-600'}`}>
      {labels[difficulty as keyof typeof labels]}
    </span>
  );
};

const HeroCarousel = ({ recipes, setSelectedRecipe, currentUser, toggleFavorite, t }: {
  recipes: Recipe[],
  setSelectedRecipe: (r: Recipe) => void,
  currentUser: User | null,
  toggleFavorite: (id: string) => void,
  t: any
}) => {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    if (recipes.length <= 1) return;
    const interval = setInterval(() => {
      if (scrollRef.current && !isAutoScrolling.current) {
        const nextIndex = (index + 1) % recipes.length;
        const snapElements = Array.from(scrollRef.current.children).filter(c => (c as HTMLElement).classList.contains('snap-center')) as HTMLElement[];
        const child = snapElements[nextIndex];
        if (child) {
          isAutoScrolling.current = true;
          child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          setIndex(nextIndex);
          setTimeout(() => { isAutoScrolling.current = false; }, 800);
        }
      }
    }, 4500);
    return () => clearInterval(interval);
  }, [recipes.length, index]);

  return (
    <div className="relative w-full overflow-hidden pb-6 pt-2">
      <div
        ref={scrollRef}
        className="relative flex gap-[4vw] overflow-x-auto no-scrollbar snap-x snap-mandatory px-[15vw]"
        style={{ scrollBehavior: 'smooth' }}
        onScroll={(e) => {
          if (isAutoScrolling.current) return;
          const target = e.currentTarget;
          const snapElements = Array.from(target.children).filter(c => (c as HTMLElement).classList.contains('snap-center')) as HTMLElement[];
          if (!snapElements.length) return;

          const containerCenter = target.scrollLeft + (target.offsetWidth / 2);

          let closestIndex = 0;
          let minDistance = Infinity;

          snapElements.forEach((child, i) => {
            const childCenter = child.offsetLeft + (child.offsetWidth / 2);
            const distance = Math.abs(containerCenter - childCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = i;
            }
          });

          if (closestIndex !== index) {
            setIndex(closestIndex);
          }
        }}
      >
        {recipes.map((recipe, i) => {
          const isActive = i === index;
          return (
            <motion.div
              key={recipe.id}
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.85,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ type: 'spring', damping: 18, stiffness: 100, mass: 1.2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!isActive && scrollRef.current) {
                  const snapElements = Array.from(scrollRef.current.children).filter(c => (c as HTMLElement).classList.contains('snap-center')) as HTMLElement[];
                  const child = snapElements[i];
                  if (child) {
                    isAutoScrolling.current = true;
                    child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    setIndex(i);
                    setTimeout(() => { isAutoScrolling.current = false; }, 800);
                  }
                } else {
                  setSelectedRecipe(recipe);
                }
              }}
              className="relative h-[420px] w-[70vw] flex-shrink-0 rounded-[40px] overflow-hidden shadow-2xl shadow-stone-300/30 cursor-pointer group snap-center"
            >
              {/* Full background Image */}
              <img
                src={recipe.image}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt={recipe.name}
              />

              {/* Premium Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/40 to-transparent opacity-90" />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Top Icons Layer */}
              <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-white shadow-lg">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black tracking-wide">4.9</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe.id); }}
                  className={`p-3 backdrop-blur-xl border rounded-full transition-all duration-300 ${currentUser?.favorites.includes(recipe.id) ? 'bg-white text-[#fb5607] border-white shadow-lg scale-110' : 'bg-black/20 text-white border-white/20 hover:bg-black/40'}`}
                >
                  <Heart size={20} fill={currentUser?.favorites.includes(recipe.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Bottom Content Area */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col z-10 transform transition-transform duration-500">
                <span className="inline-flex items-center w-max px-2.5 py-1 rounded-lg bg-[#fb5607]/20 border border-[#fb5607]/30 text-[10px] font-black text-[#fb5607] uppercase tracking-widest mb-3 backdrop-blur-md">
                  Notre Recommandation
                </span>

                <h3 className="text-white font-black text-[26px] leading-[1.1] mb-4 drop-shadow-md pr-2">
                  {recipe.name}
                </h3>

                <div className="flex items-center justify-between w-full border-t border-white/10 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-stone-200">
                    <MapPin size={14} className="text-stone-300/80 shrink-0" />
                    <span className="truncate max-w-[120px]">{recipe.region}</span>
                  </div>
                  <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[11px] px-3 py-1.5 rounded-xl font-black shrink-0 flex items-center gap-1.5">
                    <Clock size={12} className="text-stone-300" />{recipe.cookTime}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
        {/* Right padding specific spacing element to avoid iOS scroll cut off */}
        <div className="w-[1vw] flex-shrink-0" />
      </div>

      {/* Modern Dots Indicator */}
      <div className="flex justify-center gap-2 mt-6">
        {recipes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              if (scrollRef.current) {
                const snapElements = Array.from(scrollRef.current.children).filter(c => (c as HTMLElement).classList.contains('snap-center')) as HTMLElement[];
                const child = snapElements[i];
                if (child) {
                  isAutoScrolling.current = true;
                  child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  setIndex(i);
                  setTimeout(() => { isAutoScrolling.current = false; }, 800);
                }
              }
            }}
            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${index === i ? 'w-8 bg-[#fb5607]' : 'w-2 bg-stone-300 hover:bg-stone-400'}`}
            aria-label={`Aller à la diapositive ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

// --- Data Juices ---

const benineseJuices = [
  { id: 'J01', name: 'Jus de Bissap', image: '/images/juices/bissap.png', description: 'Le rafraîchissement iconique à l\'hibiscus rouge.' },
  { id: 'J02', name: 'Jus de Baobab', image: '/images/juices/baobab.jpg', description: 'Onctueux, riche en vitamine C et calcium.' },
  { id: 'J03', name: 'Jus d\'Ananas', image: '/images/juices/ananas.jpg', description: 'La douceur pure de l\'ananas Pain de Sucre.' },
  { id: 'J04', name: 'Jus de Tamarin', image: '/images/juices/tamarin.jpg', description: 'Une saveur acidulée, digestive et rafraîchissante.' },
  { id: 'J05', name: 'Jus de Mangue', image: '/images/juices/mangue.jpg', description: 'Le velouté des meilleures mangues du Bénin.' },
  { id: 'J06', name: 'Jus de Corossol', image: 'https://picsum.photos/seed/corossol/600/800', description: 'Une texture onctueuse aux notes exotiques.' },
  { id: 'J07', name: 'Jus de Passion', image: 'https://picsum.photos/seed/passion/600/800', description: 'Un parfum intense et une acidité parfaite.' },
  { id: 'J08', name: 'Jus de Gingembre', image: 'https://picsum.photos/seed/ginger/600/800', description: 'Un punch naturel, tonifiant et épicé.' },
];

// --- Deep Views ---

const AccountSecurityView = ({ currentUser, setCurrentUser, t, securitySubView, setSecuritySubView, goBack }: any) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ current: '', new: '', confirm: '', email: currentUser?.email || '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={springTransition} className="space-y-4">
          <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100">
            <h3 className="text-[10px] font-black uppercase text-stone-400 mb-4">{t.changePassword}</h3>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPass.current ? "text" : "password"}
                  placeholder={t.currentPassword}
                  className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                  value={formData.current}
                  onChange={e => setFormData({ ...formData, current: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass({ ...showPass, current: !showPass.current })} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1">
                  {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass.new ? "text" : "password"}
                  placeholder={t.newPassword}
                  className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                  value={formData.new}
                  onChange={e => setFormData({ ...formData, new: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass({ ...showPass, new: !showPass.new })} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1">
                  {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass.confirm ? "text" : "password"}
                  placeholder={t.confirmPassword}
                  className="w-full bg-white border border-stone-100 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta"
                  value={formData.confirm}
                  onChange={e => setFormData({ ...formData, confirm: e.target.value })}
                />
                <button type="button" onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 p-1">
                  {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-stone-400 italic">{t.passwordSecurityNote}</p>
          </div>
          <button onClick={handleSave} className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform shadow-lg shadow-terracotta/20">{t.save}</button>
          <button onClick={() => setSecuritySubView('main')} className="w-full text-stone-400 py-2 font-bold text-sm">{t.back}</button>
        </motion.div>
      );
    case 'email':
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={springTransition} className="space-y-4">
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
    'personalInfo': () => {
      const fileInputRef = useRef<HTMLInputElement>(null);

      const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && currentUser) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result as string;
            const updatedUser = dbService.updateAvatar(currentUser.id, base64String);
            if (updatedUser) {
              setCurrentUser(updatedUser);
            }
          };
          reader.readAsDataURL(file);
        }
      };

      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-100">
                <img
                  src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 bg-terracotta text-white rounded-full shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all"
              >
                <Camera size={18} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="mt-3 text-[10px] font-black text-stone-400 uppercase tracking-widest">{t.changeProfilePhoto}</p>
          </div>
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
      );
    },
    'notifications': () => (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-stone-50 rounded-3xl border border-stone-100">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
          <Bell size={32} />
        </div>
        <h3 className="font-bold text-stone-800 mb-1">{t.noNotifications}</h3>
        <p className="text-stone-400 text-xs">{t.notificationDesc}</p>
      </div>
    ),
    'settings': () => (
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
            setProfileSubView('security');
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
    'security': () => (
      <AccountSecurityView
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        t={t}
        securitySubView={securitySubView}
        setSecuritySubView={setSecuritySubView}
        goBack={goBack}
      />
    ),
    'privacy': () => (
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
    'about': () => (
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

  const renderView = views[profileSubView] || views['settings'] || (() => null);
  return renderView();
};

// --- Main Application ---

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(dbService.getCurrentUser());
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authFormData, setAuthFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Cloud Sync
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(recipes);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const syncRecipes = async () => {
      setIsSyncing(true);
      const remote = await dbService.getRemoteRecipes();
      if (remote && remote.length > 0) {
        setAllRecipes(remote);
      }
      setIsSyncing(false);
    };

    syncRecipes();

    // 1. Realtime Sync Subscription
    let channel: any;
    if (dbService.supabase) {
      channel = dbService.supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'recipes' },
          () => {
            console.log('Change detected in Supabase, re-syncing...');
            syncRecipes();
          }
        )
        .subscribe();
    }

    // 2. Foreground Sync (Capacitor)
    const handleAppStateChange = (state: any) => {
      if (state.isActive) {
        console.log('App resumed, syncing recipes...');
        syncRecipes();
      }
    };
    const appListener = CapacitorApp.addListener('appStateChange', handleAppStateChange);

    return () => {
      if (channel) dbService.supabase?.removeChannel(channel);
      appListener.then(l => l.remove());
    };
  }, []);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState<string[]>(['home']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [profileSubView, setProfileSubView] = useState<string | null>(null);
  const [securitySubView, setSecuritySubView] = useState<'main' | 'password' | 'email' | 'validation'>('main');
  const [aiRecommendation, setAiRecommendation] = useState<string>("Chargement de votre suggestion personnalisée...");

  const juicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab !== 'home' || !juicesRef.current) return;

    let animationId: number;
    const container = juicesRef.current;

    const scroll = () => {
      if (container) {
        container.scrollLeft += 0.8;
        if (container.scrollLeft >= (container.scrollWidth - container.clientWidth) - 1) {
          container.scrollLeft = 0;
        }
        animationId = requestAnimationFrame(scroll);
      }
    };

    return () => cancelAnimationFrame(animationId);
  }, [activeTab, selectedRecipe]);

  const detailScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRecipe && detailScrollRef.current) {
      detailScrollRef.current.scrollTo(0, 0);
    }
  }, [selectedRecipe]);

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
      getAIRecipeRecommendation(allRecipes, currentUser.name).then(setAiRecommendation);
    }
  }, [currentUser]);

  const filteredRecipes = useMemo(() => {
    let result = allRecipes;
    if (searchQuery) {
      result = result.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) result = result.filter(r => r.category === selectedCategory);
    if (selectedRegion) result = result.filter(r => r.region.toLowerCase().includes(selectedRegion.toLowerCase()));
    return result;
  }, [allRecipes, searchQuery, selectedCategory, selectedRegion]);

  const displayRecipes = filteredRecipes;
  const featuredRecipes = displayRecipes.slice(0, 5);
  const otherRecipes = displayRecipes.length > 5 ? displayRecipes.slice(5) : allRecipes.filter(r => !featuredRecipes.find(fr => fr.id === r.id)).slice(0, 5);

  const navItems = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'search', icon: Search, label: t.explorer },
    { id: 'favs', icon: Heart, label: t.favorites },
    { id: 'profile', icon: UserIcon, label: t.profile },
  ];

  // --- Sub-Renderers (extracted for clarity) ---

  const renderHome = () => (
    <div className="flex-1 flex flex-col pb-44">
      {/* Sticky Top Header with Search */}
      <header className="px-6 pt-10 pb-4 bg-white/95 backdrop-blur-2xl sticky top-0 z-[100] border-b border-stone-100 flex flex-col gap-6">
        {/* Row 1: Logo & Greeting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/images/chef_icon.png" className="w-10 h-10 object-contain" alt="AfroCuisto Logo" />
            <div className="flex flex-col">
              <span className="text-sm font-black text-[#fb5607] uppercase tracking-widest flex items-center gap-1">
                {t.hello}, {currentUser?.name?.split(' ')[0]} 👋
              </span>
              <h1 className="text-[11px] font-bold text-stone-400 leading-tight uppercase tracking-[0.15em]">{t.homeSlogan}</h1>
            </div>
          </div>
          {isSyncing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-[#fb5607]"
            >
              <Wifi size={16} />
            </motion.div>
          )}
        </div>

        {/* Row 2: Global Search Bar */}
        <div className="relative group shadow-sm rounded-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-terracotta transition-colors" size={20} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-100/50 border border-stone-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:bg-white transition-all shadow-inner"
          />

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {searchQuery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden z-[110] max-h-80 overflow-y-auto no-scrollbar"
              >
                {allRecipes
                  .filter(r =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.region.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 6)
                  .map((recipe, i) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: i * 0.03 }}
                      onClick={() => {
                        setSelectedRecipe(recipe);
                        setSearchQuery('');
                      }}
                      className="p-4 flex items-center gap-4 hover:bg-stone-50 cursor-pointer border-b border-stone-50 last:border-0 transition-colors"
                    >
                      <img src={recipe.image} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt={recipe.name} style={{ transform: 'translateZ(0)' }} />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-stone-900 leading-tight">{recipe.name}</span>
                        <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1 mt-1">
                          <MapPin size={10} /> {recipe.region} • {recipe.difficulty}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                {allRecipes.filter(r =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.region.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                    <div className="p-8 text-center bg-stone-50/50">
                      <Search size={32} className="mx-auto mb-2 text-stone-300" />
                      <p className="text-xs text-stone-500 font-bold uppercase tracking-widest">Aucun résultat trouvé</p>
                    </div>
                  )}

                <div
                  onClick={() => { setActiveTab('search'); }}
                  className="p-3 bg-terracotta/5 text-center border-t border-stone-100 cursor-pointer"
                >
                  <span className="text-[10px] font-black text-terracotta uppercase tracking-[0.2em]">Voir tous les résultats</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Categories Horizontal Pills */}
      <section className="mt-6 mb-8 pl-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pr-6">
          {[
            { name: 'Pâtes et Céréales (Wɔ̌)', short: t.catPates, icon: '🥣' },
            { name: 'Sauces (Nùsúnnú)', short: t.catSauces, icon: '🍲' },
            { name: 'Protéines & Grillades', short: t.catGrillades, icon: '🍗' },
            { name: 'Boissons & Douceurs', short: t.catBoissons, icon: '🍹' },
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

      {/* Hero: "Sélection de Chef" Carrousel */}
      <section className="mb-10">
        <div className="px-6 flex justify-between items-end mb-4">
          <h2 className="text-xl font-black text-stone-800 tracking-tight">{t.chefSelection}</h2>
          <span className="text-terracotta text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform" onClick={() => setActiveTab('search')}>{t.viewAll} <ChevronRight size={14} /></span>
        </div>

        {featuredRecipes.length > 0 && (
          <HeroCarousel
            recipes={featuredRecipes}
            setSelectedRecipe={setSelectedRecipe}
            currentUser={currentUser}
            toggleFavorite={toggleFavorite}
            t={t}
          />
        )}
      </section>

      {/* Trending Recipes List */}
      <section className="px-6 mb-10">
        <h2 className="text-xl font-black text-stone-800 mb-5 tracking-tight">{t.trending}</h2>
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
                  <DifficultyBadge difficulty={recipe.difficulty} t={t} />
                  <span className="text-[9px] bg-stone-100 text-stone-600 font-bold px-2 py-1 rounded-md border border-stone-200 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> {recipe.cookTime}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* All Dishes Section */}
      <section className="px-6 mb-10">
        <div className="flex justify-between items-end mb-5">
          <h2 className="text-xl font-black text-stone-800 tracking-tight">Tous les plats</h2>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{allRecipes.length} Plats</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {allRecipes.map(recipe => (
            <motion.div
              key={recipe.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100/80 flex flex-col h-full cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="h-32 relative flex-shrink-0">
                <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={recipe.name} />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-stone-800 text-[9px] font-black shadow-sm tracking-widest uppercase">
                  {recipe.cookTime}
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="font-bold text-stone-800 text-xs leading-tight line-clamp-2 mb-1 group-hover:text-terracotta transition-colors">{recipe.name}</h4>
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <span className="text-[9px] text-stone-400 font-medium flex items-center gap-1"><MapPin size={8} /> {recipe.region}</span>
                  <DifficultyBadge difficulty={recipe.difficulty} t={t} />
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
      <header className="px-6 pt-14 pb-6 bg-white/90 backdrop-blur-2xl sticky top-0 z-40">
        <h1 className="text-3xl font-black text-stone-900 mb-6 drop-shadow-sm">{selectedCategory || 'Explorer'}</h1>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-terracotta transition-colors" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchDishRegion}
            className="w-full bg-white border border-stone-100/80 rounded-[20px] py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/30 transition-all font-medium"
          />
        </div>
      </header>

      {/* Dynamic Content Area */}
      {searchQuery || selectedCategory ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springTransition} className="px-6 pt-6 grid grid-cols-2 gap-4">
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
                  <DifficultyBadge difficulty={recipe.difficulty} t={t} />
                </div>
              </div>
            </motion.div>
          ))}
          {displayRecipes.length === 0 && (
            <div className="col-span-2 py-20 text-center text-stone-400 font-medium">{t.noResults}</div>
          )}
        </motion.div>
      ) : (
        <div className="pt-2 space-y-12 pb-10">

          {/* Hero Section: Discovery of the day */}
          {/* Beninese Juices Carousel */}
          <section className="px-6 mb-10 overflow-hidden">
            <div className="flex justify-between items-end mb-5">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t.artOfJuice}</h2>
              <span className="text-[10px] font-black text-[#fb5607] uppercase tracking-widest">{t.juiceCount}</span>
            </div>
            <div ref={juicesRef} className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-6">
              {benineseJuices.map((juice) => (
                <motion.div
                  key={juice.id}
                  whileTap={{ scale: 0.98 }}
                  className="flex-shrink-0 w-72 h-[450px] relative rounded-[32px] overflow-hidden shadow-2xl group cursor-pointer"
                  onClick={() => {
                    const recipe = allRecipes.find(r => r.id === juice.id);
                    if (recipe) setSelectedRecipe(recipe);
                  }}
                >
                  <img src={juice.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute bottom-8 left-6 right-6">
                    <h3 className="text-2xl font-black text-white mb-2">{juice.name}</h3>
                    <p className="text-white/70 text-sm mb-6 line-clamp-3 font-medium leading-relaxed">{juice.description}</p>
                    <button className="bg-[#fb5607] text-white px-7 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#fb5607]/40 active:scale-95 transition-all w-full flex items-center justify-center gap-2">
                      {t.discover}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>



          {/* --- Nouvelles Sections --- */}
          {/* Plats Faciles */}
          <section className="mt-8">
            <div className="px-6 flex justify-between items-end mb-4">
              <h2 className="text-xl font-black text-stone-800 tracking-tight">{t.quickRecipes} ⚡</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-6">
              {allRecipes.filter(r => r.difficulty === 'Facile' || r.difficulty === 'Très Facile').slice(0, 6).map(recipe => (
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
              <h2 className="text-xl font-black tracking-tight text-[#ffffff]">{t.maquisStarsEmoji}</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-2 relative z-10">
              {allRecipes.slice(1, 7).map(recipe => (
                <motion.div whileTap={{ scale: 0.95 }} key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="flex-shrink-0 w-44 cursor-pointer group">
                  <div className="h-44 rounded-[28px] overflow-hidden mb-3 relative shadow-xl shadow-black/30 border border-white/20">
                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h4 className="font-bold text-[13px] text-[#ffffff] leading-tight mb-1">{recipe.name}</h4>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/90 uppercase tracking-widest">
                        <Star size={10} fill="currentColor" /> {t.popular}
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
              <h2 className="text-xl font-black text-stone-800 tracking-tight">{t.hiddenTreasuresEmoji}</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto px-6 no-scrollbar pb-6">
              {allRecipes.slice(-6).map(recipe => (
                <motion.div whileTap={{ scale: 0.95 }} key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="flex-shrink-0 w-36 cursor-pointer group">
                  <div className="h-32 rounded-[24px] overflow-hidden mb-3 relative shadow-sm border border-stone-100">
                    <img src={recipe.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter sepia-[0.3]" />
                    <div className="absolute top-2 right-2 bg-stone-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-black shadow-sm tracking-widest uppercase">
                      {t.rare}
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
            const regionalRecipes = allRecipes.filter(r => r.region.toLowerCase().includes(regionFilter.toLowerCase()));
            if (regionalRecipes.length === 0) return null;

            const regionNames: Record<string, string> = {
              'Sud': t.south,
              'Centre': t.center,
              'Nord': t.north
            };

            const regionDescriptions: Record<string, string> = {
              'Sud': t.southDesc,
              'Centre': t.centerDesc,
              'Nord': t.northDesc
            };

            return (
              <section key={regionFilter} className="relative">
                <div className="px-6 mb-5">
                  <div className="items-center gap-3 mb-2 flex">
                    <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center">
                      <MapPin size={20} />
                    </div>
                    <h2 className="text-2xl font-black text-stone-900 tracking-tight">{t.flavorsOf} {regionNames[regionFilter]}</h2>
                  </div>
                  <p className="text-stone-500 text-sm font-medium italic pl-13">"{regionDescriptions[regionFilter]}"</p>
                </div>

                <div className="flex gap-5 overflow-x-auto px-6 no-scrollbar pb-8 pt-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={springTransition}
                    className="flex-shrink-0 w-32 h-72 rounded-[32px] bg-[#fb5607] p-5 flex flex-col justify-between text-[#ffffff] shadow-xl shadow-[#fb5607]/20 border border-[#fb5607]/30"
                  >
                    <Star size={24} className="text-white/80" />
                    <div>
                      <h3 className="text-2xl font-black leading-none mb-2">{regionalRecipes.length}</h3>
                      <p className="text-xs font-bold text-white/90 uppercase tracking-widest">{t.recipesLabel}</p>
                    </div>
                  </motion.div>

                  {regionalRecipes.map((recipe, idx) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ ...springTransition, delay: idx * 0.1 }}
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
                            <DifficultyBadge difficulty={recipe.difficulty} t={t} />
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

  const renderFavorites = () => {
    const favoriteRecipes = dbService.getFavorites(currentUser!, allRecipes);

    return (
      <div className="flex-1 flex flex-col pb-44 pt-10">
        <header className="p-6 pt-8">
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{t.favorites}</h1>
        </header>
        <div className="px-6 space-y-4">
          {favoriteRecipes.length > 0 ? (
            favoriteRecipes.map(recipe => (
              <div key={recipe.id} onClick={() => setSelectedRecipe(recipe)} className="bg-white p-3 rounded-3xl border border-stone-100 flex items-center gap-4">
                <img src={recipe.image} className="w-16 h-16 rounded-2xl object-cover" />
                <div className="flex-1">
                  <h4 className="font-bold text-stone-800 text-sm">{recipe.name}</h4>
                  <p className="text-[10px] text-stone-400">{recipe.region}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleFavorite(recipe.id); }} className="text-rose-500 p-2"><Heart size={20} fill="currentColor" /></button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-300 mb-6">
                <Heart size={40} />
              </div>
              <h3 className="text-lg font-bold text-stone-800 mb-2">{t.noFavorites}</h3>
              <p className="text-stone-400 text-sm max-w-[200px] leading-relaxed italic">"{t.noFavoritesDesc}"</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="flex-1 flex flex-col pb-44 pt-10 relative bg-stone-50">
      <AnimatePresence>
        {profileSubView && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={springTransition} className="absolute inset-0 z-50 bg-white p-6 pt-12">
            <header className="flex items-center gap-4 mb-8">
              <button onClick={goBack} className="p-2 bg-stone-50 rounded-xl"><ChevronLeft size={20} /></button>
              <h2 className="text-xl font-bold">{
                profileSubView === 'personalInfo' ? t.personalInfo :
                  profileSubView === 'settings' ? t.settings :
                    profileSubView === 'about' ? t.about :
                      profileSubView === 'security' ? t.security :
                        profileSubView === 'notifications' ? t.notifications :
                          profileSubView === 'privacy' ? t.privacy :
                            profileSubView
              }</h2>
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
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-stone-100">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-2xl font-bold text-stone-800">{currentUser?.name}</h2>
        <p className="text-stone-500 text-sm">{currentUser?.email}</p>

        {/* Cloud Connection Status */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-stone-100 shadow-sm">
          <div className={`w-2 h-2 rounded-full animate-pulse ${dbService.supabase ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
            Cloud Sync: {dbService.supabase ? 'Activé' : 'Désactivé'}
          </span>
        </div>
      </header>

      <section className="px-6 space-y-3">
        {[
          { icon: UserIcon, label: t.personalInfo, view: 'personalInfo' },
          { icon: Settings, label: t.settings, view: 'settings' },
          { icon: Info, label: t.about, view: 'about' },
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

        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-between p-4 bg-white/50 rounded-3xl border border-dashed border-stone-200 shadow-sm active:bg-stone-50 transition-colors mt-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center ${isSyncing ? 'text-terracotta' : 'text-stone-400'}`}>
              <motion.div animate={isSyncing ? { rotate: 360 } : {}} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <Wifi size={20} />
              </motion.div>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-bold text-stone-700 text-sm">Actualiser les recettes</span>
              <span className="text-[10px] text-stone-400 font-medium tracking-tight">Vérifier les nouveaux plats sur le serveur</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${isSyncing ? 'bg-terracotta/10 text-terracotta' : 'bg-stone-100 text-stone-400'}`}>
            {isSyncing ? 'Sync...' : 'Prêt'}
          </div>
        </button>
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

    let related = allRecipes.filter(r => r.category === selectedRecipe.category && r.id !== selectedRecipe.id).slice(0, 3);
    if (related.length === 0) {
      related = allRecipes.filter(r => r.id !== selectedRecipe.id).slice(0, 3);
    }
    const youtubeQuery = encodeURIComponent(`préparation recette ${selectedRecipe.name}`);

    return (
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={springTransition}
        className="absolute inset-0 z-[100] bg-white overflow-hidden w-full flex flex-col"
      >
        <div className="absolute top-0 inset-x-0 z-[110] pointer-events-none p-6 pt-12">
          <div className="relative w-full flex justify-between items-start pointer-events-none">
            <button onClick={goBack} className="w-10 h-10 bg-[#fb5607]/80 backdrop-blur-md rounded-full text-white flex items-center justify-center border border-white/30 shadow-lg shadow-[#fb5607]/20 pointer-events-auto"><ChevronLeft size={24} /></button>
            <button onClick={() => toggleFavorite(selectedRecipe.id)} className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-md transition-all pointer-events-auto ${currentUser?.favorites.includes(selectedRecipe.id) ? 'bg-white border-white text-rose-500' : 'bg-white border-stone-100 text-stone-400'}`}><Heart size={20} fill={currentUser?.favorites.includes(selectedRecipe.id) ? 'currentColor' : 'none'} /></button>
          </div>
        </div>

        <div ref={detailScrollRef} className="flex-1 overflow-y-auto no-scrollbar pb-36 relative min-h-0 bg-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRecipe.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={springTransition}
              className="absolute inset-x-0 top-0"
            >
              <div className="relative h-[40vh] w-full shrink-0">
                <img src={selectedRecipe.image} className="w-full h-full object-cover" alt={selectedRecipe.name} />
              </div>
              <div className="p-6 -mt-8 bg-white rounded-t-[32px] relative z-10 min-h-screen shadow-[0_-20px_40px_rgba(0,0,0,0.05)]">
                <h1 className="text-2xl font-black text-stone-900 mb-2 leading-tight">{selectedRecipe.name}</h1>
                <p className="text-[#fb5607] font-black text-xs mb-6 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={14} />{selectedRecipe.region}</p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="bg-stone-50/80 p-4 rounded-[24px] flex flex-col items-center border border-stone-100/50">
                    <Clock size={18} className="text-[#fb5607] mb-2" />
                    <span className="text-[10px] uppercase font-black text-stone-400">{t.prepTime}</span>
                    <span className="text-sm font-black text-stone-800 tracking-tight">{selectedRecipe.prepTime}</span>
                  </div>
                  <div className="bg-stone-50/80 p-4 rounded-[24px] flex flex-col items-center border border-stone-100/50">
                    <Flame size={18} className="text-[#fb5607] mb-2" />
                    <span className="text-[10px] uppercase font-black text-stone-400">{t.cookTime}</span>
                    <span className="text-sm font-black text-stone-800 tracking-tight">{selectedRecipe.cookTime}</span>
                  </div>
                  <div className="bg-stone-50/80 p-4 rounded-[24px] flex flex-col items-center border border-stone-100/50">
                    <UtensilsCrossed size={18} className="text-[#fb5607] mb-2" />
                    <span className="text-[10px] uppercase font-black text-stone-400">{t.level}</span>
                    <span className="text-sm font-black text-stone-800 tracking-tight">{selectedRecipe.difficulty}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-stone-900 mb-4 tracking-tight">{t.ingredients}</h3>
                <ul className="space-y-2.5 mb-8">
                  {selectedRecipe.ingredients?.map((ing, i) => (
                    <li key={i} className="flex justify-between p-4 bg-stone-50 rounded-2xl text-sm font-bold border border-stone-100/50">
                      <span className="text-stone-700">{ing.item}</span>
                      <span className="text-[#fb5607]">{ing.amount}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-black text-stone-900 mb-4 tracking-tight">{t.preparation}</h3>
                <div className="space-y-6 mb-8">
                  {selectedRecipe.steps?.map((step, i) => (
                    <div key={i} className="flex gap-5">
                      <span className="w-7 h-7 flex-shrink-0 bg-[#fb5607] text-white rounded-xl text-xs flex items-center justify-center font-black shadow-lg shadow-[#fb5607]/20">{i + 1}</span>
                      <p className="text-stone-600 text-[13px] font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>

                <hr className="mb-8 border-stone-100" />

                <h3 className="text-lg font-black text-stone-900 mb-4 tracking-tight">{t.nutrition}</h3>
                <div className="bg-stone-50 border border-stone-100 rounded-3xl p-5 mb-10 shadow-inner">
                  <div className="grid grid-cols-4 gap-2 text-center divide-x divide-stone-200/60">
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">{t.calories}</span>
                      <span className="text-lg font-black text-[#fb5607]">{250 + (selectedRecipe.id.length * 15) % 300}</span>
                      <span className="text-[9px] text-stone-400 font-bold block mt-0.5">kcal</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">{t.proteins}</span>
                      <span className="text-lg font-black text-stone-900">{10 + (selectedRecipe.id.length * 2) % 30}</span>
                      <span className="text-[9px] text-stone-400 font-bold block mt-0.5">g</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">{t.carbs}</span>
                      <span className="text-lg font-black text-stone-900">{20 + (selectedRecipe.id.length * 5) % 50}</span>
                      <span className="text-[9px] text-stone-400 font-bold block mt-0.5">g</span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1.5">{t.lipids}</span>
                      <span className="text-lg font-black text-stone-900">{5 + (selectedRecipe.id.length * 3) % 25}</span>
                      <span className="text-[9px] text-stone-400 font-bold block mt-0.5">g</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-black text-stone-900 mb-4 tracking-tight">{t.videoGuide}</h3>
                <div className="mb-10 rounded-[32px] overflow-hidden bg-stone-900 h-56 relative shadow-xl group border border-stone-200">
                  <iframe
                    className="w-full h-full absolute inset-0 z-10"
                    src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent('recette ' + selectedRecipe.name)}&controls=1`}
                    title="Tutoriel de préparation"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                {related.length > 0 && (
                  <>
                    <h3 className="text-lg font-black text-stone-900 mb-4 tracking-tight">{t.similarDishes}</h3>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 pr-6 -mr-6">
                      {related.map(r => (
                        <motion.div
                          whileTap={{ scale: 0.95 }}
                          key={r.id}
                          onClick={() => {
                            // Scroll back to top for the new recipe
                            const container = document.querySelector('.overflow-y-auto');
                            if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
                            setSelectedRecipe(r);
                          }}
                          className="flex-shrink-0 w-36 cursor-pointer group"
                        >
                          <div className="h-32 rounded-[24px] overflow-hidden mb-3 relative shadow-md border border-stone-100 transition-transform group-hover:scale-95 duration-500">
                            <img src={r.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={r.name} />
                          </div>
                          <h4 className="font-bold text-sm text-stone-900 leading-tight truncate mb-1">{r.name}</h4>
                          <span className="text-[10px] font-black text-stone-400 flex items-center gap-1 uppercase tracking-tighter">
                            <Clock size={10} className="text-[#fb5607]" /> {r.cookTime} • <DifficultyBadge difficulty={r.difficulty} t={t} />
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const renderAuth = () => (
    <div className="flex-1 flex flex-col bg-white p-8 justify-center h-full">
      <div className="text-center mb-10">
        <img src="/images/auth_logo.png" className="w-24 h-24 mx-auto mb-6 object-contain" alt="AfroCuisto Logo" />
        <h1 className="text-3xl font-black text-stone-800 tracking-tight">AfroCuisto</h1>
      </div>
      <div className="bg-stone-50 p-1 rounded-2xl flex mb-8">
        <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-xl font-bold ${authMode === 'login' ? 'bg-white shadow-sm' : 'text-stone-400'}`}>Connexion</button>
        <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-xl font-bold ${authMode === 'signup' ? 'bg-white shadow-sm' : 'text-stone-400'}`}>Inscription</button>
      </div>
      <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} className="space-y-4">
        {authMode === 'signup' && <input type="text" placeholder="Nom complet" required value={authFormData.name} onChange={e => setAuthFormData({ ...authFormData, name: e.target.value })} className="w-full bg-stone-50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium" />}
        <input type="email" placeholder="Email" required value={authFormData.email} onChange={e => setAuthFormData({ ...authFormData, email: e.target.value })} className="w-full bg-stone-50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium" />
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mot de passe"
            required
            value={authFormData.password}
            onChange={e => setAuthFormData({ ...authFormData, password: e.target.value })}
            className="w-full bg-stone-50 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-terracotta/20 font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-400 p-2 hover:text-terracotta transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <button type="submit" className="w-full bg-terracotta text-white py-4 rounded-2xl font-bold shadow-lg shadow-terracotta/20">{authMode === 'login' ? 'Se connecter' : "C'est parti !"}</button>
      </form>
    </div>
  );

  // --- Return JSX ---

  if (!currentUser) return <div className="h-screen bg-stone-50 max-w-md mx-auto relative overflow-hidden flex flex-col shadow-2xl pt-[env(safe-area-inset-top,20px)]">{renderAuth()}</div>;

  return (
    <div className="h-screen bg-stone-50 max-w-md mx-auto shadow-2xl relative overflow-hidden flex flex-col transition-all pt-[env(safe-area-inset-top,20px)]">
      <main className="flex-1 overflow-y-auto no-scrollbar relative min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={springTransition} className="h-full">{renderHome()}</motion.div>}
          {activeTab === 'search' && <motion.div key="search" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={springTransition} className="h-full">{renderExplorer()}</motion.div>}
          {activeTab === 'favs' && <motion.div key="favs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={springTransition} className="h-full">{renderFavorites()}</motion.div>}
          {activeTab === 'profile' && <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={springTransition} className="h-full">{renderProfile()}</motion.div>}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {selectedRecipe && renderDetail()}
      </AnimatePresence>

      <AnimatePresence>
        {!selectedRecipe && (
          <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 500 }}
            className="absolute bottom-6 left-6 right-6 bg-[#fb5607] backdrop-blur-3xl border border-[#fb5607]/80 px-8 py-4 rounded-[32px] flex justify-between items-center z-[110] shadow-[0_20px_40px_rgba(251,86,7,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => navigateTo(item.id)} className={`flex flex-col items-center relative transition-all duration-300 ${isActive ? 'text-[#fb5607]' : 'text-white/70 hover:text-white'}`}>
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    className={`p-2.5 rounded-2xl relative transition-all duration-300 ${isActive ? 'bg-white text-[#fb5607] shadow-lg shadow-black/10 scale-110 -translate-y-2' : ''}`}
                  >
                    <Icon size={24} fill={isActive ? 'currentColor' : 'none'} strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                </button>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
