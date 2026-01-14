import { useEffect, useState } from "react";
import { fetchAlerts } from "../api/alerts";
import type { Alert } from "../types/alerts";

export function AlertPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshData = () => {
      fetchAlerts()
        .then((data) => {
          setAlerts(data);
          setIsLoading(false);
        })
        .catch((err) => console.error("Factory Feed Error:", err));
    };

    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {isLoading && (
        <div className="flex items-center gap-2 text-slate-500 text-xs font-mono animate-pulse">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          SYNCHRONIZING_WITH_CORE...
        </div>
      )}

      {!isLoading && alerts.length === 0 ? (
        <div className="border border-slate-800 bg-slate-900/20 p-4 rounded-lg text-center">
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">
            System Status: Nominal
          </p>
          <p className="text-[9px] text-slate-600 mt-1">No active maintenance gaps detected</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div 
              key={a.alert_id} 
              className={`relative overflow-hidden group transition-all duration-300 border rounded-lg p-4 ${
                a.severity >= 5 
                ? "bg-red-950/20 border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.05)]" 
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Vertical Status Indicator Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                a.severity >= 5 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
              }`}></div>

              <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black tracking-widest uppercase ${
                    a.severity >= 5 ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    Priority_0{a.severity}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600 uppercase">
                    ID: {a.alert_id.slice(0, 8)}
                  </span>
                </div>
                
                {a.severity >= 5 && (
                  <span className="bg-red-500 text-[8px] text-black font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                    Critical
                  </span>
                )}
              </div>

              <p className={`text-sm font-medium leading-relaxed ${
                a.severity >= 5 ? 'text-red-100' : 'text-slate-300'
              }`}>
                {a.message}
              </p>

              <div className="mt-3 pt-2 border-t border-slate-800/50 flex justify-between items-center text-[9px] font-mono text-slate-500 uppercase">
                <span>Source: {a.source || "System_Logic"}</span>
                <span>{new Date().toLocaleTimeString([], { hour12: false })}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}