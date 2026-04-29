"use client";

import React, { useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";
import { LibraryItem } from "@/types/game";
import { BarChart2, PieChart as PieIcon, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface LibraryStatsProps {
  library: LibraryItem[];
}

const COLORS = [
  "#8b5cf6", "#ec4899", "#3b82f6", "#10b981", 
  "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"
];

export default function LibraryStats({ library }: LibraryStatsProps) {
  const genreData = useMemo(() => {
    const counts: Record<string, number> = {};
    library.forEach(item => {
      item.genres?.forEach(genre => {
        counts[genre] = (counts[genre] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [library]);

  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    library.forEach(item => {
      item.platforms?.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [library]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      playing: 0,
      completed: 0,
      "plan-to-play": 0,
      "up-next": 0,
      dropped: 0
    };
    library.forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [library]);

  if (library.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Genre Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <PieIcon className="h-5 w-5 text-violet-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Thể loại yêu thích</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genreData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genreData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                itemStyle={{ color: "#f8fafc", fontSize: "12px", fontWeight: "bold" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {genreData.slice(0, 4).map((item, idx) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
              <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-tighter">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Nền tảng phổ biến</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80} 
                tick={{ fill: "#64748b", fontSize: 10, fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: "transparent" }}
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                itemStyle={{ color: "#f8fafc", fontSize: "12px", fontWeight: "bold" }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Tiến độ tổng thể</h3>
        </div>
        <div className="space-y-4">
          {statusData.map(({ name, value }) => {
            const percentage = (value / library.length) * 100;
            let color = "bg-slate-500";
            let label = name;
            if (name === "playing") { color = "bg-blue-500"; label = "Đang chơi"; }
            if (name === "completed") { color = "bg-green-500"; label = "Đã phá đảo"; }
            if (name === "plan-to-play") { color = "bg-yellow-500"; label = "Dự định"; }
            if (name === "up-next") { color = "bg-violet-500"; label = "Tiếp theo"; }
            if (name === "dropped") { color = "bg-red-500"; label = "Bỏ dở"; }

            return (
              <div key={name} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                  <span className="text-[10px] font-black text-white">{value} Game</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${color}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
