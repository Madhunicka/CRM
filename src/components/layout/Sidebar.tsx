'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, TrendingUp, LogOut, BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',      href: '/dashboard' },
  { icon: Users,           label: 'Leads',          href: '/leads' },
  { icon: TrendingUp,      label: 'Sales Pipeline', href: '/pipeline' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href: string) =>
    href === '/leads' ? pathname.startsWith('/leads') : pathname.startsWith(href);

  return (
    <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight block leading-tight">Nexus CRM</span>
            <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">Sales Intelligence</span>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-[10px] font-bold text-gray-600 px-4 py-2 uppercase tracking-widest">Main Menu</div>
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                active ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-[0_0_20px_rgba(37,99,235,0.08)]' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent')}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500 rounded-full" />}
              <item.icon className={cn('w-5 h-5 transition-colors', active ? 'text-blue-500' : 'text-gray-500 group-hover:text-white')} />
              <span className="font-medium flex-1">{item.label}</span>
              {active && <ChevronRight className="w-4 h-4 text-blue-500/50" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm border border-blue-500/30 shadow-lg shadow-blue-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 truncate">{user?.email || ''}</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[85%] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-500 uppercase font-bold tracking-tighter">
            <span>Monthly Target</span><span className="text-blue-400">85%</span>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/10">
          <LogOut className="w-5 h-5 text-gray-600" /><span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
