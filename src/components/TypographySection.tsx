import { Type } from 'lucide-react';

export function TypographySection() {
  return (
    <section className="glass-card rounded-3xl p-10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] group-hover:bg-cyan-500/10 transition-colors duration-500" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/50">
            <Type className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-200">字型快取</h3>
            <p className="text-sm text-slate-400">透過 SW 攔截 Google Fonts</p>
          </div>
        </div>
        <h2 className="text-5xl md:text-6xl text-white/90 leading-tight mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
          AAAAA
        </h2>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/50 text-xs text-slate-300">
          <span className="font-mono text-cyan-400">Playfair Display</span> 字型
        </div>
      </div>
    </section>
  );
}
