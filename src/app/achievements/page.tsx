"use client";

import React, { useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useLibrary } from "@/hooks/useLibrary";
import { Trophy, Star, Target, Shield, Flame, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AchievementsPage() {
  const { library, loading } = useLibrary();

  const stats = useMemo(() => {
    let totalAchieved = 0;
    let allAchievements: any[] = [];
    const completedGames = library.filter(g => g.status === "completed").length;

    library.forEach(game => {
      if (game.achievements) {
        game.achievements.forEach(ach => {
          if (ach.completed) {
            totalAchieved++;
            allAchievements.push({
              ...ach,
              gameName: game.name,
              gameId: game.id,
              backgroundImage: game.backgroundImage
            });
          }
        });
      }
    });

    // Sort by rarity (percent is string like "1.5", we want lower to be rarer)
    const rarest = [...allAchievements]
      .sort((a, b) => parseFloat(a.percent) - parseFloat(b.percent))
      .slice(0, 10);

    // Calculate Gamer Rank
    // Rank points = (Completed Games * 100) + (Achievements * 10)
    const rankPoints = (completedGames * 100) + (totalAchieved * 10);
    let rankTitle = "Newbie Gamer";
    let rankColor = "text-slate-400";
    
    if (rankPoints > 5000) { rankTitle = "Legendary Hero"; rankColor = "text-red-500"; }
    else if (rankPoints > 2000) { rankTitle = "Elite Warrior"; rankColor = "text-orange-500"; }
    else if (rankPoints > 1000) { rankTitle = "Pro Player"; rankColor = "text-violet-500"; }
    else if (rankPoints > 500) { rankTitle = "Veteran Gamer"; rankColor = "text-blue-500"; }
    else if (rankPoints > 100) { rankTitle = "Active Gamer"; rankColor = "text-emerald-500"; }

    return { totalAchieved, completedGames, rarest, rankTitle, rankPoints, rankColor, allAchievements };
  }, [library]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header & Rank Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              <div className="lg:col-span-2 space-y-4">
                <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
                  Hub Thành tựu
                </h1>
                <p className="text-slate-400 text-lg font-medium">Bảng vàng vinh danh những cột mốc vĩ đại trong hành trình gaming của bạn.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Shield className="h-24 w-24 text-white" />
                </div>
                <div className="relative space-y-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Thứ hạng Gamer</p>
                  <h2 className={`text-3xl font-black italic uppercase ${stats.rankColor}`}>{stats.rankTitle}</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>{stats.rankPoints} PTS</span>
                      <span>TIẾP THEO: {Math.ceil(stats.rankPoints / 1000 + 1) * 1000} PTS</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-current" 
                        style={{ width: `${(stats.rankPoints % 1000) / 10}%`, color: "inherit" }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Tổng Thành tựu", value: stats.totalAchieved, icon: <Trophy className="text-yellow-400" />, sub: "Đã đạt được" },
                { label: "Game Phá đảo", value: stats.completedGames, icon: <Flame className="text-orange-500" />, sub: "100% cốt truyện" },
                { label: "Độ hiếm TB", value: "12.5%", icon: <Star className="text-blue-400" />, sub: "Tỉ lệ thế giới" },
                { label: "Mục tiêu tuần", value: "5/10", icon: <Target className="text-emerald-400" />, sub: "Đang thực hiện" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] space-y-2">
                  <div className="flex items-center gap-3">
                    {s.icon}
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white">{s.value}</p>
                    <p className="text-[10px] font-bold text-slate-600 uppercase">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Rarest Achievements */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                  <Award className="h-6 w-6 text-red-500" />
                  Thành tựu quý hiếm nhất
                </h3>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.rarest.map((ach, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={`${ach.gameId}-${ach.id}`}
                    className="group bg-slate-900 border border-slate-800 rounded-3xl p-4 flex gap-4 hover:border-red-500/50 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <span className="text-6xl font-black italic">#{idx + 1}</span>
                    </div>
                    <div className="h-20 w-20 shrink-0 rounded-2xl overflow-hidden border border-white/5 relative">
                      <img src={ach.image} className="w-full h-full object-cover" alt={ach.name} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-1 right-1">
                        <div className="text-[8px] font-black text-white bg-red-600 px-1 rounded">{ach.percent}%</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-black text-white text-sm truncate uppercase tracking-tight">{ach.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 line-clamp-2 leading-snug">{ach.description}</p>
                      <Link 
                        href={`/library/${ach.gameId}`}
                        className="flex items-center gap-1 text-[9px] font-black text-violet-400 hover:text-violet-300 transition-colors uppercase pt-1"
                      >
                        {ach.gameName}
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* All Achieved History */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-yellow-400" />
                  Lịch sử vinh quang
                </h3>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="bg-slate-900/30 border border-slate-800 rounded-[3rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Thành tựu</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tựa game</th>
                      <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Độ hiếm</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {stats.allAchievements.slice(0, 20).map((ach) => (
                      <tr key={`${ach.gameId}-${ach.id}`} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={ach.image} className="h-10 w-10 rounded-lg" alt="" />
                            <div>
                              <p className="font-black text-white text-sm uppercase">{ach.name}</p>
                              <p className="text-[10px] font-medium text-slate-500 line-clamp-1">{ach.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Link href={`/library/${ach.gameId}`} className="text-sm font-bold text-slate-300 hover:text-violet-400 transition-colors">
                            {ach.gameName}
                          </Link>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-xs font-black text-white bg-slate-800 px-2 py-1 rounded-md">{ach.percent}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stats.allAchievements.length > 20 && (
                  <div className="p-6 text-center border-t border-slate-800">
                    <button className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition-colors">Xem tất cả {stats.allAchievements.length} thành tựu</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
