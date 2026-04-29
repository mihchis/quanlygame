"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchGames } from "@/services/rawg";
import { Search, Loader2, Plus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LibraryItem } from "@/types/game";

interface SearchGamesProps {
  onAddGame: (game: any) => void;
  library?: LibraryItem[];
}

export default function SearchGames({ onAddGame, library = [] }: SearchGamesProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["searchGames", debouncedQuery],
    queryFn: () => searchGames(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  const isGameInLibrary = (gameId: number) => {
    return library.some((item) => item.gameId === gameId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              // Simple debounce
              const timer = setTimeout(() => setDebouncedQuery(e.target.value), 500);
              return () => clearTimeout(timer);
            }}
            placeholder="Tìm kiếm game..."
            className="block w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all glass-dark"
          />
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            </div>
          ) : data?.results?.filter((g: any) => !isGameInLibrary(g.id)).map((game: any) => {
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 transition-all"
              >
                <div className="aspect-video relative overflow-hidden">
                  {game.background_image ? (
                    <img
                      src={game.background_image}
                      alt={game.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <span className="text-slate-500">Không có ảnh</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  
                  {/* DLC Badge */}
                  {(game.name.toLowerCase().includes("dlc") || 
                    game.name.toLowerCase().includes("expansion") || 
                    game.tags?.some((t: any) => t.slug === "dlc")) && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-black text-[8px] font-black uppercase rounded shadow-lg">
                      DLC / Mở rộng
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-slate-100 line-clamp-2 h-10 flex items-center">{game.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-slate-400">
                      {game.released ? new Date(game.released).getFullYear() : "TBA"}
                    </span>
                    <button
                      onClick={() => onAddGame(game)}
                      className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-500/20"
                      title="Thêm vào thư viện"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
