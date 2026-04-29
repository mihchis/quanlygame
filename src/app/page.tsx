"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  ChevronRight, 
  Gamepad2, 
  Trophy,
  LayoutDashboard,
  Zap,
  Flame,
  Sparkles,
  TrendingUp,
  Star,
  Play,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { getTrendingGames } from "@/services/rawg";
import { useAuth } from "@/context/AuthContext";
import { useLibrary } from "@/hooks/useLibrary";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useAuth();
  const { library } = useLibrary();
  const [trending, setTrending] = useState<any[]>([]);
  const [dailyPick, setDailyPick] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Derived dummy values for demonstration
  const level = 12;
  const progress = 75;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getTrendingGames();
        setTrending(data.results.slice(0, 8));
        
        // Logic for Daily Pick (randomly from trending for now)
        if (data.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.results.length);
          setDailyPick(data.results[randomIndex]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 text-sm font-bold text-slate-300 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              Hành trình chơi game của bạn
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
            >
              Quản Lý <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-pink-500">
                Thư Viện Game
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-lg text-slate-400 font-medium leading-relaxed"
            >
              Người bạn đồng hành tối ưu cho game thủ. Theo dõi tiến độ, quản lý thành tựu, 
              và không bao giờ bỏ lỡ chuyến phiêu lưu tiếp theo. Hỗ trợ bởi RAWG.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto"
            >
              <Link
                href="/search"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 bg-white text-black rounded-3xl font-black transition-all hover:scale-105 shadow-xl shadow-white/5"
              >
                BẮT ĐẦU NGAY
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-3xl font-black transition-all"
              >
                TỔNG QUAN
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Discovery Sections */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Personalized Dashboard Stats Section */}
            {user && (
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-500/10 rounded-xl">
                    <LayoutDashboard className="h-6 w-6 text-violet-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Dashboard của bạn</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Rank & Welcome Card */}
                  <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform">
                      <Zap className="h-48 w-48 text-white" />
                    </div>
                    <div className="relative space-y-8">
                      <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none">
                          Chào mừng trở lại,<br/>
                          <span className="text-violet-500">{user?.displayName?.split(" ")[0] || "Game thủ"}!</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Hôm nay bạn dự định phá đảo game nào?</p>
                      </div>

                      <div className="flex flex-wrap gap-12">
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Cấp độ hiện tại</p>
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-violet-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-violet-500/20">
                              L{level}
                            </div>
                            <div>
                              <p className="text-xl font-black text-white italic uppercase">Pro Gamer</p>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{progress}% XP</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Game trong thư viện</p>
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-2xl font-black text-white">
                              {library.length}
                            </div>
                            <div>
                              <p className="text-xl font-black text-slate-400 italic uppercase">Bộ sưu tập</p>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">TỔNG CỘNG</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Pick Card */}
                  <Link 
                    href={`/game/${dailyPick?.id}`}
                    className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[3rem] p-8 md:p-10 relative overflow-hidden group shadow-2xl block hover:shadow-violet-500/20 transition-all hover:-translate-y-1"
                  >
                    {dailyPick && (
                      <>
                        <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700">
                          <img src={dailyPick.background_image} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="relative h-full flex flex-col justify-between space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                              <Sparkles className="h-3 w-3" />
                              Gợi ý của ngày
                            </div>
                            <div className="flex items-center gap-1">
                               <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                               <span className="text-xs font-black text-white">{dailyPick.rating}</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-tight line-clamp-2 group-hover:translate-x-2 transition-transform">
                              {dailyPick.name}
                            </h2>
                            <div className="w-full py-4 bg-white text-violet-600 rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-all group-hover:bg-violet-100">
                              <Play className="h-4 w-4 fill-current" />
                              Xem Chi Tiết
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </Link>
                </div>
              </div>
            )}

            {/* Trending Section */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-pink-500" />
                  </div>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Xu hướng tuần này</h2>
                </div>
                <Link href="/search" className="text-sm font-bold text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                  Xem tất cả <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="aspect-[3/4] bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {trending.map((game) => (
                    <Link 
                      key={game.id} 
                      href={`/game/${game.id}`}
                      className="group space-y-4 transition-transform hover:-translate-y-2"
                    >
                      <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border border-slate-800 group-hover:border-violet-500 transition-all shadow-2xl relative">
                        <img 
                          src={game.background_image} 
                          alt={game.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-4 left-4 right-4">
                           <p className="text-xs font-black text-white uppercase line-clamp-1 group-hover:text-violet-400 transition-colors">{game.name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard 
                icon={<Gamepad2 className="h-8 w-8 text-violet-400" />}
                title="Quản Lý Thư Viện"
                description="Sắp xếp game theo trạng thái: Đã chơi, Đang chơi, hoặc Dự định chơi. Bộ sưu tập của bạn, theo cách của bạn."
                color="violet"
              />
              <FeatureCard 
                icon={<Trophy className="h-8 w-8 text-pink-400" />}
                title="Theo Dõi Thành Tựu"
                description="Theo dõi từng danh hiệu và thành tựu. Đánh dấu khi bạn hoàn thành và xem tỷ lệ hoàn thành của mình tăng lên."
                color="pink"
              />
              <FeatureCard 
                icon={<PieChart className="h-8 w-8 text-blue-400" />}
                title="Dashboard Trực Quan"
                description="Biểu đồ đẹp mắt và thông tin chi tiết về thói quen chơi game và tỷ lệ hoàn thành thư viện của bạn."
                color="blue"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} GameTracker. Phát triển với Next.js & RAWG API.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: any) {
  const colorMap: any = {
    violet: "hover:border-violet-500/50 bg-violet-500/10",
    pink: "hover:border-pink-500/50 bg-pink-500/10",
    blue: "hover:border-blue-500/50 bg-blue-500/10"
  };

  return (
    <div className={`p-10 rounded-[2.5rem] bg-slate-900/50 border border-slate-800 transition-all group ${colorMap[color].split(' ')[0]}`}>
      <div className={`p-4 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform ${colorMap[color].split(' ')[1]}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 uppercase text-white">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
