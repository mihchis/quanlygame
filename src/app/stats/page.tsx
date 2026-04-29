"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getTrendingGames, getSuggestedGames } from "@/services/rawg";
import { BarChart3, TrendingUp, Star, Calendar, Users, Zap, Trophy, Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function GlobalStatsPage() {
  const [trending, setTrending] = useState<any[]>([]);
  const [topRated, setTopRated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trendingData = await getTrendingGames(1);
        setTrending(trendingData.results.slice(0, 10));
        
        // Use suggested or just high rated from trending for demo
        const sorted = [...trendingData.results].sort((a, b) => b.metacritic - a.metacritic);
        setTopRated(sorted.slice(0, 10));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-violet-500" />
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                Thống kê Toàn cầu
              </h1>
            </div>
            <p className="text-slate-400 text-lg font-medium">Cập nhật xu hướng, bảng xếp hạng và các con số ấn tượng nhất từ cộng đồng hàng triệu game thủ RAWG.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Trending Now List */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                    Đang thịnh hành nhất
                  </h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LIVE UPDATE</span>
                </div>

                <div className="space-y-4">
                  {trending.map((game, idx) => (
                    <Link 
                      key={game.id}
                      href={`/game/${game.id}`}
                      className="block group"
                    >
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-slate-900 border border-slate-800 rounded-[2rem] p-4 flex items-center gap-6 group-hover:border-blue-500/50 group-hover:bg-white/5 transition-all"
                      >
                        <div className="text-3xl font-black italic text-slate-800 group-hover:text-blue-500/20 transition-colors w-12 text-center">
                          {idx + 1}
                        </div>
                        <div className="h-16 w-16 shrink-0 rounded-2xl overflow-hidden relative">
                          <img src={game.background_image} className="w-full h-full object-cover" alt={game.name} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-white uppercase italic text-sm truncate group-hover:text-blue-400 transition-colors">{game.name}</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-slate-500" />
                              <span className="text-[10px] font-bold text-slate-500">{(game.added / 1000).toFixed(1)}k người chơi</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-[10px] font-black text-white">{game.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-slate-800 group-hover:bg-blue-600 rounded-xl text-white transition-all shadow-lg">
                          <Play className="h-4 w-4 fill-current" />
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Critical Hits (Metacritic) */}
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    Đánh giá từ chuyên gia
                  </h3>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">METACRITIC SCORE</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {topRated.map((game, idx) => (
                    <Link 
                      key={game.id}
                      href={`/game/${game.id}`}
                      className="block group"
                    >
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 space-y-4 group-hover:border-yellow-500/30 group-hover:bg-white/5 transition-all relative overflow-hidden h-full"
                      >
                        <div className="absolute top-4 right-4 z-10">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg border-2 ${game.metacritic >= 90 ? "border-green-500 text-green-500 bg-green-500/10" : "border-yellow-500 text-yellow-500 bg-yellow-500/10"}`}>
                            {game.metacritic || "??"}
                          </div>
                        </div>
                        <div className="aspect-video rounded-3xl overflow-hidden relative">
                          <img src={game.background_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={game.name} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4">
                            <h4 className="font-black text-white uppercase italic text-sm line-clamp-1 group-hover:text-yellow-400 transition-colors">{game.name}</h4>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <div className="flex gap-1">
                            {game.parent_platforms?.slice(0, 3).map((p: any) => (
                              <div key={p.platform.id} className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                                <Zap className="h-3 w-3" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase">{game.released?.split("-")[0]}</span>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Insights Footer */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[3rem] p-12 text-center space-y-6 shadow-2xl shadow-violet-500/20">
            <h2 className="text-3xl font-black text-white italic uppercase">Bạn có biết?</h2>
            <p className="text-violet-100 max-w-2xl mx-auto font-medium">Hiện có hơn 500,000+ tựa game được lưu trữ trên RAWG, và mỗi ngày có trung bình 150+ game mới được phát hành trên tất cả các nền tảng.</p>
            <div className="flex flex-wrap justify-center gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-4xl font-black text-white">15M+</p>
                <p className="text-[10px] font-black text-violet-200 uppercase tracking-[0.2em]">Đánh giá người dùng</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="space-y-1">
                <p className="text-4xl font-black text-white">50+</p>
                <p className="text-[10px] font-black text-violet-200 uppercase tracking-[0.2em]">Nền tảng hỗ trợ</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="space-y-1">
                <p className="text-4xl font-black text-white">2.5M</p>
                <p className="text-[10px] font-black text-violet-200 uppercase tracking-[0.2em]">Hình ảnh chất lượng cao</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
