"use client";

import React, { useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useLibrary } from "@/hooks/useLibrary";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from "recharts";
import { 
  Trophy, 
  Gamepad2, 
  CheckCircle2, 
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { library, loading } = useLibrary();

  const stats = useMemo(() => {
    const total = library.length;
    const playing = library.filter(i => i.status === "playing").length;
    const completed = library.filter(i => i.status === "completed").length;
    const planToPlay = library.filter(i => i.status === "plan-to-play").length;
    const upNext = library.filter(i => i.status === "up-next").length;
    const dropped = library.filter(i => i.status === "dropped").length;
    
    // Achievement stats
    const totalAchievements = library.reduce((acc, curr) => acc + (curr.achievements?.length || 0), 0);
    const completedAchievements = library.reduce((acc, curr) => acc + (curr.achievements?.filter(a => a.completed).length || 0), 0);
    
    // Quest stats
    const totalQuests = library.reduce((acc, curr) => acc + (curr.quests?.length || 0), 0);
    const completedQuests = library.reduce((acc, curr) => acc + (curr.quests?.filter(q => q.completed).length || 0), 0);

    const statusData = [
      { name: "Đang chơi", value: playing, color: "#3b82f6" },
      { name: "Đã hoàn thành", value: completed, color: "#10b981" },
      { name: "Dự định", value: planToPlay, color: "#f59e0b" },
      { name: "Tiếp theo", value: upNext, color: "#8b5cf6" },
      { name: "Bỏ dở", value: dropped, color: "#ef4444" },
    ].filter(d => d.value > 0);

    return {
      total,
      playing,
      completed,
      planToPlay,
      upNext,
      dropped,
      totalAchievements,
      completedAchievements,
      totalQuests,
      completedQuests,
      statusData,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    };
  }, [library]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                  <LayoutDashboard className="h-10 w-10 text-violet-500" />
                  Tổng quan
                </h1>
                <p className="text-slate-400 mt-2">Cái nhìn tổng quát về bộ sưu tập game và tiến độ của bạn.</p>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard 
                label="Tổng số game" 
                value={stats.total} 
                icon={<Gamepad2 className="h-6 w-6 text-violet-400" />}
                color="border-violet-500/20"
              />
              <StatCard 
                label="Game đã hoàn thành" 
                value={stats.completed} 
                icon={<CheckCircle2 className="h-6 w-6 text-green-400" />}
                color="border-green-500/20"
              />
              <StatCard 
                label="Đang chơi" 
                value={stats.playing} 
                icon={<TrendingUp className="h-6 w-6 text-blue-400" />}
                color="border-blue-500/20"
              />
              <StatCard 
                label="Tỷ lệ hoàn thành" 
                value={`${Math.round(stats.completionRate)}%`} 
                icon={<Trophy className="h-6 w-6 text-yellow-400" />}
                color="border-yellow-500/20"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Status Distribution */}
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-xl font-bold">Phân bổ thư viện</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry: any) => {
                          const percentage = stats.total > 0 ? (entry.payload.value / stats.total * 100).toFixed(0) : 0;
                          return <span className="text-slate-400 text-xs font-bold ml-1">{value} ({percentage}%)</span>;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Completion Stats */}
              <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-xl font-bold">Tiến độ chi tiết</h3>
                <div className="space-y-8">
                  <ProgressItem 
                    label="Thành tựu" 
                    current={stats.completedAchievements} 
                    total={stats.totalAchievements} 
                    color="bg-yellow-400"
                  />
                  <ProgressItem 
                    label="Nhiệm vụ đã xong" 
                    current={stats.completedQuests} 
                    total={stats.totalQuests} 
                    color="bg-violet-400"
                  />
                  <div className="pt-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <p className="text-sm text-slate-400">Tổng mục tiêu đã đạt được</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {stats.completedAchievements + stats.completedQuests} 
                      <span className="text-slate-500 text-lg font-normal ml-2">Mục tiêu</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function StatCard({ label, value, icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-6 rounded-3xl bg-slate-900 border ${color} space-y-4`}
    >
      <div className="p-3 bg-white/5 rounded-2xl w-fit">
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
    </motion.div>
  );
}

function ProgressItem({ label, current, total, color }: any) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-slate-300 font-medium">{label}</span>
        <span className="text-sm text-slate-500">
          <span className="text-white font-bold">{current}</span> / {total}
        </span>
      </div>
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full ${color} shadow-lg`}
        />
      </div>
    </div>
  );
}
