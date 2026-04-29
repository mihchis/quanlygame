import Navbar from "@/components/Navbar";
import { ChevronRight, Gamepad2, Trophy, ListChecks, PieChart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600/20 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-7xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-sm font-medium text-slate-300 animate-slow-fade">
              <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              Hành trình chơi game của bạn
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              Quản Lý <span className="text-violet-500">Thư Viện Game</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg text-slate-400 leading-relaxed">
              Người bạn đồng hành tối ưu cho game thủ. Theo dõi tiến độ, quản lý thành tựu, 
              và không bao giờ bỏ lỡ chuyến phiêu lưu tiếp theo. Hỗ trợ bởi RAWG.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/search"
                className="group flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all hover:scale-105"
              >
                Bắt đầu thêm game
                <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-100 rounded-2xl font-bold transition-all"
              >
                Xem tổng quan
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-violet-500/50 transition-colors group">
                <div className="p-3 bg-violet-500/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Gamepad2 className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quản Lý Thư Viện</h3>
                <p className="text-slate-400">Sắp xếp game theo trạng thái: Đã chơi, Đang chơi, hoặc Dự định chơi. Bộ sưu tập của bạn, theo cách của bạn.</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 transition-colors group">
                <div className="p-3 bg-pink-500/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Theo Dõi Thành Tựu</h3>
                <p className="text-slate-400">Theo dõi từng danh hiệu và thành tựu. Đánh dấu khi bạn hoàn thành và xem tỷ lệ hoàn thành của mình tăng lên.</p>
              </div>

              <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-colors group">
                <div className="p-3 bg-blue-500/10 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                  <PieChart className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dashboard Trực Quan</h3>
                <p className="text-slate-400">Biểu đồ đẹp mắt và thông tin chi tiết về thói quen chơi game và tỷ lệ hoàn thành thư viện của bạn.</p>
              </div>
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
