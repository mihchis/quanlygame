"use client";

import React from "react";
import { auth, isConfigValid } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Gamepad2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async () => {
    if (!isConfigValid) {
      toast.error("Firebase not configured. Please check .env.local");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full space-y-8 p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-violet-600/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-600/20 blur-[80px] rounded-full" />

        <div className="relative text-center space-y-6">
          <div className="inline-flex p-4 bg-violet-600 rounded-2xl shadow-lg shadow-violet-500/20">
            <Gamepad2 className="h-10 w-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Chào mừng quay trở lại</h1>
            <p className="text-slate-400">Đăng nhập để quản lý thư viện game và theo dõi tiến độ của bạn.</p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
            Tiếp tục với Google
          </button>

          <p className="text-xs text-slate-500">
            Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
