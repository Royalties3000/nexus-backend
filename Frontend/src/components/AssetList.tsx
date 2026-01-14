import { useEffect, useState } from "react";
import { fetchAssets } from "../api/assets";

// Interface aligned with updated Persistence/models.py
interface Asset {
  asset_id: string;
  asset_type: string;
  health_score: number;
  risk_level: number;
  required_certification: string | null;
  last_inspection: string | null;
}

export default function AssetList() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssets = () => {
      fetchAssets()
        .then(setAssets)
        .catch(err => setError(err.message));
    };

    loadAssets();
    const interval = setInterval(loadAssets, 5000);
    return () => clearInterval(interval);
  }, []);

  if (error) return (
    <div className="p-4 bg-red-900/20 border border-red-500 text-red-500 rounded text-xs font-mono animate-pulse">
      ⚠️ SENSOR_COMM_ERROR: {error}
    </div>
  );

  return (
    <div className="space-y-4 font-mono">
      <div className="flex justify-between items-end mb-2 px-1">
        <div>
          <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.2em]">Asset DNA Registry</h3>
          <p className="text-[9px] text-slate-500 uppercase">Live Telemetry Active</p>
        </div>
        <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-1 rounded border border-slate-800">
          {assets.length} UNITS_SCANNING
        </span>
      </div>

      <div className="grid gap-4">
        {assets.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl text-slate-600 text-xs">
            NO ASSETS DETECTED IN SECTOR
          </div>
        ) : (
          assets.map((a) => (
            <div 
              key={a.asset_id} 
              className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl hover:border-blue-500/40 transition-all group backdrop-blur-sm relative overflow-hidden"
            >
              {/* Status Indicator Bar */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                a.health_score > 70 ? 'bg-emerald-500' : a.health_score > 30 ? 'bg-amber-500' : 'bg-red-500'
              }`} />

              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-slate-100 font-black text-sm uppercase tracking-tight">
                    {a.asset_type}
                  </div>
                  <div className="text-[9px] text-blue-500 font-bold tracking-widest mt-0.5">
                    UID: {a.asset_id}
                  </div>
                </div>
                
                <div className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                  a.health_score > 30 
                    ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5" 
                    : "text-red-500 border-red-500/20 bg-red-500/10 animate-pulse"
                }`}>
                  {a.health_score > 30 ? "✓ NOMINAL" : "⚠ CRITICAL"}
                </div>
              </div>

              {/* Required Certification Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Required_Auth:</span>
                {a.required_certification ? (
                  <span className="text-[9px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded-sm font-black uppercase shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                    {a.required_certification}
                  </span>
                ) : (
                  <span className="text-[9px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-sm font-bold uppercase italic">
                    Standard Access
                  </span>
                )}
              </div>

              {/* Visual Health Gauge */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[9px] uppercase font-bold tracking-wider">
                  <span className="text-slate-500">Integrity_Index</span>
                  <span className={a.health_score < 40 ? "text-red-400 font-black" : "text-slate-300"}>
                    {a.health_score}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full p-[1px] border border-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px] ${
                      a.health_score > 70 ? 'bg-emerald-500 shadow-emerald-500/20' : 
                      a.health_score > 30 ? 'bg-amber-500 shadow-amber-500/20' : 'bg-red-500 shadow-red-500/40'
                    }`}
                    style={{ width: `${a.health_score}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                <div className="flex gap-3">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 uppercase font-bold">Risk Level</span>
                    <span className="text-[10px] text-slate-400 font-black">LVL_0{a.risk_level}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-slate-800" />
                  <div className="flex flex-col">
                    <span className="text-[7px] text-slate-600 uppercase font-bold">Last Sync</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase">
                      {a.last_inspection ? new Date(a.last_inspection).toLocaleDateString() : 'NEVER'}
                    </span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[9px] font-black uppercase transition-colors border border-slate-700">
                  Telemetry →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}