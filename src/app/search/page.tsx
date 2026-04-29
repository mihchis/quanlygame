"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import SearchGames from "@/components/SearchGames";
import { useLibrary } from "@/hooks/useLibrary";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const { addToLibrary, library } = useLibrary();
  const router = useRouter();

  if (!authLoading && !user) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Tìm Kiếm Game</h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Khám phá hàng triệu trò chơi và thêm chúng vào bộ sưu tập cá nhân của bạn.
            </p>
          </div>

          <SearchGames 
            onAddGame={(game) => addToLibrary(game)} 
            library={library}
          />
        </div>
      </main>
    </div>
  );
}
