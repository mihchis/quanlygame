"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { getGameDetails, getGameScreenshots, getGameTrailers } from "@/services/rawg";
import { useLibrary } from "@/hooks/useLibrary";
import { 
  Star, 
  Plus, 
  ChevronLeft, 
  Monitor, 
  Globe, 
  Calendar, 
  Users, 
  Layout, 
  Play,
  CheckCircle2,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";

export default function GamePreviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const { library, addToLibrary } = useLibrary();
  const [game, setGame] = useState<any>(null);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [gameSeries, setGameSeries] = useState<any[]>([]);
  const [gameAdditions, setGameAdditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isInLibrary = library.find(item => item.gameId === Number(id));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [details, sc, series, additions] = await Promise.all([
          getGameDetails(id as string),
          getGameScreenshots(id as string),
          fetch(`https://api.rawg.io/api/games/${id}/game-series?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}`).then(res => res.json()),
          fetch(`https://api.rawg.io/api/games/${id}/additions?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}`).then(res => res.json())
        ]);
        setGame(details);
        setScreenshots(sc.results);
        setGameSeries(series.results || []);
        setGameAdditions(additions.results || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
    </div>
  );

  if (!game) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      
      <main className="flex-1 relative">
        {/* Hero Banner */}
        <div className="relative h-[60vh] w-full overflow-hidden">
          <img src={game.background_image_additional || game.background_image} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 lg:p-24">
            <div className="max-w-7xl mx-auto space-y-6">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-4 py-2 rounded-full w-fit"
              >
                <ChevronLeft className="h-4 w-4" />
                Quay lại
              </button>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {game.genres?.map((g: any) => (
                    <span key={g.id} className="px-3 py-1 bg-violet-600 rounded-full text-[10px] font-black text-white uppercase tracking-widest">{g.name}</span>
                  ))}
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none max-w-4xl">{game.name}</h1>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    <span className="text-2xl font-black text-white">{game.rating}</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Phát hành</span>
                    <span className="text-sm font-bold text-white">{game.released}</span>
                  </div>
                  <div className="h-8 w-px bg-white/20" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Metacritic</span>
                    <span className="text-sm font-black text-green-400">{game.metacritic || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-6">
                {isInLibrary ? (
                  <Link 
                    href={`/library/${isInLibrary.id}`}
                    className="flex items-center gap-3 px-10 py-5 bg-white text-black rounded-3xl font-black text-sm uppercase transition-all hover:scale-105"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Đã có trong thư viện
                  </Link>
                ) : (
                  <button 
                    onClick={() => {
                      addToLibrary(game);
                      toast.success(`Đã thêm ${game.name} vào thư viện!`);
                    }}
                    className="flex items-center gap-3 px-10 py-5 bg-violet-600 text-white rounded-3xl font-black text-sm uppercase transition-all hover:scale-105 shadow-2xl shadow-violet-500/40"
                  >
                    <Plus className="h-5 w-5" />
                    Thêm vào thư viện
                  </button>
                )}
                {game.website && (
                  <a href={game.website} target="_blank" className="flex items-center gap-3 px-10 py-5 bg-slate-900/50 backdrop-blur-md border border-white/10 text-white rounded-3xl font-black text-sm uppercase transition-all hover:bg-white hover:text-black">
                    <Globe className="h-5 w-5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            {/* About */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                  <Layout className="h-6 w-6 text-violet-500" />
                  Giới thiệu
                </h3>
                <div className="h-px flex-1 bg-slate-800" />
              </div>
              <div 
                className="text-slate-400 leading-relaxed font-medium text-lg prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: game.description }}
              />
            </div>

            {/* Side Info */}
            <div className="space-y-8">
              <div className="p-10 bg-slate-900 border border-slate-800 rounded-[3rem] space-y-8 shadow-2xl">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Thông tin chi tiết</h4>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Nhà phát triển</p>
                    <p className="text-white font-bold">{game.developers?.map((d: any) => d.name).join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Nền tảng</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {game.parent_platforms?.map((p: any) => (
                        <div key={p.platform.id} className="p-2 bg-slate-800 rounded-xl text-slate-300">
                          <Monitor className="h-4 w-4" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Thành tựu</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-violet-500" />
                      <span className="text-white font-bold">{game.achievements_count || 0} mục</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Screenshots Preview */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Bộ sưu tập ảnh</h4>
                <div className="grid grid-cols-2 gap-3">
                  {screenshots.slice(0, 4).map((s) => (
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      key={s.id} 
                      src={s.image} 
                      className="rounded-2xl aspect-video object-cover border border-white/5 cursor-pointer" 
                      alt="" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Game Universe (Series & Additions) */}
          {(gameSeries.length > 0 || gameAdditions.length > 0) && (
            <div className="space-y-12">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-black text-white italic uppercase flex items-center gap-3">
                  <Layers className="h-6 w-6 text-blue-500" />
                  Vũ trụ game
                </h3>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="space-y-16">
                {gameSeries.length > 0 && (
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Cùng Series</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {gameSeries.map((s: any) => (
                        <Link key={s.id} href={`/game/${s.id}`} className="group space-y-3">
                          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 group-hover:border-blue-500 transition-all">
                            <img src={s.background_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <p className="text-[10px] font-black text-white uppercase line-clamp-1 group-hover:text-blue-400 transition-colors">{s.name}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {gameAdditions.length > 0 && (
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Bản mở rộng & DLC</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {gameAdditions.map((a: any) => (
                        <Link key={a.id} href={`/game/${a.id}`} className="group space-y-3">
                          <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-slate-800 group-hover:border-violet-500 transition-all">
                            <img src={a.background_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <p className="text-[10px] font-black text-white uppercase line-clamp-1 group-hover:text-violet-400 transition-colors">{a.name}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
