import { Cloud, CloudOff } from 'lucide-react';

interface FooterProps {
  isOnline: boolean;
}

const Footer = ({ isOnline }: FooterProps) => {
  return (
    <footer className="fixed bottom-0 right-0 w-3/4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800/60 px-6 py-3 flex items-center justify-between z-20">
      <div className="flex items-center gap-4 text-sm">
        <span className="text-slate-400">網路狀態：</span>
        {isOnline ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <Cloud className="w-4 h-4" /> 已連線
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-rose-400 font-medium animate-pulse">
            <CloudOff className="w-4 h-4" /> 離線瀏覽模式已啟動
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 font-mono">
        展示版本 1.0.0
      </div>
    </footer>
  );
};

export { Footer };
