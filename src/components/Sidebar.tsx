import { Activity, Power } from 'lucide-react';

interface SidebarProps {
  swStatus: 'unregistered' | 'active';
  registerSW: () => void;
  unregisterSW: () => void;
  clearCacheAndReload: () => void;
  reloadImageOnly: () => void;
}

const Sidebar = ({ swStatus, registerSW, unregisterSW, clearCacheAndReload, reloadImageOnly }: SidebarProps) => {
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
          {swStatus === 'active' ? (
            <button 
              onClick={unregisterSW}
              className="w-full group relative flex items-center justify-center gap-2 px-4 py-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 rounded-xl text-sm font-medium text-rose-50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Power className="w-4 h-4" />
              解除註冊 Service Worker
            </button>
          ) : (
            <button 
              onClick={registerSW}
              className="w-full group relative flex items-center justify-center gap-2 px-4 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-xl text-sm font-medium text-cyan-50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Power className="w-4 h-4" />
              註冊 Service Worker
            </button>
          )}

          <div className="pt-2 border-t border-slate-700/50 mt-4 space-y-3">
            <button 
              onClick={reloadImageOnly}
              className="w-full group relative flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-sm font-medium text-indigo-50 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Activity className="w-4 h-4" />
              重新載入圖片 (保留快取)
            </button>
            
            <button 
              onClick={clearCacheAndReload}
              className="w-full group relative flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl text-sm font-medium text-slate-300 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-600/0 via-slate-600/10 to-slate-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Activity className="w-4 h-4" />
              清除快取並重新載入
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export { Sidebar };
