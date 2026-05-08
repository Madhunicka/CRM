import { Sidebar } from '@/components/layout/Sidebar';
import { Search, Bell, User } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search leads, companies, or tasks..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#0a0a0a]" />
            </button>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold">Admin User</div>
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Active Now</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10 shadow-lg shadow-blue-500/10">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
