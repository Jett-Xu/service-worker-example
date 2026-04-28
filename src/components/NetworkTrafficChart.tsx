import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

export type RequestData = {
  id: number;
  name: string;
  networkSize: number;
  cacheSize: number;
  duration: number;
  event?: string;
};

interface Props {
  data: RequestData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-mono text-slate-100">
              {entry.value} {entry.name.includes('流量') ? 'MB' : 'ms'}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const NetworkTrafficChart = ({ data }: Props) => {
  // 找出有 event 的資料點，用來畫垂直參考線
  const eventPoints = data.filter(d => d.event);

  return (
    <div className="glass-card rounded-2xl p-6 w-full h-[380px] flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-slate-200">效能與流量趨勢監測</h3>
        <p className="text-sm text-slate-400">觀察載入時間 (ms) 與網路流量 (MB) 的斷崖式變化</p>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[250px]">
        {data.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-700/50 rounded-xl">
            等待首次載入數據...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 25, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorNetwork" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCache" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
              />
              
              {/* 左側 Y 軸：載入時間 */}
              <YAxis 
                yAxisId="left"
                stroke="#60a5fa" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}ms`}
              />
              
              {/* 右側 Y 軸：網路流量 */}
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#f43f5e" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}MB`}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />

              {eventPoints.map((point, index) => (
                <ReferenceLine 
                  key={index}
                  yAxisId="left"
                  x={point.name} 
                  stroke="#fbbf24" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: point.event, fill: '#fbbf24', fontSize: 12, offset: 10 }} 
                />
              ))}

              {/* 面積圖：顯示流量 */}
              <Area 
                yAxisId="right"
                type="monotone" 
                name="網路消耗流量" 
                dataKey="networkSize" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorNetwork)" 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                name="節省的快取流量" 
                dataKey="cacheSize" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCache)" 
              />
              
              {/* 折線圖：顯示載入時間 */}
              <Line 
                yAxisId="left"
                type="monotone" 
                name="載入時間" 
                dataKey="duration" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export { NetworkTrafficChart };
