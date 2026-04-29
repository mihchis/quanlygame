"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, isConfigValid } from "@/lib/firebase";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Gamepad2, LayoutDashboard, Library, Search, LogOut, LogIn, AlertCircle, Calendar as CalendarIcon } from "lucide-react";
import toast from "react-hot-toast";

import { useUserStats } from "@/hooks/useUserStats";

export default function Navbar() {
  const { user } = useAuth();
  const { level, progress } = useUserStats();
  const router = useRouter();

  const handleLogin = async () => {
    if (!isConfigValid) {
      toast.error("Firebase chưa được cấu hình. Vui lòng kiểm tra .env.local");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      toast.error("Đăng nhập thất bại");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Đã đăng xuất");
    } catch (error) {
      toast.error("Đăng xuất thất bại");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="p-2 bg-violet-600 rounded-lg">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
                  GameTracker
                </span>
              </Link>

              {user && (
                <div className="hidden md:flex items-center gap-6">
                  <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <LayoutDashboard className="h-4 w-4" />
                    Tổng quan
                  </Link>
                  <Link href="/library" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <Library className="h-4 w-4" />
                    Thư viện
                  </Link>
                  <Link href="/calendar" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    Lịch
                  </Link>
                  <Link href="/search" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-medium">
                    <Search className="h-4 w-4" />
                    Tìm kiếm
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Level Badge - Hidden on very small screens */}
                  <div className="hidden xs:flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-inner shadow-black/50">
                    <div className="relative">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-600 text-[10px] font-black text-white shadow-lg shadow-violet-500/20">
                        L{level}
                      </div>
                    </div>
                    <div className="hidden sm:block w-20 space-y-1">
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">XP</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-4">
                    <img
                      src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`}
                      alt={user.displayName || "User"}
                      className="h-8 w-8 rounded-full border border-slate-700"
                    />
                    <button
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-white transition-colors"
                      title="Đăng xuất"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/20"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 pb-safe">
          <div className="flex items-center justify-around h-16 px-4">
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-slate-400 hover:text-violet-500 transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] font-bold">Tổng quan</span>
            </Link>
            <Link href="/library" className="flex flex-col items-center gap-1 text-slate-400 hover:text-violet-500 transition-colors">
              <Library className="h-5 w-5" />
              <span className="text-[10px] font-bold">Thư viện</span>
            </Link>
            <Link href="/calendar" className="flex flex-col items-center gap-1 text-slate-400 hover:text-violet-500 transition-colors">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-[10px] font-bold">Lịch</span>
            </Link>
            <Link href="/search" className="flex flex-col items-center gap-1 text-slate-400 hover:text-violet-500 transition-colors">
              <Search className="h-5 w-5" />
              <span className="text-[10px] font-bold">Tìm kiếm</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
