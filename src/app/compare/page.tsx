"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { searchGames, getGameDetails } from "@/services/rawg";
import { Scale, Search, VS, Star, Users, Monitor, Zap, X, Plus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ComparePage() {
  const [game1, setGame1] = useState<any>(null);
  const [game2, setGame2] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [activeSlot, setActiveSlot] = useState<1 | 2 | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchGames(searchQuery);
        setResults(data.results);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const selectGame = async (gameId: number) => {
    try {
      const details = await getGameDetails(gameId);
      if (activeSlot === 1) setGame1(details);
      else if (activeSlot === 2) setGame2(details);
      setActiveSlot(null);
      setSearchQuery("");
      setResults([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex p-4 bg-violet-600/10 rounded-3xl mb-4">
              <Scale className="h-10 w-10 text-violet-500" />
            </div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
              So sánh đối đầu
            </h1>
            <p className="text-slate-400 font-medium max-w-xl mx-auto">Đặt hai huyền thoại lên bàn cân để tìm ra trải nghiệm đỉnh cao nhất dành cho bạn.</p>
          </div>

          {/* Comparison Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 relative">
            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:flex h-20 w-20 bg-violet-600 rounded-full items-center justify-center border-8 border-slate-950 shadow-2xl shadow-violet-500/40">
              <span className="text-2xl font-black text-white italic">VS</span>
            </div>

            {/* Slot 1 */}
            <CompareSlot 
              game={game1} 
              onClear={() => setGame1(null)} 
              onSearch={() => setActiveSlot(1)} 
              otherGame={game2}
            />

            {/* Slot 2 */}
            <CompareSlot 
              game={game2} 
              onClear={() => setGame2(null)} 
              onSearch={() => setActiveSlot(2)} 
              otherGame={game1}
              isRight
            />
          </div>

          {/* Detailed Comparison Table */}
          {game1 && game2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-xl font-black text-white italic uppercase flex items-center gap-3">
                  <Info className="h-6 w-6 text-violet-400" />
                  Bảng so sánh thông số
                </h3>
              </div>
              
              <div className="divide-y divide-slate-800/50">
                <ComparisonRow label="Điểm Metacritic" val1={game1.metacritic} val2={game2.metacritic} isBetterHigher />
                <ComparisonRow label="Đánh giá RAWG" val1={game1.rating} val2={game2.rating} isBetterHigher />
                <ComparisonRow label="Thời gian chơi (h)" val1={game1.playtime} val2={game2.playtime} isBetterHigher />
                <ComparisonRow label="Ngày phát hành" val1={game1.released} val2={game2.released} />
                <ComparisonRow label="Thành tựu" val1={game1.achievements_count} val2={game2.achievements_count} isBetterHigher />
                <ComparisonRow label="Nhà phát triển" val1={game1.developers?.[0]?.name} val2={game2.developers?.[0]?.name} />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Search Modal */}
      <AnimatePresence>
        {activeSlot && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSlot(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                <Search className="h-6 w-6 text-slate-500" />
                <input 
                  autoFocus
                  type="text"
                  placeholder="Nhập tên game để so sánh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none text-xl font-bold text-white outline-none placeholder:text-slate-600"
                />
                <button onClick={() => setActiveSlot(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                  <X className="h-6 w-6 text-slate-500" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {loading ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
                  </div>
                ) : results.length > 0 ? (
                  results.map((game) => (
                    <button
                      key={game.id}
                      onClick={() => selectGame(game.id)}
                      className="w-full p-4 hover:bg-white/5 rounded-2xl flex items-center gap-4 transition-all text-left group"
                    >
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-800">
                        <img src={game.background_image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white group-hover:text-violet-400 transition-colors truncate">{game.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{game.released?.split("-")[0]} • {game.rating} Star</p>
                      </div>
                    </button>
                  ))
                ) : searchQuery.length >= 3 ? (
                  <div className="py-12 text-center text-slate-500 font-medium">Không tìm thấy kết quả nào.</div>
                ) : (
                  <div className="py-12 text-center text-slate-500 font-medium">Nhập ít nhất 3 ký tự để tìm kiếm.</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompareSlot({ game, onClear, onSearch, otherGame, isRight = false }: any) {
  return (
    <div className={`relative min-h-[400px] flex flex-col p-8 md:p-12 ${isRight ? "lg:border-l lg:border-slate-800 lg:items-end" : "lg:items-start"}`}>
      <AnimatePresence mode="wait">
        {game ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            key={game.id}
            className={`w-full max-w-md space-y-6 flex flex-col ${isRight ? "items-end text-right" : "items-start text-left"}`}
          >
            <div className="relative group w-full aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
              <img src={game.background_image} className="w-full h-full object-cover" alt="" />
              <button 
                onClick={onClear}
                className="absolute top-4 right-4 h-10 w-10 bg-black/50 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">{game.name}</h2>
              <div className={`flex items-center gap-3 ${isRight ? "flex-row-reverse" : ""}`}>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-black text-white">{game.rating}</span>
                </div>
                <span className="text-slate-600 font-black tracking-widest">•</span>
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">{game.released?.split("-")[0]}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onSearch}
            className="w-full max-w-sm aspect-square lg:aspect-video rounded-[3rem] border-2 border-dashed border-slate-800 hover:border-violet-500 hover:bg-violet-500/5 transition-all flex flex-col items-center justify-center gap-4 group"
          >
            <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
              <Plus className="h-8 w-8 text-slate-500 group-hover:text-white" />
            </div>
            <p className="font-black text-slate-600 uppercase tracking-widest group-hover:text-violet-500">Chọn game {isRight ? "thứ hai" : "đầu tiên"}</p>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function ComparisonRow({ label, val1, val2, isBetterHigher }: any) {
  const isBetter = (v1: any, v2: any) => {
    if (v1 === v2) return null;
    if (typeof v1 === "number" && typeof v2 === "number") {
      return isBetterHigher ? (v1 > v2 ? 1 : 2) : (v1 < v2 ? 1 : 2);
    }
    return null;
  };

  const better = isBetter(val1, val2);

  return (
    <div className="grid grid-cols-3 items-center">
      <div className={`px-8 py-6 text-sm font-bold transition-all ${better === 1 ? "text-violet-400 bg-violet-400/5" : "text-slate-400"}`}>
        {val1 || "N/A"}
      </div>
      <div className="py-6 text-center">
        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <div className={`px-8 py-6 text-right text-sm font-bold transition-all ${better === 2 ? "text-violet-400 bg-violet-400/5" : "text-slate-400"}`}>
        {val2 || "N/A"}
      </div>
    </div>
  );
}
