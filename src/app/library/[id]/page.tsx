"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useLibrary } from "@/hooks/useLibrary";
import { getGameDetails, getGameAchievements } from "@/services/rawg";
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
  Save,
  Globe,
  Clock,
  Monitor,
  Building2,
  ExternalLink,
  Share2
} from "lucide-react";
import { motion } from "framer-motion";
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
  
  // New state for review and notes
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasAutoFetched = useRef(false);

  useEffect(() => {
    const item = library.find((i) => i.id === id);
    if (item) {
      setGame(item);
      setRating(item.rating || 0);
      setReview(item.review || "");
      setNotes(item.notes || "");
      
      // Auto-fetch achievements if empty - ONLY ONCE
      if (!hasAutoFetched.current && (!item.achievements || item.achievements.length === 0) && !fetchingAchievements) {
        hasAutoFetched.current = true;
        handleFetchAchievements(item, true);
      }

      // Fetch RAWG details for community rating
      if (!rawgGame) {
        getGameDetails(item.gameId).then(setRawgGame).catch(console.error);
      }
    }
  }, [library, id]);

  const handleFetchAchievements = async (targetGame?: LibraryItem, isAuto = false) => {
    const currentGame = targetGame || game;
    if (!currentGame) return;
    setFetchingAchievements(true);
    try {
      const data = await getGameAchievements(currentGame.gameId);
      if (!data.results || data.results.length === 0) {
        // If no achievements found, we still mark as fetched to avoid loop
        if (!isAuto) toast.error("Game này không có thành tựu trên RAWG");
        return;
      }

      const achievements: Achievement[] = data.results.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        image: a.image,
        percent: a.percent,
        completed: false,
      }));
      
      await updateGameProgress(currentGame.id, { achievements });
      if (!isAuto) toast.success("Đã cập nhật thành tựu!");
    } catch (error) {
      console.error("Achievement fetch error:", error);
      if (!isAuto) toast.error("Lỗi khi tải thành tựu");
    } finally {
      setFetchingAchievements(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!game) return;
    setIsSaving(true);
    try {
      await updateGameProgress(game.id, { rating, review, notes });
      toast.success("Đã lưu đánh giá và ghi chú!");
    } catch (error) {
      toast.error("Lỗi khi lưu thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAchievement = async (achievementId: number) => {
    if (!game) return;
    const achievements = game.achievements.map((a) => 
      a.id === achievementId ? { ...a, completed: !a.completed } : a
    );
    await updateGameProgress(game.id, { achievements });
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

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />
        <p className="text-slate-400 font-medium">Đang tải...</p>
      </div>
    );
  }

  const completedAchievements = game.achievements?.filter(a => a.completed).length || 0;
  const totalAchievements = game.achievements?.length || 0;
  const achievementProgress = totalAchievements > 0 ? (completedAchievements / totalAchievements) * 100 : 0;

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1">
          {/* Banner */}
          <div className="relative h-[400px] w-full">
            <img 
              src={game.backgroundImage} 
              alt={game.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-slate-950/60" />
            <div className="absolute bottom-0 left-0 w-full p-8">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                  <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-4"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Quay lại thư viện
                  </button>
                  <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-tight">{game.name}</h1>
                  
                  {rawgGame?.alternative_names?.length > 0 && (
                    <p className="text-slate-400 text-sm font-medium">
                      Tên khác: {rawgGame.alternative_names.join(", ")}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-6">
                    {/* Your Rating */}
                    <div className="flex items-center gap-2 bg-slate-950/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Đánh giá của bạn</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            onClick={() => setRating(s)}
                            className={`h-5 w-5 cursor-pointer transition-all ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600 hover:text-slate-400"}`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* Community Rating */}
                    {rawgGame && (
                      <div className="flex items-center gap-3 bg-slate-950/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Cộng đồng RAWG</p>
                          <p className="text-sm font-bold text-white">{rawgGame.rating} / 5</p>
                        </div>
                      </div>
                    )}

                    {/* Playtime (Time to Beat) */}
                    {rawgGame && rawgGame.playtime > 0 && (
                      <div className="flex items-center gap-3 bg-slate-950/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                        <Clock className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Thời gian chơi</p>
                          <p className="text-sm font-bold text-white">~{rawgGame.playtime} Giờ</p>
                        </div>
                      </div>
                    )}

                    {/* Metacritic */}
                    {rawgGame && rawgGame.metacritic && (
                      <div className="flex items-center gap-3 bg-slate-950/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
                        <div className={`px-2 py-1 rounded-lg text-white font-black text-sm ${
                          rawgGame.metacritic >= 75 ? "bg-green-600" : rawgGame.metacritic >= 50 ? "bg-yellow-600" : "bg-red-600"
                        }`}>
                          {rawgGame.metacritic}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase">Metacritic</p>
                          <p className="text-sm font-bold text-white">Điểm số</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    {/* Developers & Publishers */}
                    <div className="space-y-1">
                      {rawgGame && rawgGame.developers && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Building2 className="h-3 w-3" />
                          <span className="font-bold">Nhà phát triển:</span>
                          <span className="text-slate-200">{rawgGame.developers.map((d: any) => d.name).join(", ")}</span>
                        </div>
                      )}
                      {rawgGame && rawgGame.publishers && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                          <Share2 className="h-3 w-3" />
                          <span className="font-bold">Nhà phát hành:</span>
                          <span className="text-slate-200">{rawgGame.publishers.map((p: any) => p.name).join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* External Links */}
                    <div className="flex items-center gap-3">
                      {rawgGame?.website && (
                        <a 
                          href={rawgGame.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/10 backdrop-blur-sm"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Website
                        </a>
                      )}
                      {rawgGame?.reddit_url && (
                        <a 
                          href={rawgGame.reddit_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#FF4500]/10 hover:bg-[#FF4500]/20 text-[#FF4500] rounded-xl text-xs font-bold transition-all border border-[#FF4500]/20 backdrop-blur-sm"
                        >
                          <span className="font-black">r/</span>
                          Reddit
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveInfo}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Stats & Reviews */}
            <div className="lg:col-span-4 space-y-8">
              {/* Progress Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Thành tựu
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Hoàn thành</span>
                    <span className="text-white font-medium">{completedAchievements}/{totalAchievements}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${achievementProgress}%` }}
                      className="h-full bg-yellow-400"
                    />
                  </div>
                </div>

                {totalAchievements === 0 ? (
                  <button
                    onClick={() => handleFetchAchievements()}
                    disabled={fetchingAchievements}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  >
                    {fetchingAchievements ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Nhập thành tựu từ RAWG
                  </button>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {game.achievements.map((a) => (
                      <div 
                        key={a.id} 
                        onClick={() => toggleAchievement(a.id)}
                        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all border group/item ${
                          a.completed ? "bg-yellow-400/5 border-yellow-400/20" : "bg-slate-800/50 border-transparent hover:border-slate-700"
                        }`}
                      >
                        <div className="relative h-10 w-10 shrink-0">
                          <img src={a.image} alt={a.name} className={`h-full w-full rounded-lg object-cover ${a.completed ? "" : "grayscale opacity-50"}`} />
                          {a.completed && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 text-slate-900 rounded-full p-0.5 shadow-lg">
                              <CheckCircle2 className="h-3 w-3 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate transition-colors ${a.completed ? "text-yellow-400" : "text-slate-200 group-hover/item:text-white"}`}>{a.name}</p>
                          <p className="text-xs text-slate-500 truncate">{a.percent}% người chơi</p>
                        </div>
                        <div className={`shrink-0 transition-all ${a.completed ? "text-yellow-400" : "text-slate-600 opacity-0 group-hover/item:opacity-100"}`}>
                          {a.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Review Card */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Cảm nhận cá nhân
                </h3>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Bạn thấy game này thế nào?..."
                  className="w-full h-40 bg-slate-800/50 border border-slate-700 text-white rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none transition-all"
                />
              </div>

              {/* PC Requirements Card */}
              {rawgGame?.platforms?.find((p: any) => p.platform.slug === "pc")?.requirements?.minimum && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Monitor className="h-5 w-5 text-green-400" />
                    Cấu hình PC
                  </h3>
                  <div className="space-y-4 text-[10px] leading-relaxed">
                    <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                      <p className="text-slate-500 font-black uppercase mb-2">Tối thiểu</p>
                      <div className="text-slate-300 whitespace-pre-line">
                        {rawgGame.platforms.find((p: any) => p.platform.slug === "pc").requirements.minimum.replace("Minimum:", "")}
                      </div>
                    </div>
                    {rawgGame.platforms.find((p: any) => p.platform.slug === "pc").requirements.recommended && (
                      <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                        <p className="text-slate-500 font-black uppercase mb-2">Khuyên dùng</p>
                        <div className="text-slate-300 whitespace-pre-line">
                          {rawgGame.platforms.find((p: any) => p.platform.slug === "pc").requirements.recommended.replace("Recommended:", "")}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Quests & Notes */}
            <div className="lg:col-span-8 space-y-8">
              {/* Notes Section */}
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <StickyNote className="h-6 w-6 text-pink-400" />
                  Ghi chú & Chiến thuật
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi lại những lưu ý, bí mật hoặc chiến thuật chơi game của bạn tại đây..."
                  className="w-full h-64 bg-slate-800/30 border border-slate-700 text-white rounded-2xl p-6 focus:ring-2 focus:ring-pink-500/50 outline-none resize-none transition-all font-mono text-sm leading-relaxed"
                />
              </div>

              {/* Quests Section */}
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <ListTodo className="h-6 w-6 text-violet-400" />
                    Nhật ký nhiệm vụ
                  </h3>
                </div>

                {/* Add Quest */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={newQuest}
                    onChange={(e) => setNewQuest(e.target.value)}
                    placeholder="Thêm nhiệm vụ mới..."
                    className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                  <select
                    value={questType}
                    onChange={(e) => setQuestType(e.target.value as any)}
                    className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none"
                  >
                    <option value="main">Nhiệm vụ chính</option>
                    <option value="side">Nhiệm vụ phụ</option>
                  </select>
                  <button
                    onClick={addQuest}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold transition-all"
                  >
                    Thêm
                  </button>
                </div>

                {/* Quest List */}
                <div className="space-y-4">
                  {(game.quests || []).length === 0 ? (
                    <div className="text-center py-12 text-slate-500 italic">
                      Chưa có nhiệm vụ nào. Mục tiêu tiếp theo của bạn là gì?
                    </div>
                  ) : (
                    (game.quests || []).map((q) => (
                      <div 
                        key={q.id}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                          q.completed ? "bg-slate-950/50 border-slate-800 opacity-60" : "bg-slate-800/30 border-slate-700"
                        }`}
                      >
                        <button 
                          onClick={() => toggleQuest(q.id)}
                          className={`shrink-0 ${q.completed ? "text-violet-500" : "text-slate-600 hover:text-slate-400"}`}
                        >
                          {q.completed ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                        </button>
                        
                        <div className="flex-1">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            q.type === "main" ? "bg-violet-500/10 text-violet-400" : "bg-blue-500/10 text-blue-400"
                          }`}>
                            {q.type === "main" ? "Chính" : "Phụ"}
                          </span>
                          <p className={`mt-1 font-medium ${q.completed ? "line-through text-slate-500" : "text-slate-100"}`}>
                            {q.title}
                          </p>
                        </div>

                        <button
                          onClick={() => removeQuest(q.id)}
                          className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
