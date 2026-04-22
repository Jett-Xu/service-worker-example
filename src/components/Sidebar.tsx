import { Activity, Power } from 'lucide-react';

interface SidebarProps {
  swStatus: 'unregistered' | 'active';
  registerSW: () => void;
}

export function Sidebar({ swStatus, registerSW }: SidebarProps) {
  return (
    <aside className="relative z-10 w-1/4 min-w-[320px] max-w-[400px] border-r border-slate-800/60 glass-panel flex flex-col p-6">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight mb-2 text-white/90">SW 控制台</h1>
        <p className="text-sm text-slate-400">管理 Service Worker 與快取策略</p>
      </div>

      <div className="space-y-8 flex-1">
        {/* Status Indicator */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 系統狀態
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">Service Worker</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              swStatus === 'active' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${swStatus === 'active' ? 'bg-emerald-400' : 'bg-amber-400'} ${swStatus === 'active' ? 'animate-pulse' : ''}`} />
              {swStatus === 'active' ? '已啟動' : '未註冊'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4 flex items-center gap-2">
            <Power className="w-4 h-4" /> 控制選項
          </h2>
          <button 
            onClick={registerSW}
            disabled={swStatus === 'active'}
            className="w-full group relative flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-500/30 rounded-xl text-sm font-medium text-cyan-50 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Power className="w-4 h-4" />
            註冊 Service Worker
          </button>
        </div>
      </div>
    </aside>
  );
}
