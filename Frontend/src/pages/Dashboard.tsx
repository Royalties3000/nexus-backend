import { useState, useEffect, useRef } from "react";
import {
  Activity, Users, ShieldAlert, Cpu, Zap, Info, Bell, AlertTriangle,
  RefreshCw, X, Map as MapIcon, List, Maximize2, Minimize2,
  BrainCircuit, TrendingDown, ZoomIn, ZoomOut, Crosshair
} from "lucide-react";
import { AlertPanel } from "../components/AlertPanel";
import AssetList from "../components/AssetList";

// --- TYPES ---
interface KPIs { criticalAssets: number; onShiftEngineers: number; activeAlerts: number; systemHealth: number; }
interface ReadinessMetric { skill: string; needed: number; available: number; readiness: number; }
interface Asset { asset_id: string; type: string; health_score: number; status: string; x?: number; y?: number; }

// --- ASSET ICON COMPONENT ---
function AssetIcon({ type, health, size = 24 }: { type: string, health: number, size?: number }) {
  const isCritical = health < 50;
  const color = isCritical ? "#ef4444" : "#64748b";
  const renderPath = () => {
    const t = type?.toLowerCase() || "";
    if (t.includes("turbine")) return <path d="M12 22V12M12 12L18 8M12 12L6 8M12 12V4" stroke={color} strokeWidth="2" fill="none"/>;
    if (t.includes("robot") || t.includes("arm")) return <path d="M4 20h16M7 20l2-10 6-4 3 2" stroke={color} strokeWidth="2" fill="none"/>;
    if (t.includes("transformer") || t.includes("power")) return <rect x="5" y="6" width="14" height="12" rx="1" stroke={color} strokeWidth="2" fill="none"/>;
    return <path d="M12 3l9 6v6l-9 6-9-6V9l9-6z" stroke={color} strokeWidth="2" fill="none"/>;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={isCritical ? "animate-pulse" : ""}>
      {isCritical && <circle cx="12" cy="12" r="8" fill="red" fillOpacity="0.2"><animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" /></circle>}
      {renderPath()}
    </svg>
  );
}

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const [running, setRunning] = useState(false);
  const [readiness, setReadiness] = useState<ReadinessMetric[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [showCriticalModal, setShowCriticalModal] = useState(false);
  const [viewMode, setViewMode] = useState<"topology" | "registry">("topology");
  const [fullScreenMap, setFullScreenMap] = useState(false);
  const [fullScreenSkills, setFullScreenSkills] = useState(false);
  const [kpis, setKpis] = useState<KPIs>({ criticalAssets: 0, onShiftEngineers: 0, activeAlerts: 0, systemHealth: 0 });

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const refreshData = async () => {
    try {
      const [assetsRes, engRes, alertRes, readyRes] = await Promise.all([
        fetch("http://127.0.0.1:8000/assets"), fetch("http://127.0.0.1:8000/engineers"),
        fetch("http://127.0.0.1:8000/alerts"), fetch("http://127.0.0.1:8000/analysis/readiness")
      ]);
      if (assetsRes.ok && engRes.ok && alertRes.ok && readyRes.ok) {
        const assets = await assetsRes.json();
        const engineers = await engRes.json();
        const alerts = await alertRes.json();
        const readyData = await readyRes.json();
        setReadiness(readyData);
        setAllAssets(assets.map((a: any, i: number) => ({ ...a, x: a.x || 15 + (i % 5) * 18, y: a.y || 20 + Math.floor(i / 5) * 22 })));
        const avgHealth = assets.length > 0 ? assets.reduce((acc: number, cur: any) => acc + (cur.health_score || 0), 0) / assets.length : 100;
        setKpis({ criticalAssets: assets.filter((a: any) => (a.health_score || 100) < 50).length, onShiftEngineers: engineers.length || 0, activeAlerts: Array.isArray(alerts) ? alerts.length : 0, systemHealth: Math.round(avgHealth) });
      }
    } catch (err) { console.error("Data Fetch Error", err); }
  };

  const triggerChaos = async () => { await fetch("http://127.0.0.1:8000/assets/chaos", { method: "POST" }); refreshData(); };
  const resetSystems = async () => { await fetch("http://127.0.0.1:8000/assets/reset-health", { method: "POST" }); refreshData(); };
  const runSchedule = async () => {
    setRunning(true);
    try { await fetch("http://127.0.0.1:8000/schedule", { method: "POST" }); refreshData(); } finally { setRunning(false); }
  };

  return (
    <div className="h-screen w-full flex flex-col font-mono p-6 bg-[#020617] text-slate-300 overflow-hidden">
      
      {/* 1. TOP COMMAND BAR */}
      <div className="flex-none flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/50 backdrop-blur-xl mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Cpu className="text-blue-500" size={24} />
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase underline decoration-blue-500/30">Nexus_Control</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Autonomous Maintenance Orchestrator</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 border-r border-slate-800 pr-4">
            <button onClick={triggerChaos} className="p-3 bg-red-950/30 border border-red-900/50 text-red-500 rounded-xl hover:bg-red-900/40 transition-all"><AlertTriangle size={16} /></button>
            <button onClick={resetSystems} className="p-3 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-xl hover:bg-slate-700 transition-all"><RefreshCw size={16} /></button>
          </div>
          <button onClick={runSchedule} disabled={running} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-black rounded-xl transition-all flex items-center gap-3 text-[10px] uppercase tracking-widest">
            <Zap className={running ? "animate-spin" : ""} size={14} /> {running ? "Syncing..." : "Execute Orchestration"}
          </button>
        </div>
      </div>

      {/* 2. KPI GRID */}
      <div className="flex-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricPanel label="Global Integrity" value={`${kpis.systemHealth}%`} icon={<Activity size={18} />} color="text-emerald-400" barValue={kpis.systemHealth} />
        <div onClick={() => setShowCriticalModal(true)} className="cursor-pointer">
          <MetricPanel label="Critical Nodes" value={kpis.criticalAssets} icon={<ShieldAlert size={18} />} color="text-red-500" sub="Failure Telemetry Active" />
        </div>
        <MetricPanel label="Personnel" value={kpis.onShiftEngineers} icon={<Users size={18} />} color="text-blue-400" sub="Verified Certificates" />
        <MetricPanel label="Alerts" value={kpis.activeAlerts} icon={<Bell size={18} />} color="text-amber-500" pulse={kpis.activeAlerts > 0} />
      </div>

      {/* 3. MAIN CONTENT */}
      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        <div className="col-span-12 lg:col-span-8 flex flex-col bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] p-8 overflow-hidden relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black text-slate-400 tracking-[.4em] uppercase flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> Link Topology
            </h2>
            <div className="flex gap-2">
              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800">
                <button onClick={() => setViewMode("topology")} className={`p-2 rounded-lg ${viewMode === 'topology' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><MapIcon size={16} /></button>
                <button onClick={() => setViewMode("registry")} className={`p-2 rounded-lg ${viewMode === 'registry' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}><List size={16} /></button>
              </div>
              <button onClick={() => setFullScreenMap(true)} className="p-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-800"><Maximize2 size={16}/></button>
            </div>
          </div>
          <div className="flex-1 relative bg-slate-950/40 rounded-3xl border border-slate-800/50 overflow-hidden">
             {viewMode === "registry" ? <div className="h-full overflow-y-auto p-4"><AssetList /></div> : <TopologyMap assets={allAssets} isFullScreen={fullScreenMap} />}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
          <div className="flex-1 flex flex-col bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md overflow-hidden cursor-zoom-in group hover:border-blue-500/50 transition-all" onClick={() => setFullScreenSkills(true)}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black text-blue-400 tracking-[.4em] uppercase flex items-center gap-2"><BrainCircuit size={14} /> Readiness</h2>
              <Maximize2 size={12} className="text-slate-600 group-hover:text-blue-500" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {readiness.map((m) => (
                <div key={m.skill} className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800">
                  <div className="flex justify-between text-[9px] font-bold uppercase mb-2">
                    <span className="text-slate-300">{m.skill}</span>
                    <span className={m.readiness < 100 ? "text-amber-500" : "text-emerald-500"}>{m.readiness}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className={`h-full ${m.readiness >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${m.readiness}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-1/3 flex flex-col bg-[#0d1117] border border-red-900/20 rounded-3xl p-6 overflow-hidden">
             <h2 className="text-[10px] font-black text-red-500 tracking-[.4em] uppercase flex items-center gap-2 mb-4"><span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span> Incident Log</h2>
             <div className="flex-1 overflow-y-auto"><AlertPanel /></div>
          </div>
        </div>
      </div>

      {/* --- MODALS & OVERLAYS --- */}
      {fullScreenMap && (
        <div className="fixed inset-0 z-[300] bg-[#020617] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Topology_War_Room</h2>
             <button onClick={() => setFullScreenMap(false)} className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-xs uppercase">Exit War Room</button>
          </div>
          <div className="flex-1 bg-slate-950 rounded-[3rem] border border-slate-800 overflow-hidden relative">
            <TopologyMap assets={allAssets} isFullScreen={true} />
          </div>
        </div>
      )}

      {fullScreenSkills && (
        <div className="fixed inset-0 z-[400] bg-[#020617] p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4"><BrainCircuit className="text-blue-500 animate-pulse" size={40} /> Skill_Readiness_Gap</h2>
              <button onClick={() => setFullScreenSkills(false)} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 flex items-center gap-2 uppercase text-xs font-bold transition-all hover:text-white hover:border-blue-500"><Minimize2 size={20} /> Exit Matrix</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {readiness.map((m) => {
                const gap = Math.max(0, m.needed - m.available);
                const isUnderReady = m.readiness < 100;
                return (
                  <div key={m.skill} className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${isUnderReady ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'bg-slate-900/40 border-slate-800'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black text-white uppercase">{m.skill}</h3>
                      {isUnderReady && <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />}
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className={`text-6xl font-black tracking-tighter ${isUnderReady ? 'text-red-500' : 'text-emerald-500'}`}>{m.readiness}%</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Ready</div>
                    </div>
                    {/* ANIMATED FULL SCREEN BAR */}
                    <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden mb-8 border border-slate-800 p-1">
                      <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isUnderReady ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`} style={{ width: `${m.readiness}%` }} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                        <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Available</div>
                        <div className="text-2xl font-black text-blue-400">{m.available}</div>
                      </div>
                      <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                        <div className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Required</div>
                        <div className="text-2xl font-black text-white">{m.needed}</div>
                      </div>
                    </div>
                    {gap > 0 && (
                      <div className="mt-6 flex items-center justify-center gap-3 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-black uppercase animate-pulse">
                        <TrendingDown size={16}/> Deficit Identified: -{gap.toFixed(1)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showCriticalModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-red-500/30 w-full max-w-2xl rounded-3xl p-8 shadow-2xl">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2"><ShieldAlert className="text-red-500" /> Critical Status</h3>
                <button onClick={() => setShowCriticalModal(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
             </div>
             <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 mb-8">
                {allAssets.filter(a => a.health_score < 50).map(a => (
                  <div key={a.asset_id} className="flex justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                    <div><div className="text-xs font-black text-white">{a.asset_id}</div><div className="text-[9px] text-red-400 font-bold">{a.type}</div></div>
                    <div className="text-xl font-black text-red-500">{a.health_score}%</div>
                  </div>
                ))}
             </div>
             <button onClick={() => { setShowCriticalModal(false); runSchedule(); }} className="w-full py-4 bg-red-600 text-white font-black rounded-xl text-xs uppercase tracking-widest">Execute Emergency Repair</button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- TOPOLOGY COMPONENT (WITH PAN & ZOOM) ---
function TopologyMap({ assets, isFullScreen }: { assets: Asset[], isFullScreen?: boolean }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }));
  };

  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  return (
    <div className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px]"
      onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onMouseMove={handleMouseMove}
      ref={containerRef}>
      
      {/* ZOOMABLE LAYER */}
      <div className="w-full h-full absolute transition-transform duration-75 ease-out origin-center"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}>
        
        {/* CENTER HUB */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className={`${isFullScreen ? 'w-32 h-32' : 'w-20 h-20'} bg-blue-600/10 border-2 border-blue-500 rounded-full flex items-center justify-center animate-pulse`}>
            <Cpu className="text-blue-500" size={isFullScreen ? 40 : 24} />
          </div>
        </div>

        {/* CONNECTING LINES */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {assets.filter(a => (a.health_score || 0) < 50).map((a, i) => (
            <line key={i} x1="50%" y1="50%" x2={`${a.x}%`} y2={`${a.y}%`} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" />
          ))}
        </svg>

        {/* NODES */}
        {assets.map(asset => (
          <div key={asset.asset_id} className="absolute" style={{ left: `${asset.x}%`, top: `${asset.y}%` }}>
            <div className="relative group -translate-x-1/2 -translate-y-1/2">
              <AssetIcon type={asset.type} health={asset.health_score || 100} size={isFullScreen ? 32 : 24} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[8px] opacity-0 group-hover:opacity-100 whitespace-nowrap z-[100]">
                {asset.asset_id} ({asset.health_score}%)
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[150]">
        <button onClick={() => setScale(s => Math.min(s + 0.2, 3))} className="p-3 bg-slate-900 border border-slate-700 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg"><ZoomIn size={18}/></button>
        <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-3 bg-slate-900 border border-slate-700 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg"><ZoomOut size={18}/></button>
        <button onClick={resetView} className="p-3 bg-blue-600 border border-blue-500 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg"><Crosshair size={18}/></button>
      </div>

      <div className="absolute bottom-6 left-6 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-500 pointer-events-none">
        Magnification: <span className="text-blue-500">{scale.toFixed(1)}x</span>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function MetricPanel({ label, value, color, sub, barValue, pulse, icon }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-3xl hover:bg-slate-900/60 transition-all group overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <div className="text-slate-600 group-hover:text-blue-500 transition-colors">{icon}</div>
      </div>
      <p className={`text-4xl font-black tracking-tighter ${color} ${pulse ? "animate-pulse" : ""}`}>{value}</p>
      {barValue !== undefined ? (
        <div className="w-full bg-slate-800 h-1 mt-6 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${barValue}%` }} /></div>
      ) : <p className="text-[9px] text-slate-600 font-bold mt-4 uppercase tracking-tighter">{sub}</p>}
    </div>
  );
}