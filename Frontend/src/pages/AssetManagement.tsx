import React, { useState, useEffect } from "react";
import { Plus, Award, Trash2, X, Check, Database, Shield, Users, Activity, Briefcase } from "lucide-react";

// --- DATA MAPPING ---
const TEAM_CERTIFICATIONS: Record<string, string[]> = {
  "Mechanical Maintenance": ["Millwright (Trade Certificate)", "Fitter and Turner (Trade Certificate)", "Mechanical Fitter (Trade Certificate)", "Boilermaker (Trade Certificate)", "Rigger (Trade Certificate)", "Welder (Trade Certificate)", "National Diploma: Mechanical Engineering", "BEng / BEngTech / BSc Eng (Mechanical)", "GCC Mechanical Engineer (Factories)", "Confined Space Entry Certificate", "Working at Heights Certificate", "Lockout–Tagout Certificate", "Hot Work Permit Certification", "Rigging and Slinging Certificate", "Pressure Equipment Regulations (PER) Competency", "Boiler Operator Certificate", "Vibration Analysis Certification", "Predictive Maintenance Certification", "OEM Machine Maintenance Authorization"],
  "Electrical Maintenance": ["Electrician (Trade Certificate)", "Industrial Electronics Technician (Trade Certificate)", "National Diploma: Electrical Engineering", "BEng / BEngTech / BSc Eng (Electrical)", "GCC Electrical Engineer (Factories)", "ECSA Registration", "Electrical Switching Authorization (LV)", "Electrical Switching Authorization (MV)", "Electrical Switching Authorization (HV)", "Responsible Person (Electrical)", "Authorized Person (Electrical)", "Arc Flash Safety Training Certificate", "Lockout–Tagout Certificate", "Confined Space Entry Certificate", "Working at Heights Certificate", "IECEx 004 / 006", "OEM Electrical System Authorization"],
  "Instrumentation & Control (I&C)": ["Instrumentation Technician (Trade Certificate)", "Industrial Electronics Technician (Trade Certificate)", "National Diploma: Instrumentation / Electrical Engineering", "BEng / BEngTech (Control / Electrical / Mechatronics)", "ECSA Registration", "IECEx 001 / 004 / 007", "Calibration Technician Certification", "Control Valve Maintenance Certification", "Loop Tuning Certification", "Lockout–Tagout Certificate", "Confined Space Entry Certificate", "OEM Instrumentation Authorization"],
  "Automation & PLC Systems": ["Mechatronics Technician (Trade Certificate)", "Industrial Electronics Technician (Trade Certificate)", "National Diploma: Mechatronics / Electrical Engineering", "BEng / BEngTech (Automation / Electrical / Mechatronics)", "ECSA Registration", "PLC Programming Certification (General)", "Safety PLC Programming Certification", "Functional Safety (IEC 61508 / ISO 13849)", "SCADA System Certification", "Industrial Networking Certification", "Lockout–Tagout Certificate", "OEM PLC Platform Certification"],
  "Robotics & Motion Control": ["Mechatronics Technician (Trade Certificate)", "Millwright (Trade Certificate)", "National Diploma: Mechatronics / Mechanical Engineering", "BEng / BEngTech (Mechatronics / Mechanical)", "Robot Manufacturer Certification (ABB / FANUC / KUKA / Yaskawa)", "Servo & Motion Control Certification", "CNC Controller Certification", "Functional Safety Certification", "Working at Heights Certificate", "Lockout–Tagout Certificate", "OEM Robotic Cell Authorization"],
  "Reliability & Asset Engineering": ["National Diploma: Mechanical / Electrical Engineering", "BEng / BEngTech / BSc Eng", "ECSA Registration", "Certified Maintenance & Reliability Professional (CMRP)", "Certified Maintenance & Reliability Technician (CMRT)", "Vibration Analysis (Cat I–IV)", "Infrared Thermography Certification", "Ultrasound Condition Monitoring Certification", "Root Cause Analysis (RCA) Certification", "Asset Management ISO 55001 Awareness", "Predictive Maintenance Certification"],
  "Maintenance Planning & Scheduling": ["National Diploma: Engineering or Operations", "BEng / BEngTech (Maintenance / Industrial)", "ECSA Registration", "CMMS Administration Certification", "Maintenance Strategy Certification", "Shutdown Planning Certification", "Management of Change (MOC) Certification", "ISO 9001 Internal Auditor"],
  "Technical Support / Breakdown Response": ["Millwright (Trade Certificate)", "Electrician (Trade Certificate)", "Mechatronics Technician (Trade Certificate)", "Industrial Electronics Technician", "National Diploma: Engineering", "Multi-Skilled Artisan Certification", "Lockout–Tagout Certificate", "Electrical Switching Authorization (LV)", "Confined Space Entry Certificate", "Working at Heights Certificate", "OEM Rapid Response Authorization"],
  "Utilities & Facilities Engineering": ["Mechanical Fitter (Trade Certificate)", "Electrician (Trade Certificate)", "Boiler Operator Certificate", "Steam Plant Operator Certificate", "Refrigeration Operator Certificate", "Ammonia Plant Safety Certificate", "National Diploma: Mechanical / Electrical Engineering", "BEng / BEngTech", "GCC Mechanical or Electrical Engineer (Factories)", "Pressure Equipment Regulations (PER) Competency", "Electrical Switching Authorization", "Lockout–Tagout Certificate"],
  "Health, Safety & Environment (HSE)": ["OHS Practitioner Certificate", "OHS Representative Certificate", "ISO 45001 Internal Auditor", "ISO 14001 Awareness / Auditor", "Hazard Identification and Risk Assessment (HIRA)", "Incident Investigation Certification", "Fire Fighting Certificate", "Emergency Response Certificate", "First Aid Level 3", "Safety Certificate for Contractors (SCC)"],
  "Quality Assurance & Calibration": ["National Diploma: Engineering / Quality", "BEng / BEngTech", "ISO 9001 Internal Auditor", "Calibration Technician Certification", "Measurement Systems Analysis (MSA)", "Root Cause Analysis Certification", "Statistical Process Control (SPC)", "Management of Change (MOC) Certification"],
  "Projects & Capital Engineering": ["National Diploma: Engineering", "BEng / BEngTech / BSc Eng", "ECSA Registration", "GCC Mechanical or Electrical Engineer (Factories)", "Project Management Certification (PMP / PRINCE2)", "Commissioning Engineer Certification", "Functional Safety Certification", "OEM Commissioning Authorization", "Lockout–Tagout Certificate"],
  "Engineering & Maintenance Management": ["BEng / BEngTech / BSc Eng", "ECSA Registration (Professional)", "GCC Mechanical or Electrical Engineer (Factories)", "Certified Maintenance Manager (CMM)", "Asset Management ISO 55001", "ISO 9001 / 45001 Auditor", "Management of Change (MOC)", "Legal Appointments (OHS Act Sections 8 & 16)"]
};

