"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useLibrary } from "@/hooks/useLibrary";
import { GameStatus, LibraryItem } from "@/types/game";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  PlayCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

const statusColors = {
  playing: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  played: "text-green-400 bg-green-400/10 border-green-400/20",
  "plan-to-play": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

const statusIcons = {
  playing: <PlayCircle className="h-4 w-4" />,
  played: <CheckCircle2 className="h-4 w-4" />,
  "plan-to-play": <Clock className="h-4 w-4" />,
};

export default function LibraryPage() {
  const { library, loading, updateGameStatus, removeFromLibrary, updateGameProgress } = useLibrary();
  const [filter, setFilter] = useState<GameStatus | "all">("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const allPlatforms = Array.from(new Set(library.flatMap(i => i.platforms || []))).sort();

  const filteredLibrary = useMemo(() => {
    return library.filter(item => {
      const matchesStatus = filter === "all" || item.status === filter;
      const matchesPlatform = platformFilter === "all" || item.platforms?.includes(platformFilter);
      return matchesStatus && matchesPlatform;
    });
  }, [library, filter, platformFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, platformFilter]);

  // Grouping Logic - MANDATORY
  const groupedLibrary = useMemo(() => {
    const groups: Record<string, LibraryItem[]> = {};
    
    filteredLibrary.forEach(item => {
      // Improved heuristic: 
      // 1. Remove common suffixes and numbers to find the "Series Core"
      let seriesKey = item.name
        .split(":")[0] // Take part before colon (e.g., "The Witcher 3: Wild Hunt" -> "The Witcher 3")
        .replace(/\s+\d+.*$/, "") // Remove numbers and following text (e.g., "Borderlands 2" -> "Borderlands")
        .replace(/\s+(Edition|Remastered|Definitive|Complete|Collection|Anthology|Original).*$/i, "") // Remove common suffixes
        .trim();
      
      if (!seriesKey) seriesKey = item.name;

      if (!groups[seriesKey]) groups[seriesKey] = [];
      groups[seriesKey].push(item);
    });

    // Sort groups by number of games, then alphabetically
    return Object.entries(groups).sort((a, b) => {
      if (b[1].length !== a[1].length) return b[1].length - a[1].length;
      return a[0].localeCompare(b[0]);
    });
  }, [filteredLibrary]);

  const totalPages = Math.ceil(groupedLibrary.length / itemsPerPage);
  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return groupedLibrary.slice(start, start + itemsPerPage);
  }, [groupedLibrary, currentPage]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white">Thư viện của bạn</h1>
              <p className="text-slate-400 mt-2">Quản lý bộ sưu tập và theo dõi tiến độ chơi game của bạn.</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Platform Filter */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
                <span className="text-[10px] font-black text-slate-500 uppercase ml-2">Thiết bị:</span>
                <select 
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="bg-slate-900 text-sm font-bold text-white outline-none cursor-pointer pr-2"
                >
                  <option value="all" className="bg-slate-900">Tất cả</option>
                  {allPlatforms.map(p => (
                    <option key={p} value={p} className="bg-slate-900">{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-slate-900/50 border border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === "all" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "text-slate-400 hover:text-white"}`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => setFilter("playing")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === "playing" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-400 hover:text-white"}`}
            >
              Đang Chơi
            </button>
            <button
              onClick={() => setFilter("played")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === "played" ? "bg-green-600 text-white shadow-lg shadow-green-500/20" : "text-slate-400 hover:text-white"}`}
            >
              Đã Chơi
            </button>
            <button
              onClick={() => setFilter("plan-to-play")}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${filter === "plan-to-play" ? "bg-yellow-600 text-white shadow-lg shadow-yellow-500/20" : "text-slate-400 hover:text-white"}`}
            >
              Dự Định
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : paginatedGroups.length > 0 ? (
            <div className="space-y-12">
              <div className="space-y-12">
                {paginatedGroups.map(([series, games]) => (
                  <div key={series} className="space-y-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-2xl font-black text-white tracking-tight">{series}</h2>
                      <div className="h-px flex-1 bg-slate-800" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{games.length} Games</span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {games.map((item: any) => (
                        <LibraryCard 
                          key={item.id} 
                          item={item} 
                          updateGameStatus={updateGameStatus}
                          updateGameProgress={updateGameProgress}
                          removeFromLibrary={removeFromLibrary}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                              currentPage === page 
                                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" 
                                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 || 
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="text-slate-600">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-4">
              <p className="text-slate-400 font-medium">Thư viện trống hoặc không tìm thấy game phù hợp.</p>
              <Link href="/search" className="inline-block text-violet-400 hover:text-violet-300 font-medium">
                Đi đến tìm kiếm
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}

function LibraryCard({ item, updateGameStatus, updateGameProgress, removeFromLibrary }: any) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-violet-500/50 transition-all flex flex-col"
    >
      <div className="aspect-[16/10] relative overflow-hidden">
        <img
          src={item.backgroundImage}
          alt={item.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border backdrop-blur-md text-[10px] font-black uppercase tracking-widest ${statusColors[item.status as keyof typeof statusColors]}`}>
            {statusIcons[item.status as keyof typeof statusIcons]}
            {item.status === "playing" ? "Đang Chơi" : item.status === "played" ? "Đã Chơi" : "Dự Định"}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <h3 className="font-bold text-lg text-slate-100 line-clamp-2 h-14 flex items-center">{item.name}</h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <select
              value={item.status}
              onChange={(e) => updateGameStatus(item.id, e.target.value as GameStatus)}
              className="flex-1 bg-slate-800 text-slate-100 text-sm rounded-xl px-3 py-2 border border-slate-700 focus:ring-2 focus:ring-violet-500/50 outline-none transition-all cursor-pointer"
            >
              <option value="playing">Đang chơi</option>
              <option value="played">Đã chơi</option>
              <option value="plan-to-play">Dự định chơi</option>
            </select>

            <button
              onClick={() => removeFromLibrary(item.id)}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="Xóa khỏi thư viện"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {/* Platform Selection */}
          {item.platforms && item.platforms.length > 0 && (
            <select
              value={item.selectedPlatform || ""}
              onChange={(e) => updateGameProgress(item.id, { selectedPlatform: e.target.value })}
              className="w-full bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg px-2 py-1.5 border border-slate-700 focus:ring-1 focus:ring-violet-500/30 outline-none transition-all cursor-pointer uppercase tracking-wider"
            >
              <option value="" className="bg-slate-800">Chọn nền tảng...</option>
              {item.platforms.map((p: any) => (
                <option key={p} value={p} className="bg-slate-800">{p}</option>
              ))}
            </select>
          )}
        </div>

        <Link 
          href={`/library/${item.id}`}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-all"
        >
          Xem chi tiết & Tiến độ
        </Link>
      </div>
    </motion.div>
  );
}
