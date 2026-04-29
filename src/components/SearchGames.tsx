"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchGames, getGenres, getPlatforms } from "@/services/rawg";
import { Search, Loader2, Plus, Filter, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LibraryItem } from "@/types/game";

interface SearchGamesProps {
  onAddGame: (game: any) => void;
  library?: LibraryItem[];
}

export default function SearchGames({ onAddGame, library = [] }: SearchGamesProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [genres, setGenres] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);

  useEffect(() => {
    getGenres().then(data => setGenres(data.results)).catch(console.error);
    getPlatforms().then(data => setPlatforms(data.results)).catch(console.error);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["searchGames", debouncedQuery, selectedGenre, selectedPlatform],
    queryFn: () => searchGames(debouncedQuery, 1, { 
      genres: selectedGenre, 
      platforms: selectedPlatform 
    }),
    enabled: debouncedQuery.length > 2 || selectedGenre !== "" || selectedPlatform !== "",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  const isGameInLibrary = (gameId: number) => {
    return library.some((item) => item.gameId === gameId);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-violet-400 transition-colors" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nhập tên game để tìm kiếm..."
              className="block w-full pl-12 pr-4 py-4 bg-slate-900 border border-slate-800 rounded-3xl focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-3xl border transition-all flex items-center gap-2 font-bold ${
              showFilters || selectedGenre || selectedPlatform
                ? "bg-violet-600 border-violet-500 text-white"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Filter className="h-5 w-5" />
            Lọc
          </button>
          <button
            type="submit"
            className="px-8 py-4 bg-white text-black rounded-3xl font-black hover:scale-105 transition-all shadow-xl shadow-white/5"
          >
            TÌM KIẾM
          </button>
        </form>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Thể loại</label>
                  <select
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">Tất cả thể loại</option>
                    {genres.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nền tảng</label>
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">Tất cả nền tảng</option>
                    {platforms.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                
                {(selectedGenre || selectedPlatform) && (
                  <button
                    onClick={() => {
                      setSelectedGenre("");
                      setSelectedPlatform("");
                    }}
                    className="col-span-full flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" /> Xóa tất cả bộ lọc
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
              <p className="text-slate-500 font-bold animate-pulse">Đang tìm kiếm kho game...</p>
            </div>
          ) : data?.results?.map((game: any) => {
            const inLibrary = isGameInLibrary(game.id);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-violet-500/50 transition-all shadow-xl"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={game.background_image || "https://via.placeholder.com/600x400?text=No+Image"}
                    alt={game.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  
                  {/* DLC Badge */}
                  {(game.name.toLowerCase().includes("dlc") || 
                    game.name.toLowerCase().includes("expansion") || 
                    game.tags?.some((t: any) => t.slug === "dlc")) && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-amber-500 text-black text-[10px] font-black uppercase rounded-xl shadow-xl">
                      DLC / Mở rộng
                    </div>
                  )}

                  {game.metacritic && (
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-lg text-white font-black text-xs ${
                      game.metacritic >= 75 ? "bg-green-600" : game.metacritic >= 50 ? "bg-yellow-600" : "bg-red-600"
                    }`}>
                      {game.metacritic}
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  <h3 className="font-bold text-xl text-white line-clamp-2 h-14 flex items-center leading-tight">{game.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Phát hành</p>
                      <p className="text-sm font-bold text-slate-300">
                        {game.released ? new Date(game.released).getFullYear() : "TBA"}
                      </p>
                    </div>
                    <button
                      onClick={() => !inLibrary && onAddGame(game)}
                      disabled={inLibrary}
                      className={`p-4 rounded-2xl transition-all shadow-lg ${
                        inLibrary 
                          ? "bg-slate-800 text-slate-500 cursor-default" 
                          : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/20 active:scale-90"
                      }`}
                      title={inLibrary ? "Đã có trong thư viện" : "Thêm vào thư viện"}
                    >
                      {inLibrary ? <CheckCircle2 className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {!isLoading && debouncedQuery && data?.results?.length === 0 && (
            <div className="col-span-full text-center py-20 space-y-4">
              <p className="text-slate-500 font-bold">Không tìm thấy game nào phù hợp với yêu cầu của bạn.</p>
              <button onClick={() => { setQuery(""); setDebouncedQuery(""); setSelectedGenre(""); setSelectedPlatform(""); }} className="text-violet-500 font-bold hover:underline">
                Xóa tất cả tìm kiếm
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
