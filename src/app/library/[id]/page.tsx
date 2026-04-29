"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useLibrary } from "@/hooks/useLibrary";
import { 
  getGameDetails, 
  getGameAchievements, 
  getSuggestedGames, 
  getGameScreenshots,
  getGameTrailers, 
  getGameStores,
  getGameSeries,
  getGameAdditions
} from "@/services/rawg";
import { Achievement, Quest, LibraryItem } from "@/types/game";
import { 
  Trophy, 
  ListTodo, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ChevronLeft,
  Loader2,
  Star,
  MessageSquare,
  StickyNote,
  Globe,
  Clock,
  Monitor,
  Building2,
  ExternalLink,
  Share2,
  PlayCircle,
  Image as ImageIcon,
  ShoppingCart,
  Users,
  BarChart,
  Play,
  Cpu,
  HardDrive,
  Zap,
  Layers,
  RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function GameDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { library, updateGameProgress } = useLibrary();
  const [game, setGame] = useState<LibraryItem | null>(null);
  const [rawgGame, setRawgGame] = useState<any>(null);
  const [newQuest, setNewQuest] = useState("");
  const [questType, setQuestType] = useState<"main" | "side">("main");
  const [fetchingAchievements, setFetchingAchievements] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [notes, setNotes] = useState("");
  const [suggestedGames, setSuggestedGames] = useState<any[]>([]);
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [gameSeries, setGameSeries] = useState<any[]>([]);
  const [gameAdditions, setGameAdditions] = useState<any[]>([]);
  const [activeMediaTab, setActiveMediaTab] = useState<"screenshots" | "trailers">("screenshots");
  const [isSyncing, setIsSyncing] = useState(false);

  const hasAutoFetched = useRef(false);

  useEffect(() => {
    const item = library.find((i) => i.id === id);
    if (item) {
      setGame(item);
      setRating(item.rating || 0);
      setReview(item.review || "");
      setNotes(item.notes || "");
      
      if (!hasAutoFetched.current && (!item.achievements || item.achievements.length === 0) && !fetchingAchievements) {
        hasAutoFetched.current = true;
        handleFetchAchievements(item, true);
      }

      if (!rawgGame) {
        getGameDetails(item.gameId).then(data => {
          setRawgGame(data);
          // Auto-fetch if missing or incomplete
          const currentCount = item.achievements?.length || 0;
          if (!hasAutoFetched.current && currentCount < (data.achievements_count || 0) && !fetchingAchievements) {
            hasAutoFetched.current = true;
            handleFetchAchievements(item, true);
          }
        }).catch(console.error);
        getSuggestedGames(item.gameId).then(data => setSuggestedGames(data.results)).catch(console.error);
        getGameScreenshots(item.gameId).then(data => setScreenshots(data.results)).catch(console.error);
        getGameTrailers(item.gameId).then(data => setTrailers(data.results)).catch(console.error);
        getGameSeries(item.gameId).then(data => setGameSeries(data.results)).catch(console.error);
        getGameAdditions(item.gameId).then(data => setGameAdditions(data.results)).catch(console.error);
      }
    }
  }, [library, id, rawgGame]);

  const handleFetchAchievements = async (targetGame?: LibraryItem, isAuto = false) => {
    const currentGame = targetGame || game;
    if (!currentGame) return;
    setFetchingAchievements(true);
    try {
      const data = await getGameAchievements(currentGame.gameId);
      if (!data.results || data.results.length === 0) {
        if (!isAuto) toast.error("Game này không có thành tựu trên RAWG");
        return;
      }

      const newAchievements: Achievement[] = data.results.map((a: any) => {
        // Keep completion status if it already exists in our library
        const existing = currentGame.achievements?.find(ea => ea.id === a.id);
        return {
          id: a.id,
          name: a.name,
          description: a.description,
          image: a.image,
          percent: a.percent,
          completed: existing ? existing.completed : false,
        };
      });
      
      await updateGameProgress(currentGame.id, { achievements: newAchievements });
      if (!isAuto) toast.success("Đã cập nhật thành tựu!");
    } catch (error) {
      console.error("Achievement fetch error:", error);
      if (!isAuto) toast.error("Lỗi khi tải thành tựu");
    } finally {
      setFetchingAchievements(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!game) return;

    // Skip if values match what's already in the game object
    if (
      rating === (game.rating || 0) && 
      review === (game.review || "") && 
      notes === (game.notes || "")
    ) return;

    const timeoutId = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await updateGameProgress(game.id, { rating, review, notes });
        // Optional: toast.success("Đã tự động lưu", { id: "auto-save" });
      } catch (error) {
        console.error("Auto-save error:", error);
      } finally {
        setIsSyncing(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timeoutId);
  }, [rating, review, notes, game?.id]);

  const toggleAchievement = async (achievementId: number) => {
    if (!game) return;
    
    // Update local state immediately for snappy UI
    const updatedAchievements = game.achievements.map((a) => 
      a.id === achievementId ? { ...a, completed: !a.completed } : a
    );
    
    setGame({ ...game, achievements: updatedAchievements });
    
    try {
      await updateGameProgress(game.id, { achievements: updatedAchievements });
    } catch (error) {
      // Revert if failed
      setGame(game);
      toast.error("Không thể lưu trạng thái thành tựu");
    }
  };

  const addQuest = async () => {
    if (!game || !newQuest.trim()) return;
    const quests: Quest[] = [
      ...(game.quests || []),
      { id: Date.now().toString(), title: newQuest, type: questType, completed: false }
    ];
    await updateGameProgress(game.id, { quests });
    setNewQuest("");
  };

  const toggleQuest = async (questId: string) => {
    if (!game) return;
    const quests = game.quests.map((q) => 
      q.id === questId ? { ...q, completed: !q.completed } : q
    );
    await updateGameProgress(game.id, { quests });
  };

  const removeQuest = async (questId: string) => {
    if (!game) return;
    const quests = game.quests.filter((q) => q.id !== questId);
    await updateGameProgress(game.id, { quests });
  };

  const togglePlatform = async (platformName: string) => {
    if (!game) return;
    const platforms = game.platforms || [];
    const newPlatforms = platforms.includes(platformName)
      ? platforms.filter(p => p !== platformName)
      : [...platforms, platformName];
    await updateGameProgress(game.id, { platforms: newPlatforms });
  };

  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
        <p className="text-slate-400 font-medium">Đang chuẩn bị hành trình...</p>
      </div>
    );
  }

  const completedAchievements = game.achievements?.filter(a => a.completed).length || 0;
  const totalAchievements = game.achievements?.length || 0;
  const achievementProgress = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;

  // Aggregate all unique screenshots
  const allScreenshots = Array.from(new Set([
    rawgGame?.background_image,
    rawgGame?.background_image_additional,
    ...(screenshots?.map(s => s.image) || [])
  ].filter(Boolean))).map((img, idx) => ({ 
    id: `img-${idx}`, 
    image: img 
  }));

  // System requirements helper
  const pcRequirements = rawgGame?.platforms?.find((p: any) => p.platform.slug === "pc")?.requirements;

  const parseRequirements = (reqStr: string) => {
    if (!reqStr) return [];
    // Clean up "Minimum:" or "Recommended:" headers
    const cleanStr = reqStr.replace(/^(Minimum:|Recommended:)/i, "").trim();
    const lines = cleanStr.split("\n");
    return lines.map(line => {
      const [key, ...values] = line.split(":");
      if (!values.length) return { key: "", value: line };
      return { key: key.trim(), value: values.join(":").trim() };
    }).filter(item => item.value);
  };

  const getReqIcon = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("os")) return <Monitor className="h-4 w-4" />;
    if (k.includes("processor") || k.includes("cpu")) return <Cpu className="h-4 w-4" />;
    if (k.includes("memory") || k.includes("ram")) return <Layers className="h-4 w-4" />;
    if (k.includes("graphics") || k.includes("gpu") || k.includes("video")) return <Zap className="h-4 w-4" />;
    if (k.includes("storage") || k.includes("disk") || k.includes("space")) return <HardDrive className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-slate-950 selection:bg-violet-500/30">
        <Navbar />
        
        <main className="flex-1">
          {/* Header Section (Banner + Info) */}
          <section className="relative min-h-[70vh] flex items-end overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={game.backgroundImage} 
                alt={game.name}
                className="w-full h-full object-cover scale-105 blur-sm opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex flex-col lg:flex-row gap-12 items-end">
                {/* Poster Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden lg:block w-72 shrink-0 aspect-[2/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative group"
                >
                  <img src={game.backgroundImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>

                <div className="flex-1 space-y-8">
                  <div className="space-y-4">
                    <button 
                      onClick={() => router.back()}
                      className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      THƯ VIỆN
                    </button>
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase italic">
                      {game.name}
                    </h1>
                    {rawgGame?.alternative_names?.length > 0 && (
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em]">
                        AKA: {rawgGame.alternative_names.join(" • ")}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      {rawgGame?.metacritic && (
                        <div className={`px-4 py-1.5 rounded-xl font-black text-white text-sm border ${
                          rawgGame.metacritic >= 75 ? "bg-green-500/20 border-green-500/30" : rawgGame.metacritic >= 50 ? "bg-yellow-500/20 border-yellow-500/30" : "bg-red-500/20 border-red-500/30"
                        }`}>
                          <span className="opacity-50 mr-2">META:</span> {rawgGame.metacritic}
                        </div>
                      )}
                      <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-violet-400" />
                        {rawgGame?.playtime > 0 ? `~${rawgGame.playtime} Giờ` : "Đang cập nhật"}
                      </div>
                      <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-400" />
                        {rawgGame?.rating || "?.?"} / 5.0
                      </div>
                      {rawgGame?.esrb_rating && (
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-sm font-bold uppercase">
                          {rawgGame.esrb_rating.name}
                        </div>
                      )}
                      {rawgGame?.reviews_count > 0 && (
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <MessageSquare className="h-3 w-3 text-pink-400" />
                          {rawgGame.reviews_count.toLocaleString()} REVIEWS
                        </div>
                      )}
                      {rawgGame?.achievements_count > 0 && (
                        <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                          <Trophy className="h-3 w-3 text-yellow-400" />
                          {rawgGame.achievements_count} ACHIEVEMENTS
                        </div>
                      )}
                      {rawgGame?.parent_platforms?.map((pp: any) => (
                        <div key={pp.platform.id} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-xs font-black uppercase tracking-widest">
                          {pp.platform.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats Overlay */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đánh giá của bạn</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            onClick={() => setRating(s)}
                            className={`h-5 w-5 cursor-pointer transition-all ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600 hover:text-white"}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hoàn thành</p>
                      <p className="text-xl font-black text-white">{achievementProgress.toFixed(0)}%</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1 col-span-1 md:col-span-2 flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nền tảng của bạn</p>
                        <div className="flex flex-wrap gap-2">
                          {(game.platforms?.length ?? 0) > 0 ? (
                            game.platforms.map(p => (
                              <span key={p} className="text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20">{p}</span>
                            ))
                          ) : (
                            <span className="text-xs font-bold text-slate-600 italic">Chưa chọn nền tảng</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isSyncing ? (
                          <div className="flex items-center gap-2 text-violet-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            ĐANG LƯU...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-3 w-3" />
                            ĐÃ LƯU
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Main Content Area */}
              <div className="lg:col-span-8 space-y-16">
                
                {/* About Section */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                    <StickyNote className="h-8 w-8 text-pink-400" />
                    Cốt truyện & Giới thiệu
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                      {rawgGame?.description_raw || rawgGame?.description?.replace(/<[^>]*>?/gm, '') || "Đang tải thông tin giới thiệu..."}
                    </p>
                  </div>
                </div>

                {/* Ratings Breakdown Section */}
                {rawgGame?.ratings && rawgGame.ratings.length > 0 && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                      <BarChart className="h-8 w-8 text-yellow-400" />
                      Phân bổ đánh giá
                    </h3>
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 space-y-6">
                      <div className="flex h-4 w-full rounded-full overflow-hidden bg-slate-800">
                        {rawgGame.ratings.map((r: any) => {
                          let color = "bg-slate-500";
                          if (r.title === "exceptional") color = "bg-emerald-500";
                          if (r.title === "recommended") color = "bg-blue-500";
                          if (r.title === "meh") color = "bg-yellow-500";
                          if (r.title === "skip") color = "bg-red-500";
                          return (
                            <div 
                              key={r.id} 
                              className={`${color} h-full transition-all hover:brightness-125 cursor-help`}
                              style={{ width: `${r.percent}%` }}
                              title={`${r.title.toUpperCase()}: ${r.count} (${r.percent}%)`}
                            />
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {rawgGame.ratings.map((r: any) => {
                          let color = "text-slate-500";
                          let iconColor = "bg-slate-500";
                          if (r.title === "exceptional") { color = "text-emerald-400"; iconColor = "bg-emerald-500"; }
                          if (r.title === "recommended") { color = "text-blue-400"; iconColor = "bg-blue-500"; }
                          if (r.title === "meh") { color = "text-yellow-400"; iconColor = "bg-yellow-500"; }
                          if (r.title === "skip") { color = "text-red-400"; iconColor = "bg-red-500"; }
                          return (
                            <div key={r.id} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${iconColor}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{r.title}</span>
                              </div>
                              <p className="text-xl font-black text-white">{r.percent.toFixed(1)}%</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase">{r.count} votes</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Media Section */}
                {(allScreenshots.length > 0 || trailers.length > 0 || rawgGame?.clip) && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                        <Monitor className="h-8 w-8 text-blue-400" />
                        Hình ảnh & Trailer
                      </h3>
                      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
                        <button 
                          onClick={() => setActiveMediaTab("screenshots")}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeMediaTab === "screenshots" ? "bg-white text-black" : "text-slate-500 hover:text-white"}`}
                        >
                          ẢNH ({allScreenshots.length})
                        </button>
                        <button 
                          onClick={() => setActiveMediaTab("trailers")}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeMediaTab === "trailers" ? "bg-white text-black" : "text-slate-500 hover:text-white"}`}
                        >
                          TRAILER
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeMediaTab === "screenshots" ? (
                        <motion.div 
                          key="shots"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        >
                          {allScreenshots.map((s, idx) => (
                            <div 
                              key={s.id} 
                              onClick={() => setSelectedScreenshot(s.image)}
                              className={`rounded-[2rem] overflow-hidden border border-white/5 relative group cursor-pointer aspect-video shadow-lg`}
                            >
                              <img src={s.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Plus className="h-10 w-10 text-white" />
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="trailers"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="space-y-6"
                        >
                          {/* Official Clip */}
                          {rawgGame?.clip && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">OFFICIAL CLIP</p>
                              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl relative">
                                <video 
                                  src={rawgGame.clip.clip} 
                                  controls 
                                  poster={rawgGame.clip.preview}
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                            </div>
                          )}

                          {/* YouTube Clip Fallback */}
                          {rawgGame?.clip?.video && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">TRAILER CHÍNH THỨC (YOUTUBE)</p>
                              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${rawgGame.clip.video}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            </div>
                          )}

                          {/* RAWG Movies */}
                          {trailers.map(t => (
                            <div key={t.id} className="space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">{t.name || "TRAILER PHỤ"}</p>
                              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl relative group">
                                <video controls poster={t.preview} className="w-full h-full object-cover">
                                  {t.data?.max && <source src={t.data.max} type="video/mp4" />}
                                  {t.data?.["480"] && <source src={t.data["480"]} type="video/mp4" />}
                                  {t.data?.["640"] && <source src={t.data["640"]} type="video/mp4" />}
                                  Your browser does not support the video tag.
                                </video>
                              </div>
                            </div>
                          ))}

                          {(!rawgGame?.clip && trailers.length === 0) && (
                            <div className="space-y-3">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">TRAILER (TÌM KIẾM TRÊN YOUTUBE)</p>
                              <div className="aspect-video rounded-[2.5rem] overflow-hidden bg-black border border-white/5 shadow-2xl">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(game.name + " official trailer")}`}
                                  title="YouTube video player"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Game Universe (Series & DLCs) */}
                {(gameSeries.length > 0 || gameAdditions.length > 0) && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                      <Layers className="h-8 w-8 text-orange-400" />
                      Vũ trụ & Các phần game khác
                    </h3>
                    
                    <div className="space-y-12">
                      {gameSeries.length > 0 && (
                        <div className="space-y-6">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2">Cùng Series / Thương hiệu</p>
                          <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x">
                            {gameSeries.map((g) => (
                              <Link 
                                key={g.id}
                                href={`/library/${g.id}`} // Note: This might need adjustment if id is not Doc ID
                                onClick={(e) => {
                                  // Since these are RAWG IDs, we should probably navigate to a search or general detail page
                                  // For now, let's just show the card
                                  e.preventDefault();
                                  toast.success(`Game: ${g.name}`);
                                }}
                                className="w-64 shrink-0 space-y-4 group snap-start"
                              >
                                <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-white/5 relative shadow-xl">
                                  <img src={g.background_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 transition-transform opacity-0 group-hover:opacity-100">
                                    <p className="text-[10px] font-black text-white uppercase bg-violet-600 px-2 py-1 rounded w-fit mb-1">XEM CHI TIẾT</p>
                                  </div>
                                </div>
                                <div className="px-2">
                                  <h4 className="font-black text-white uppercase italic text-sm group-hover:text-violet-400 transition-colors truncate">{g.name}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-[10px] font-bold text-slate-400">{g.rating} / 5.0</span>
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {gameAdditions.length > 0 && (
                        <div className="space-y-6">
                          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2">DLC & Bản mở rộng</p>
                          <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x">
                            {gameAdditions.map((g) => (
                              <div key={g.id} className="w-64 shrink-0 space-y-4 group snap-start">
                                <div className="aspect-[16/9] rounded-3xl overflow-hidden border border-white/5 relative shadow-xl">
                                  <img src={g.background_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                                <div className="px-2">
                                  <h4 className="font-black text-white uppercase italic text-sm truncate">{g.name}</h4>
                                  <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-widest">{g.released ? `PHÁT HÀNH: ${g.released}` : "SẮP RA MẮT"}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PC Requirements Section */}
                {pcRequirements && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                      <Monitor className="h-8 w-8 text-green-400" />
                      Cấu hình hệ thống (PC)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {["minimum", "recommended"].map((type) => {
                        const reqs = parseRequirements(pcRequirements[type]);
                        if (reqs.length === 0) return null;
                        
                        return (
                          <div key={type} className="p-8 rounded-[2.5rem] bg-slate-900 border border-slate-800 space-y-6 flex flex-col h-full">
                            <p className={`text-xs font-black uppercase tracking-widest ${type === "minimum" ? "text-violet-400" : "text-green-400"}`}>
                              {type === "minimum" ? "Cấu hình tối thiểu" : "Cấu hình đề nghị"}
                            </p>
                            <div className="space-y-4 flex-1">
                              {reqs.map((req, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                  <div className={`shrink-0 h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10 ${type === "minimum" ? "text-violet-400" : "text-green-400"}`}>
                                    {getReqIcon(req.key)}
                                  </div>
                                  <div className="space-y-0.5">
                                    {req.key && <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{req.key}</p>}
                                    <p className="text-sm font-bold text-slate-300 leading-snug">{req.value}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quests Section */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                    <ListTodo className="h-8 w-8 text-violet-400" />
                    Nhật ký nhiệm vụ
                  </h3>
                  
                  <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input
                        type="text"
                        value={newQuest}
                        onChange={(e) => setNewQuest(e.target.value)}
                        placeholder="Mục tiêu tiếp theo là gì?..."
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-2xl px-6 py-4 focus:ring-2 focus:ring-violet-500 outline-none font-bold"
                      />
                      <select
                        value={questType}
                        onChange={(e) => setQuestType(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-2xl px-6 py-4 outline-none font-bold appearance-none cursor-pointer hover:bg-slate-750 transition-colors"
                      >
                        <option value="main">NHIỆM VỤ CHÍNH</option>
                        <option value="side">NHIỆM VỤ PHỤ</option>
                      </select>
                      <button
                        onClick={addQuest}
                        className="px-8 py-4 bg-white text-black rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
                      >
                        THÊM
                      </button>
                    </div>

                    <div className="space-y-3">
                      {game.quests?.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 italic font-medium">Chưa có nhiệm vụ nào được ghi lại.</div>
                      ) : (
                        game.quests?.map((q) => (
                          <div 
                            key={q.id}
                            className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${
                              q.completed ? "bg-slate-950/40 border-slate-900 opacity-50" : "bg-slate-800/40 border-slate-700 hover:border-slate-500"
                            }`}
                          >
                            <button onClick={() => toggleQuest(q.id)} className={`shrink-0 ${q.completed ? "text-violet-500" : "text-slate-600 hover:text-white"}`}>
                              {q.completed ? <CheckCircle2 className="h-7 w-7" /> : <Circle className="h-7 w-7" />}
                            </button>
                            <div className="flex-1">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${q.type === "main" ? "bg-violet-500/20 text-violet-400" : "bg-blue-500/20 text-blue-400"}`}>
                                {q.type === "main" ? "MAIN" : "SIDE"}
                              </span>
                              <p className={`mt-1 font-bold text-lg ${q.completed ? "line-through text-slate-500" : "text-white"}`}>{q.title}</p>
                            </div>
                            <button onClick={() => removeQuest(q.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes & Strategy */}
                <div className="space-y-8">
                  <h3 className="text-3xl font-black text-white italic uppercase flex items-center gap-3">
                    <StickyNote className="h-8 w-8 text-pink-400" />
                    Ghi chú & Chiến thuật
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi lại những lưu ý, bí mật hoặc chiến thuật của bạn..."
                    className="w-full h-80 bg-slate-900 border border-slate-800 text-white rounded-[3rem] p-10 focus:ring-2 focus:ring-pink-500/50 outline-none resize-none transition-all font-mono leading-relaxed text-lg"
                  />
                </div>
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-4 space-y-12">
                
                {/* Platform Selector */}
                <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-6">
                  <h4 className="text-xl font-black text-white flex items-center gap-3 uppercase">
                    <Monitor className="h-6 w-6 text-violet-400" />
                    Nền tảng của bạn
                  </h4>
                  <p className="text-xs text-slate-500 font-bold leading-relaxed">Chọn các nền tảng bạn đang sở hữu hoặc đang chơi tựa game này.</p>
                  <div className="flex flex-wrap gap-2">
                    {rawgGame?.platforms?.map((p: any) => {
                      const isSelected = game.platforms?.includes(p.platform.name);
                      return (
                        <button
                          key={p.platform.id}
                          onClick={() => togglePlatform(p.platform.name)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected 
                              ? "bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20" 
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          {p.platform.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Achievements List */}
                <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-white flex items-center gap-3">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      THÀNH TỰU
                    </h4>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-500">{completedAchievements}/{totalAchievements}</span>
                      {totalAchievements > 0 && (
                        <button 
                          onClick={() => handleFetchAchievements()}
                          disabled={fetchingAchievements}
                          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"
                          title="Làm mới từ RAWG"
                        >
                          <RefreshCcw className={`h-4 w-4 ${fetchingAchievements ? "animate-spin" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {totalAchievements === 0 ? (
                    <button
                      onClick={() => handleFetchAchievements()}
                      disabled={fetchingAchievements}
                      className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] text-sm font-black transition-all border border-white/5 flex items-center justify-center gap-3"
                    >
                      {fetchingAchievements ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                      NHẬP TỪ RAWG
                    </button>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      {game.achievements.map((a) => (
                        <div 
                          key={a.id} 
                          onClick={() => toggleAchievement(a.id)}
                          className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border group ${a.completed ? "bg-yellow-400/10 border-yellow-400/20" : "bg-slate-800/30 border-transparent hover:border-slate-700"}`}
                        >
                          <div className="relative h-12 w-12 shrink-0">
                            <img src={a.image} className={`h-full w-full rounded-2xl object-cover ${a.completed ? "" : "grayscale opacity-40"}`} />
                            {a.completed && <CheckCircle2 className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-slate-950" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-black truncate ${a.completed ? "text-yellow-400" : "text-slate-300"}`}>{a.name}</p>
                            <p className="text-[10px] font-bold text-slate-500">{a.percent}% PLAYERS</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Community Stats Sidebar */}
                {rawgGame?.added_by_status && (
                  <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-6">
                    <h4 className="text-xl font-black text-white flex items-center gap-3 uppercase">
                      <Users className="h-6 w-6 text-pink-400" />
                      Cộng đồng
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Sở hữu</p>
                        <p className="text-lg font-black text-white">{rawgGame.added_by_status.owned?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Đang chơi</p>
                        <p className="text-lg font-black text-white">{rawgGame.added_by_status.playing?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Phá đảo</p>
                        <p className="text-lg font-black text-white">{rawgGame.added_by_status.beaten?.toLocaleString() || 0}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase">Muốn chơi</p>
                        <p className="text-lg font-black text-white">{rawgGame.added_by_status.toplay?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    {(rawgGame.reddit_count > 0 || rawgGame.twitch_count > 0 || rawgGame.youtube_count > 0) && (
                      <div className="pt-4 border-t border-white/5 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Social Buzz</p>
                        <div className="flex flex-wrap gap-4">
                          {rawgGame.reddit_count > 0 && (
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-4 w-4 text-orange-500" />
                              <span className="text-xs font-bold text-slate-300">{rawgGame.reddit_count.toLocaleString()}</span>
                            </div>
                          )}
                          {rawgGame.youtube_count > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Play className="h-4 w-4 text-red-500" />
                              <span className="text-xs font-bold text-slate-300">{rawgGame.youtube_count.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* More Info Sidebar */}
                <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Thông tin phát hành</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 font-bold">Ngày:</span>
                          <span className="text-white font-bold">{rawgGame?.released || "TBA"}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 font-bold">Trạng thái:</span>
                          <span className="text-violet-400 font-bold">{rawgGame?.tba ? "Sắp ra mắt" : "Đã phát hành"}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nhà phát triển</p>
                      <div className="flex flex-wrap gap-2">
                        {rawgGame?.developers?.map((d: any) => (
                          <span key={d.id} className="text-sm font-bold text-white px-3 py-1 bg-white/5 rounded-lg border border-white/5">{d.name}</span>
                        ))}
                      </div>
                    </div>
                    {rawgGame?.metacritic_platforms?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Metacritic theo hệ máy</p>
                        <div className="space-y-2">
                          {rawgGame.metacritic_platforms.map((mp: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                              <span className="text-xs font-bold text-slate-400">{mp.platform.name}</span>
                              <span className={`text-xs font-black px-2 py-0.5 rounded ${
                                mp.metascore >= 75 ? "bg-green-500/20 text-green-400" : mp.metascore >= 50 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                              }`}>{mp.metascore}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {rawgGame?.publishers?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nhà phát hành</p>
                        <div className="flex flex-wrap gap-2">
                          {rawgGame.publishers.map((p: any) => (
                            <span key={p.id} className="text-sm font-bold text-white px-3 py-1 bg-white/5 rounded-lg border border-white/5">{p.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Thể loại</p>
                      <div className="flex flex-wrap gap-2">
                        {rawgGame?.genres?.map((g: any) => (
                          <span key={g.id} className="text-sm font-bold text-violet-400 px-3 py-1 bg-violet-500/10 rounded-lg border border-violet-500/20">{g.name}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {rawgGame?.tags?.map((t: any) => (
                          <span key={t.id} className="text-[10px] font-bold text-slate-400 px-2 py-1 bg-white/5 rounded-lg border border-white/5">#{t.name}</span>
                        ))}
                      </div>
                    </div>
                    {rawgGame?.website && (
                      <a 
                        href={rawgGame.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 hover:bg-slate-750 text-white rounded-2xl text-xs font-black transition-all border border-slate-700"
                      >
                        OFFICIAL WEBSITE <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {rawgGame?.reddit_url && (
                      <a 
                        href={rawgGame.reddit_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-4 bg-[#FF4500]/10 hover:bg-[#FF4500]/20 text-[#FF4500] rounded-2xl text-xs font-black transition-all border border-[#FF4500]/20"
                      >
                        REDDIT COMMUNITY <MessageSquare className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Buy Section */}
                {rawgGame?.stores && rawgGame.stores.length > 0 && (
                  <div className="p-8 rounded-[3rem] bg-slate-900 border border-slate-800 space-y-6">
                    <h4 className="text-xl font-black text-white flex items-center gap-3 uppercase">
                      <ShoppingCart className="h-6 w-6 text-green-400" />
                      Nơi mua game
                    </h4>
                    <div className="space-y-2">
                      {rawgGame.stores.map((s: any) => (
                        <a 
                          key={s.id} 
                          href={s.url || `https://${s.store.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-all group"
                        >
                          <span className="text-sm font-bold text-slate-300 group-hover:text-white">{s.store?.name}</span>
                          <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-white" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Recommendations */}
          {suggestedGames.length > 0 && (
            <section className="bg-slate-900/30 py-24 px-4 sm:px-6 lg:px-8 border-t border-white/5">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="flex items-center gap-4">
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">Có thể bạn sẽ thích</h3>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {suggestedGames.slice(0, 12).map((s: any) => (
                    <Link 
                      key={s.id}
                      href={`/search?q=${encodeURIComponent(s.name)}`}
                      className="group space-y-4"
                    >
                      <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-violet-500/50 transition-all shadow-2xl relative">
                        <img src={s.background_image} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 group-hover:text-white transition-colors text-center uppercase tracking-widest line-clamp-2">
                        {s.name}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedScreenshot && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedScreenshot(null)}
                className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative max-w-7xl w-full aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
              >
                <img src={selectedScreenshot} className="w-full h-full object-contain bg-black/40" />
                <button 
                  onClick={() => setSelectedScreenshot(null)}
                  className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all"
                >
                  <Plus className="h-6 w-6 rotate-45" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
