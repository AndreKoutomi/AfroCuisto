import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, MapPin, Clock, Flame, ChevronRight, Sparkles } from 'lucide-react';
import { Recipe, User } from '../types';

interface HeroCarouselV2Props {
  recipes: Recipe[];
  setSelectedRecipe: (r: Recipe) => void;
  currentUser: User | null;
  toggleFavorite: (id: string) => void;
  t: any;
  isDark: boolean;
}

const AUTOPLAY_DURATION = 5000;

const HeroCarouselV2: React.FC<HeroCarouselV2Props> = ({
  recipes,
  setSelectedRecipe,
  currentUser,
  toggleFavorite,
  t,
  isDark
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (recipes.length <= 1 || isPaused) return;

    const animate = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / AUTOPLAY_DURATION, 1);
      setProgress(p);

      if (p >= 1) {
        setActiveIndex(prev => (prev + 1) % recipes.length);
        startTimeRef.current = null;
        setProgress(0);
      } else {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, recipes.length, isPaused]);

  if (!recipes.length) return null;

  const recipe = recipes[activeIndex];
  const isFav = currentUser?.favorites.includes(recipe.id);

  return (
    <section
      className="relative mx-4 mb-8 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Magazine-style container */}
      <div className="hero-v2-container">
        {/* Background gradient */}
        <div className="hero-v2-bg" />
        
        {/* Main content area */}
        <div className="relative h-[75vh] max-h-[580px] min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {/* Split layout: Image left, Content right */}
              <div className="grid grid-cols-1 md:grid-cols-2 h-full gap-0">
                
                {/* LEFT: Image Section */}
                <div className="relative overflow-hidden rounded-l-[32px]">
                  <motion.img
                    src={recipe.image}
                    alt={recipe.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Floating badges on image */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {recipe.isFeatured && (
                      <motion.span
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/20 backdrop-blur-xl border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider"
                      >
                        <Sparkles size={12} className="text-amber-400" />
                        Coup de cœur
                      </motion.span>
                    )}
                    <motion.span
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/30 text-white text-xs font-black uppercase tracking-wider"
                    >
                      <MapPin size={12} className="text-[#fb5607]" />
                      {recipe.region}
                    </motion.span>
                  </div>

                  {/* Rating badge - bottom left */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-6 left-6 flex items-center gap-2 px-4 py-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20"
                  >
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                    <span className="text-white font-black text-lg">
                      {recipe.rating ? recipe.rating.toFixed(1) : '4.8'}
                    </span>
                    <span className="text-white/60 text-sm font-medium">
                      ({Math.floor(Math.random() * 500) + 100} avis)
                    </span>
                  </motion.div>
                </div>

                {/* RIGHT: Content Section */}
                <div className="relative flex flex-col justify-between p-8 bg-white rounded-r-[32px]">
                  {/* Top: Favorite button */}
                  <div className="flex justify-end">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(recipe.id);
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isFav
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                          : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      <Heart size={20} fill={isFav ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </motion.button>
                  </div>

                  {/* Middle: Recipe info */}
                  <div className="flex-1 flex flex-col justify-center">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-[#fb5607] text-xs font-black uppercase tracking-widest mb-3">
                        {recipe.category || 'Recette traditionnelle'}
                      </p>
                      <h2 className="text-4xl font-black text-stone-900 leading-tight mb-4 tracking-tight">
                        {recipe.name}
                      </h2>
                      <p className="text-stone-500 text-sm leading-relaxed mb-6 line-clamp-3">
                        {recipe.description || 'Une recette authentique qui célèbre les saveurs africaines avec élégance et tradition.'}
                      </p>
                    </motion.div>

                    {/* Info chips */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap gap-3 mb-8"
                    >
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                        <Clock size={16} className="text-[#fb5607]" />
                        <span className="text-stone-700 font-bold text-sm">{recipe.prepTime}</span>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-50 border border-stone-200">
                        <Flame size={16} className="text-rose-500" />
                        <span className="text-stone-700 font-bold text-sm">{recipe.difficulty}</span>
                      </div>
                    </motion.div>

                    {/* CTA button */}
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRecipe(recipe)}
                      className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-[#fb5607] to-[#ff6b1a] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#fb5607]/30 hover:shadow-2xl hover:shadow-[#fb5607]/40 transition-all"
                    >
                      Voir la recette
                      <ChevronRight size={18} strokeWidth={3} />
                    </motion.button>
                  </div>

                  {/* Bottom: Navigation dots */}
                  <div className="flex items-center justify-center gap-2 mt-6">
                    {recipes.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setActiveIndex(i);
                          setProgress(0);
                          startTimeRef.current = null;
                        }}
                        className="relative group"
                      >
                        <div
                          className={`h-1 rounded-full transition-all duration-300 ${
                            i === activeIndex
                              ? 'w-12 bg-[#fb5607]'
                              : 'w-1 bg-stone-300 group-hover:w-6 group-hover:bg-stone-400'
                          }`}
                        >
                          {i === activeIndex && (
                            <motion.div
                              className="absolute inset-0 bg-[#fb5607] rounded-full origin-left"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: progress }}
                              transition={{ duration: 0.1 }}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Styles inline for the new design */}
      <style jsx>{`
        .hero-v2-container {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
        }

        .hero-v2-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
          z-index: -1;
        }

        .dark .hero-v2-bg {
          background: linear-gradient(135deg, #1a1a1d 0%, #0f0f11 100%);
        }

        .dark .bg-white {
          background-color: #1a1a1d !important;
        }

        .dark .text-stone-900 {
          color: #f2f2f4 !important;
        }

        .dark .text-stone-500 {
          color: #9a9a9d !important;
        }

        .dark .text-stone-700 {
          color: #bababd !important;
        }

        .dark .bg-stone-50 {
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        .dark .border-stone-200 {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .dark .bg-stone-100 {
          background-color: rgba(255, 255, 255, 0.08) !important;
        }

        .dark .text-stone-400 {
          color: #78787b !important;
        }
      `}</style>
    </section>
  );
};

export default HeroCarouselV2;