const TEAMS = Object.keys(TEAM_CERTIFICATIONS);

interface Asset {
  asset_id: string;
  asset_type: string;
  model_class: string;
  serial_key: string;
  health_score: number;
  risk_level: number;
  responsible_teams: string[];
  required_certifications: string[];
}

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterTeam, setFilterTeam] = useState<string>("All Divisions");
  
  const generateId = () => `ASSET-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

  const [formData, setFormData] = useState({
    asset_id: generateId(),
    asset_type: "", 
    model_class: "",
    serial_key: "",
    health_score: 100,
    risk_level: 1, 
    responsible_teams: [] as string[],
    required_certifications: [] as string[]
  });

  const availableCerts = Array.from(new Set(
    formData.responsible_teams.flatMap(team => TEAM_CERTIFICATIONS[team] || [])
  ));

  const fetchAssets = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/assets");
      const data = await response.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) { console.error("FETCH_ERROR:", err); }
  };

  useEffect(() => { fetchAssets(); }, []);

  // --- FIXED DELETE HANDLER ---
  const handleDeleteAsset = async (id: string) => {
    if (!id) return;
    if (!window.confirm(`DECOMMISSION SYSTEM: Confirm permanent removal of ${id}?`)) return;
    
    try {
      // Build URL explicitly to avoid trailing slash redirects
      const url = `http://127.0.0.1:8000/assets/${id}`;
      
      const res = await fetch(url, { 
        method: "DELETE",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
      });

      if (res.ok) {
        setAssets(prev => prev.filter(a => a.asset_id !== id));
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Delete failed: ${errorData.detail || "Server rejected request"}`);
      }
    } catch (err) {
      console.error("CONNECTION_ERROR:", err);
      alert("Network Error: Could not reach the API server.");
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.responsible_teams.length === 0) return alert("Select at least one division.");
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/assets/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        await fetchAssets();
        setIsModalOpen(false);
        setFormData({ 
            asset_id: generateId(), 
            asset_type: "", 
            model_class: "", 
            serial_key: "", 
            health_score: 100, 
            risk_level: 1, 
            responsible_teams: [], 
            required_certifications: [] 
        });
      }
    } finally { setLoading(false); }
  };

  const getRiskMetadata = (level: number) => {
    if (level >= 9) return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/50", glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]" };
    if (level >= 7) return { label: "HIGH", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/50", glow: "hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]" };
    if (level >= 4) return { label: "MEDIUM", color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/50", glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]" };
    return { label: "LOW", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/50", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]" };
  };

  const filteredAssets = filterTeam === "All Divisions" 
    ? assets 
    : assets.filter(a => a.responsible_teams?.includes(filterTeam));

  return (
    <div className="p-8 font-mono text-slate-200 min-h-screen bg-[#020617]">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 bg-slate-900/20 p-8 rounded-[2rem] border border-slate-800/50">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white flex items-center gap-3">
            <Database className="text-blue-500" size={32} /> Asset_Registry
          </h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.4em] mt-2">Hardware Inventory & Multi-Division Mapping</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <select 
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-[10px] font-black uppercase text-blue-400 outline-none focus:border-blue-500 transition-all cursor-pointer grow lg:grow-0"
          >
            <option>All Divisions</option>
            {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-blue-400/20 shadow-lg flex items-center gap-2">
            <Plus size={16} /> Initialize Unit
          </button>
        </div>
      </div>

      {/* ASSET GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredAssets.map((asset) => {
          const risk = getRiskMetadata(asset.risk_level);
          const healthColor = asset.health_score > 60 ? 'bg-emerald-500' : asset.health_score > 30 ? 'bg-yellow-500' : 'bg-red-500';
          
          return (
            <div key={asset.asset_id} className={`bg-[#0d1117] border border-slate-800 p-8 rounded-[2.5rem] group transition-all duration-500 relative flex flex-col min-h-[550px] ${risk.glow}`}>
              <button 
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAsset(asset.asset_id);
                }} 
                className="absolute top-8 right-8 text-slate-700 hover:text-red-500 transition-all z-20 p-2 hover:bg-red-500/10 rounded-full"
              >
                <Trash2 size={20} />
              </button>

              {/* CARD TOP: IDENTITY */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black text-blue-500 tracking-widest bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20">{asset.asset_id}</span>
                  <div className={`${risk.bg} ${risk.border} border px-2 py-1 rounded text-[8px] font-black ${risk.color}`}>{risk.label}</div>
                </div>
                <h3 className="text-2xl font-black text-white uppercase leading-tight mb-2">{asset.asset_type}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                   <Activity size={12}/> SN: {asset.serial_key} // {asset.model_class}
                </p>
              </div>

              {/* HEALTH MONITOR */}
              <div className="mb-8 space-y-3 bg-slate-950/40 p-5 rounded-2xl border border-slate-800/50">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">System Integrity</span>
                  <span className={asset.health_score > 60 ? "text-emerald-500" : "text-red-500"}>{asset.health_score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${healthColor}`} style={{ width: `${asset.health_score}%` }} />
                </div>
              </div>

              {/* RESPONSIBLE TEAMS */}
              <div className="mb-8">
                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Briefcase size={12} className="text-slate-600"/> Stakeholder Divisions
                </h4>
                <div className="flex flex-wrap gap-2 max-h-[80px] overflow-y-auto pr-2 custom-scrollbar">
                  {asset.responsible_teams?.map(team => (
                    <span key={team} className="text-[8px] text-white font-black px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 flex items-center gap-2 uppercase">
                      <Shield size={10} className="text-blue-400" /> {team}
                    </span>
                  ))}
                </div>
              </div>

              {/* CLEARANCE LIST */}
              <div className="mt-auto pt-6 border-t border-slate-800/50">
                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Award size={12} className="text-slate-600"/> Required Authorization
                </h4>
                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                  {asset.required_certifications?.map(cert => (
                    <div key={cert} className="flex items-center gap-3 text-[9px] text-slate-400 font-bold uppercase bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/30">
                      <Check size={14} className="text-blue-500 shrink-0" /> 
                      <span className="truncate">{cert}</span>
                    </div>
                  ))}
                  {(!asset.required_certifications || asset.required_certifications.length === 0) && (
                    <div className="text-[10px] text-slate-700 font-black italic p-2 tracking-widest">NO CLEARANCE REQUIRED</div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-6">
          <div className="bg-[#0d1117] border border-slate-800 w-full max-w-6xl rounded-[3rem] p-12 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-all hover:rotate-90"><X size={32} /></button>
            <div className="mb-12 border-l-4 border-blue-600 pl-8">
                <h2 className="text-4xl font-black tracking-tighter uppercase text-white">Initialize_Unit</h2>
                <p className="text-xs text-slate-500 uppercase mt-2 font-bold tracking-[0.3em]">Configure System Parameters & Personnel Mapping</p>
            </div>
            
            <form onSubmit={handleAddAsset} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-4 tracking-widest">Hardware Specs</label>
                  <div className="space-y-4">
                    <input required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all" value={formData.asset_type} onChange={(e) => setFormData({...formData, asset_type: e.target.value})} placeholder="Asset Type" />
                    <input required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all" value={formData.serial_key} onChange={(e) => setFormData({...formData, serial_key: e.target.value})} placeholder="Serial Key" />
                    <input required className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all" value={formData.model_class} onChange={(e) => setFormData({...formData, model_class: e.target.value})} placeholder="Model / Hardware Class" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-orange-500 uppercase mb-4 tracking-widest">Risk Level: {formData.risk_level}</label>
                  <input type="range" min="1" max="10" className="w-full accent-orange-500" value={formData.risk_level} onChange={(e) => setFormData({...formData, risk_level: parseInt(e.target.value)})} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Select Stakeholders</label>
                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
                  {TEAMS.map(team => (
                    <button key={team} type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, responsible_teams: prev.responsible_teams.includes(team) ? prev.responsible_teams.filter(t => t !== team) : [...prev.responsible_teams, team] }))}
                      className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${formData.responsible_teams.includes(team) ? "bg-emerald-600/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"}`}>
                      {team} {formData.responsible_teams.includes(team) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Map Authorization</label>
                <div className="flex-1 bg-slate-950 border border-slate-800 p-6 rounded-[2rem] overflow-y-auto max-h-[400px] custom-scrollbar">
                  {availableCerts.map(cert => (
                    <button key={cert} type="button" onClick={() => setFormData(prev => ({
                      ...prev, required_certifications: prev.required_certifications.includes(cert) ? prev.required_certifications.filter(c => c !== cert) : [...prev.required_certifications, cert]
                    }))}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border text-[9px] font-black uppercase text-left transition-all mb-2 ${formData.required_certifications.includes(cert) ? "bg-blue-600/20 border-blue-500 text-white" : "bg-transparent border-slate-800 text-slate-600 hover:border-slate-700"}`}>
                      <span className="truncate pr-4">{cert}</span>
                      {formData.required_certifications.includes(cert) && <Check size={14} className="shrink-0" />}
                    </button>
                  ))}
                </div>
                <button type="submit" disabled={loading} className="w-full mt-8 py-7 rounded-3xl bg-blue-600 text-white font-black text-[12px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all active:scale-[0.98]">
                  {loading ? "COMMITTING DATA..." : "Confirm Deployment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}