"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, isConfigValid } from "@/lib/firebase";
import { signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { 
  Gamepad2, 
  LayoutDashboard, 
  Library, 
  Search, 
  LogOut, 
  LogIn, 
  Calendar as CalendarIcon, 
  Trophy, 
  Compass, 
  BarChart3 
} from "lucide-react";
import toast from "react-hot-toast";

import { useUserStats } from "@/hooks/useUserStats";

export default function Navbar() {
  const { user } = useAuth();
  const { level, progress } = useUserStats();
  const router = useRouter();

  const navLinks = [
    { name: "Tổng quan", href: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Thư viện", href: "/library", icon: <Library className="h-4 w-4" /> },
    { name: "Thành tựu", href: "/achievements", icon: <Trophy className="h-4 w-4" /> },
    { name: "Khám phá", href: "/discovery", icon: <Compass className="h-4 w-4" /> },
    { name: "Thống kê", href: "/stats", icon: <BarChart3 className="h-4 w-4" /> },
    { name: "Tìm kiếm", href: "/search", icon: <Search className="h-4 w-4" /> },
  ];

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
                <div className="hidden md:flex items-center gap-4 lg:gap-6">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href} 
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      {link.icon}
                      <span className="hidden lg:inline">{link.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Level Badge */}
                  <div className="hidden sm:flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl shadow-inner shadow-black/50">
                    <div className="relative">
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-600 text-[10px] font-black text-white shadow-lg shadow-violet-500/20">
                        L{level}
                      </div>
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
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/20"
                >
                  <LogIn className="h-4 w-4" />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-around h-16 px-2">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="flex flex-col items-center justify-center gap-1.5 text-slate-500 hover:text-violet-500 transition-all px-3 relative group"
              >
                <div className="p-1 rounded-lg group-hover:bg-violet-500/10 transition-colors">
                  {React.cloneElement(link.icon as React.ReactElement<any>, { className: "h-5 w-5" })}
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter">{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
