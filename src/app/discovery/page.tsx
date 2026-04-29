"use client";

import React, { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { getTrendingGames } from "@/services/rawg";
import { useLibrary } from "@/hooks/useLibrary";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, X, Star, Info, Gamepad2, Compass, Layers } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function DiscoveryPage() {
  const { library, addToLibrary } = useLibrary();
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const data = await getTrendingGames(Math.floor(Math.random() * 10) + 1);
        // Filter out games already in library
        const filtered = data.results.filter(
          (g: any) => !library.find((item) => item.gameId === g.id)
        );
        setGames(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, [library]);

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= games.length) return;

    if (direction === "right") {
      addToLibrary(games[currentIndex], "plan-to-play");
      toast.success(`Đã thêm ${games[currentIndex].name} vào Dự định chơi!`);
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const currentGame = games[currentIndex];

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-950 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full" />
          </div>

          <div className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-black text-white italic uppercase flex items-center justify-center gap-3">
                <Compass className="h-8 w-8 text-violet-500 animate-pulse" />
                Khám phá
              </h1>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em]">Vuốt phải để thích • Vuốt trái để bỏ qua</p>
            </div>

            <div className="relative aspect-[3/4] w-full">
              {loading ? (
                <div className="absolute inset-0 bg-slate-900 rounded-[3rem] border border-slate-800 flex items-center justify-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
                </div>
              ) : currentIndex < games.length ? (
                <AnimatePresence mode="popLayout">
                  <SwipeCard 
                    key={currentGame.id}
                    game={currentGame} 
                    onSwipe={handleSwipe}
                  />
                </AnimatePresence>
              ) : (
                <div className="absolute inset-0 bg-slate-900 rounded-[3rem] border border-slate-800 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="p-6 bg-slate-800 rounded-full">
                    <Gamepad2 className="h-12 w-12 text-slate-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase italic">Hết game rồi!</h3>
                    <p className="text-slate-500 text-sm font-medium">Bạn đã xem hết các gợi ý hiện tại. Hãy quay lại sau nhé!</p>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-3 bg-violet-600 text-white rounded-2xl font-black text-sm uppercase transition-all hover:scale-105"
                  >
                    Tải thêm gợi ý
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            {currentIndex < games.length && !loading && (
              <div className="flex items-center justify-center gap-8 pt-4">
                <button 
                  onClick={() => handleSwipe("left")}
                  className="h-16 w-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-red-500 shadow-xl hover:bg-red-500 hover:text-white transition-all hover:scale-110 active:scale-90"
                >
                  <X className="h-8 w-8" />
                </button>
                <button 
                  onClick={() => handleSwipe("right")}
                  className="h-20 w-20 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-2xl shadow-violet-500/40 hover:bg-violet-500 transition-all hover:scale-110 active:scale-90"
                >
                  <Heart className="h-10 w-10 fill-current" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function SwipeCard({ game, onSwipe }: { game: any, onSwipe: (dir: "left" | "right") => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const heartOpacity = useTransform(x, [50, 150], [0, 1]);
  const xOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.3 } }}
    >
      <div className="h-full w-full relative">
        <img 
          src={game.background_image} 
          className="h-full w-full object-cover pointer-events-none" 
          alt={game.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
        
        {/* Indicators */}
        <motion.div style={{ opacity: heartOpacity }} className="absolute top-10 left-10 p-4 border-4 border-violet-500 rounded-2xl rotate-[-15deg] pointer-events-none">
          <span className="text-4xl font-black text-violet-500 uppercase">THÍCH</span>
        </motion.div>
        <motion.div style={{ opacity: xOpacity }} className="absolute top-10 right-10 p-4 border-4 border-red-500 rounded-2xl rotate-[15deg] pointer-events-none">
          <span className="text-4xl font-black text-red-500 uppercase">BỎ QUA</span>
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-violet-600 rounded text-[10px] font-black text-white uppercase tracking-widest">
              {game.genres?.[0]?.name || "Game"}
            </div>
            {game.metacritic && (
              <div className="px-2 py-1 bg-green-500 rounded text-[10px] font-black text-white uppercase tracking-widest">
                MC: {game.metacritic}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">
              {game.name}
            </h2>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-black text-white">{game.rating} / 5</span>
              <span className="text-slate-500 font-bold text-xs">• {game.released?.split("-")[0]}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {game.parent_platforms?.slice(0, 4).map((p: any) => (
              <div key={p.platform.id} className="p-2 bg-white/10 rounded-xl text-white backdrop-blur-md">
                <Layers className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
