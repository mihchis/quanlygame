"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { 
  Calendar as CalendarIcon, 
  Loader2, 
  Plus, 
  Bell, 
  ChevronLeft, 
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLibrary } from "@/hooks/useLibrary";
import toast from "react-hot-toast";

const API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY;

export default function CalendarPage() {
  const { addToLibrary, library } = useLibrary();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { data, isLoading } = useQuery({
    queryKey: ["upcomingGames", year, month],
    queryFn: async () => {
      const start = new Date(year, month, 1).toISOString().split("T")[0];
      const end = new Date(year, month + 1, 0).toISOString().split("T")[0];
      const res = await axios.get(`https://api.rawg.io/api/games?key=${API_KEY}&dates=${start},${end}&ordering=released&page_size=40`);
      return res.data;
    }
  });

  const handleGameClick = async (game: any) => {
    setIsFetchingDetail(true);
    try {
      const res = await axios.get(`https://api.rawg.io/api/games/${game.id}?key=${API_KEY}`);
      setSelectedGame(res.data);
    } catch (error) {
      toast.error("Không thể tải thông tin game");
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const gamesByDate = useMemo(() => {
    const map: Record<number, any[]> = {};
    data?.results?.forEach((game: any) => {
      const day = new Date(game.released).getDate();
      if (!map[day]) map[day] = [];
      map[day].push(game);
    });
    return map;
  }, [data]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isGameInLibrary = (gameId: number) => {
    return library.some((item) => item.gameId === gameId);
  };

  const days = useMemo(() => {
    const arr = [];
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      arr.push({ day: null, games: [] });
    }
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push({ day: i, games: gamesByDate[i] || [] });
    }
    return arr;
  }, [firstDayOfMonth, daysInMonth, gamesByDate]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 rounded-2xl">
                <CalendarIcon className="h-8 w-8 text-pink-500" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white">Lịch Phát Hành</h1>
                <p className="text-slate-400">Khám phá các tựa game ra mắt trong tháng.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="px-4 font-bold text-white min-w-[150px] text-center">
                Tháng {month + 1}, {year}
              </div>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/50">
              {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((d) => (
                <div key={d} className="py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-r border-slate-800 last:border-0">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {days.map((d, i) => (
                <div 
                  key={i} 
                  className={`min-h-[140px] border-r border-b border-slate-800 p-2 last:border-r-0 transition-colors ${d.day ? "bg-slate-900/20" : "bg-slate-950/40 opacity-30"}`}
                >
                  {d.day && (
                    <div className="flex flex-col h-full gap-2">
                      <span className={`text-sm font-bold ${d.games.length > 0 ? "text-pink-400" : "text-slate-600"}`}>
                        {d.day}
                      </span>
                      
                      <div className="flex flex-col gap-1.5 flex-1">
                        {d.games.slice(0, 3).map((game) => {
                          const inLibrary = isGameInLibrary(game.id);
                          return (
                            <div 
                              key={game.id}
                              onClick={() => handleGameClick(game)}
                              className={`group relative flex items-center gap-2 p-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                                inLibrary 
                                  ? "bg-green-500/10 border-green-500/20 text-green-400" 
                                  : "bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:border-slate-600"
                              }`}
                            >
                              <img src={game.background_image} alt="" className="h-5 w-5 rounded object-cover shrink-0" />
                              <span className="truncate flex-1">{game.name}</span>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  !inLibrary && addToLibrary(game, "plan-to-play");
                                }}
                                className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${inLibrary ? "text-green-500" : "text-slate-400 hover:text-white"}`}
                              >
                                {inLibrary ? <Bell className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                              </button>
                            </div>
                          );
                        })}
                        {d.games.length > 3 && (
                          <div className="text-[9px] font-black text-slate-500 text-center uppercase tracking-tighter py-1">
                            + {d.games.length - 3} game khác
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selectedGame && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedGame(null)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
                >
                  <div className="aspect-video relative">
                    <img src={selectedGame.background_image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/40" />
                    <button 
                      onClick={() => setSelectedGame(null)}
                      className="absolute top-4 right-4 p-2 bg-slate-950/50 hover:bg-slate-950 text-white rounded-full transition-colors"
                    >
                      <Plus className="h-5 w-5 rotate-45" />
                    </button>
                  </div>

                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-3xl font-black text-white leading-tight">{selectedGame.name}</h2>
                      <div className="shrink-0 px-4 py-2 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400 font-bold text-sm">
                        {new Date(selectedGame.released).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedGame.genres?.map((g: any) => (
                        <span key={g.id} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {g.name}
                        </span>
                      ))}
                    </div>

                    <div 
                      className="text-slate-400 text-sm leading-relaxed max-h-40 overflow-y-auto pr-4 custom-scrollbar"
                      dangerouslySetInnerHTML={{ __html: selectedGame.description }}
                    />

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => {
                          const inLibrary = isGameInLibrary(selectedGame.id);
                          if (!inLibrary) {
                            addToLibrary(selectedGame, "plan-to-play");
                          }
                          setSelectedGame(null);
                        }}
                        disabled={isGameInLibrary(selectedGame.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all ${
                          isGameInLibrary(selectedGame.id)
                            ? "bg-slate-800 text-slate-500 cursor-default"
                            : "bg-white text-slate-950 hover:bg-slate-200"
                        }`}
                      >
                        {isGameInLibrary(selectedGame.id) ? <Bell className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                        {isGameInLibrary(selectedGame.id) ? "Đã nằm trong danh sách nhắc nhở" : "Thêm vào danh sách nhắc nhở"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {(isLoading || isFetchingDetail) && (
            <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-[70]">
              <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
