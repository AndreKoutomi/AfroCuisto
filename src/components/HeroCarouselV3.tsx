import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, MapPin, Clock, Flame, Play, Info } from 'lucide-react';
import { Recipe, User } from '../types';

const AUTOPLAY_DURATION = 5000; // 5 seconds

interface HeroCarouselV3Props {
  recipes: Recipe[];
  setSelectedRecipe: (recipe: Recipe) => void;
  currentUser: User | null;
  toggleFavorite: (id: string) => void;
  t: any;
  isDark: boolean;
}

const HeroCarouselV3: React.FC<HeroCarouselV3Props> = ({
  recipes,
  setSelectedRecipe,
  currentUser,
  toggleFavorite,
  t,
  isDark
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  if (!recipes.length) return null;

  const activeRecipe = recipes[activeIndex];
  const isFavorite = currentUser?.favorites.includes(activeRecipe.id);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    setProgress(0);
    startTimeRef.current = null;
  };

  const goNext = () => goToSlide((activeIndex + 1) % recipes.length);
  const goPrev = () => goToSlide((activeIndex - 1 + recipes.length) % recipes.length);

  // Auto-play animation
  useEffect(() => {
    if (recipes.length <= 1 || isPaused) return;

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / AUTOPLAY_DURATION, 1);
      setProgress(p);

      if (p >= 1) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, recipes.length, isPaused]);

  return (
    <section 
      className="relative w-full mx-auto overflow-hidden rounded-3xl"
      style={{ 
        height: 'clamp(420px, 75vh, 580px)',
        maxWidth: '100%',
        marginBottom: 24
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background avec effet de glow */}
      <div className="absolute inset-0 -z-10">
        <div 
          className="absolute inset-0 blur-3xl opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${isDark ? '#fb5607' : '#fb5607'}, transparent 70%)`
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeRecipe.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full h-full"
        >
          {/* Image de fond avec effet Ken Burns */}
          <motion.div 
            className="absolute inset-0"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 20, ease: "linear" }}
          >
            <img
              src={activeRecipe.image}
              alt={activeRecipe.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Overlays de gradient pour lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

          {/* Badges et Favoris en haut */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
            <div className="flex flex-col gap-2">
              {activeRecipe.category && (
                <span className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-white text-[10px] font-black uppercase tracking-widest">
                  {activeRecipe.category}
                </span>
              )}
              {activeRecipe.isFeatured && (
                <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/20 backdrop-blur-xl border border-amber-400/30 text-amber-300 text-[9px] font-black uppercase tracking-widest">
                  ⭐ Featured
                </span>
              )}
            </div>

            {/* Bouton Favori */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(activeRecipe.id);
              }}
              className={`p-3 rounded-full backdrop-blur-xl border transition-all ${
                isFavorite 
                  ? 'bg-rose-500 border-rose-500 text-white' 
                  : 'bg-white/15 border-white/25 text-white hover:bg-white/25'
              }`}
            >
              <Heart 
                size={20} 
                fill={isFavorite ? 'currentColor' : 'none'} 
                strokeWidth={2.5}
              />
            </motion.button>
          </div>

          {/* Contenu principal */}
          <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Titre principal */}
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-2xl tracking-tight">
                {activeRecipe.name}
              </h1>

              {/* Informations */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-bold text-white/90">
                {activeRecipe.region && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                    <MapPin size={14} className="text-amber-400" />
                    {activeRecipe.region}
                  </span>
                )}
                {activeRecipe.prepTime && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                    <Clock size={14} className="text-blue-400" />
                    {activeRecipe.prepTime}
                  </span>
                )}
                {activeRecipe.difficulty && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
                    <Flame size={14} className="text-rose-400" />
                    {activeRecipe.difficulty}
                  </span>
                )}
              </div>

              {/* Description (tronquée) */}
              {activeRecipe.description && (
                <p className="text-white/80 text-base leading-relaxed mb-6 max-w-2xl line-clamp-2">
                  {activeRecipe.description}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRecipe(activeRecipe)}
                  className="px-6 py-3.5 bg-white text-stone-900 rounded-full font-black text-sm uppercase tracking-wider flex items-center gap-2 shadow-2xl hover:bg-white/95 transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  Voir la recette
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRecipe(activeRecipe)}
                  className="px-6 py-3.5 bg-white/15 backdrop-blur-xl text-white rounded-full font-bold text-sm flex items-center gap-2 border border-white/25 hover:bg-white/25 transition-all"
                >
                  <Info size={16} />
                  Plus d'infos
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Navigation latérale */}
          {recipes.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-white hover:bg-white/25 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
              >
                <ChevronLeft size={24} strokeWidth={2.5} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-white hover:bg-white/25 transition-all opacity-0 hover:opacity-100 group-hover:opacity-100"
              >
                <ChevronRight size={24} strokeWidth={2.5} />
              </button>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Thumbnails de navigation en bas */}
      {recipes.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {recipes.map((recipe, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={recipe.id}
                onClick={() => goToSlide(index)}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  isActive 
                    ? 'w-24 h-16 border-white shadow-lg shadow-white/20' 
                    : 'w-16 h-12 border-white/40 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress * 100}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HeroCarouselV3;
