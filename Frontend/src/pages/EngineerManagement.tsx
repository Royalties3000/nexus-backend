import { useState, useEffect } from "react";
import { API_BASE } from "../api/client";
import { Header } from "../components/Header";

// --- DATA MAPPING ---
const TEAM_CERTIFICATIONS: Record<string, string[]> = {
  "Mechanical Maintenance": ["Millwright (Trade Certificate)", "Fitter and Turner (Trade Certificate)", "Mechanical Fitter (Trade Certificate)", "Boilermaker (Trade Certificate)", "Rigger (Trade Certificate)", "Welder (Trade Certificate)", "National Diploma: Mechanical Engineering", "BEng / BEngTech / BSc Eng (Mechanical)", "GCC Mechanical Engineer (Factories)", "Confined Space Entry Certificate", "Working at Heights Certificate", "Lockout–Tagout Certificate", "Hot Work Permit Certification", "Rigging and Slinging Certificate", "Pressure Equipment Regulations (PER) Competency", "Boiler Operator Certificate", "Vibration Analysis Certification", "Predictive Maintenance Certification", "OEM Machine Maintenance Authorization"],
  "Electrical Maintenance": ["Electrician (Trade Certificate)", "Industrial Electronics Technician (Trade Certificate)", "National Diploma: Electrical Engineering", "BEng / BEngTech / BSc Eng (Electrical)", "GCC Electrical Engineer (Factories)", "ECSA Registration (Pr Eng / Pr Tech Eng / Pr Eng Tech)", "Electrical Switching Authorization (LV)", "Electrical Switching Authorization (MV)", "Electrical Switching Authorization (HV)", "Responsible Person (Electrical)", "Authorized Person (Electrical)", "Arc Flash Safety Training Certificate", "Lockout–Tagout Certificate", "Confined Space Entry Certificate", "Working at Heights Certificate", "IECEx 004 / 006", "OEM Electrical System Authorization"],
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

interface Engineer {
  engineer_id: string;
  name: string;
  team: string;
  certifications: string[];
  skill_matrix: { repairSpeed: number; diagnostics: number; troubleshooting: number };
  availability: string;
  fatigue: number;
}

export default function EngineerManagement() {
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    team: TEAMS[0],
    certifications: [] as string[],
    skill_matrix: { repairSpeed: 5, diagnostics: 5, troubleshooting: 5 },
    availability: "Day",
  });

  useEffect(() => { fetchEngineers(); }, []);

  useEffect(() => {
    setFormData(prev => ({ ...prev, certifications: [] }));
  }, [formData.team]);

  async function fetchEngineers() {
    try {
      const res = await fetch(`${API_BASE}/engineers`);
      if (res.ok) {
        const data = await res.json();
        setEngineers(data);
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }

  async function handleAddEngineer() {
    if (!formData.name.trim()) return alert("Enter Personnel Name");
    try {
      const newEngineer = {
        ...formData,
        engineer_id: `ENG-${Math.floor(Math.random() * 9000 + 1000)}`,
        fatigue: 0,
      };
      const res = await fetch(`${API_BASE}/engineers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEngineer),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ name: "", team: TEAMS[0], certifications: [], skill_matrix: { repairSpeed: 5, diagnostics: 5, troubleshooting: 5 }, availability: "Day" });
        await fetchEngineers();
      }
    } catch (err) {
      console.error("Add failed", err);
    }
  }

  async function handleDeleteEngineer(id: string) {
    if (!window.confirm(`PROMPT: Confirm permanent decommissioning of ${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/engineers/${id}`, { method: "DELETE" });
      if (res.ok) setEngineers(prev => prev.filter(e => e.engineer_id !== id));
      if (selectedEngineer?.engineer_id === id) setSelectedEngineer(null);
    } catch (err) {
      alert("Network Error: Personnel Command Unreachable.");
    }
  }

  const toggleCert = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 font-mono relative pb-20">
      <Header title="Personnel Command" subtitle="Manage specialized engineering divisions and shift rotations" />

      {/* Logic-Driven Shift Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl backdrop-blur-md flex justify-between items-center col-span-1 md:col-span-3">
          <div className="flex gap-6 items-center">
            <ShiftPill label="Day" count={engineers.filter(e => e.availability === "Day").length} color="bg-amber-500" />
            <ShiftPill label="Swing" count={engineers.filter(e => e.availability === "Swing").length} color="bg-emerald-500" />
            <ShiftPill label="Night" count={engineers.filter(e => e.availability === "Night").length} color="bg-indigo-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total_Force: {engineers.length}</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
            showForm ? "bg-red-900/20 text-red-500 border border-red-500/50" : "bg-blue-600 text-black hover:bg-blue-500 shadow-lg shadow-blue-900/20"
          }`}
        >
          {showForm ? "✕ Close Form" : "+ Recruit Personnel"}
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900 border border-blue-900/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-500"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  placeholder="Personnel Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Division</label>
                  <select
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                  >
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Shift Assignment</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-xs"
                  >
                    <option value="Day">Day (06:00 - 14:00)</option>
                    <option value="Swing">Swing (14:00 - 22:00)</option>
                    <option value="Night">Night (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Performance Baseline</label>
                {["repairSpeed", "diagnostics", "troubleshooting"].map((skill) => (
                  <div key={skill} className="space-y-1">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>{skill.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-blue-400">{formData.skill_matrix[skill as keyof typeof formData.skill_matrix]}/10</span>
                    </div>
                    <input
                      type="range" min="1" max="10"
                      value={formData.skill_matrix[skill as keyof typeof formData.skill_matrix]}
                      onChange={(e) => setFormData({
                        ...formData,
                        skill_matrix: { ...formData.skill_matrix, [skill]: parseInt(e.target.value) }
                      })}
                      className="w-full accent-blue-600 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-4 block">
                Authorization Badges: <span className="text-emerald-400">{formData.team}</span>
              </label>
              <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
                {TEAM_CERTIFICATIONS[formData.team].map((cert) => (
                  <label key={cert} className={`flex items-center gap-3 p-2 rounded-lg border transition-all cursor-pointer ${
                    formData.certifications.includes(cert) ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400" : "border-slate-800 text-slate-500"
                  }`}>
                    <input type="checkbox" className="hidden" checked={formData.certifications.includes(cert)} onChange={() => toggleCert(cert)} />
                    <span className="text-[9px] font-bold uppercase">{cert}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddEngineer}
            className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-xl uppercase tracking-widest shadow-lg shadow-emerald-900/20"
          >
            Authorize Deployment_
          </button>
        </div>
      )}

      {/* Grid of Personnel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {engineers.map((eng) => (
          <div 
            key={eng.engineer_id} 
            onClick={() => setSelectedEngineer(eng)}
            className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl group hover:border-blue-500/50 hover:bg-slate-900 transition-all relative overflow-hidden cursor-pointer active:scale-95"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-white uppercase tracking-tighter text-xl">{eng.name}</h3>
                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase text-black ${
                    eng.availability === 'Day' ? 'bg-amber-500' : eng.availability === 'Swing' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}>
                    {eng.availability}
                  </span>
                </div>
                <span className="text-[10px] text-blue-500 font-bold uppercase">{eng.engineer_id} • {eng.team}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteEngineer(eng.engineer_id); }} 
                className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/50 z-10"
              >
                <TrashIcon />
              </button>
            </div>

            {/* Preview of certs */}
            <div className="flex flex-wrap gap-1 mb-6 min-h-[40px]">
              {(eng.certifications || []).slice(0, 3).map(c => (
                <span key={c} className="text-[8px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-bold uppercase">
                  {c}
                </span>
              ))}
              {(eng.certifications || []).length > 3 && (
                <span className="text-[8px] text-slate-500 font-bold uppercase">+{(eng.certifications || []).length - 3} MORE</span>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/50">
              {/* FIXED: Passing explicit values with fallback */}
              <SkillBar label="Diag" value={eng.skill_matrix?.diagnostics ?? 0} />
              <SkillBar label="Repair" value={eng.skill_matrix?.repairSpeed ?? 0} />
            </div>

            {/* Hint for click */}
            <div className="absolute bottom-2 right-4 text-[7px] text-slate-700 uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Click to Expand Telemetry_
            </div>
          </div>
        ))}
      </div>

      {/* --- EXPANDED MODAL VIEW --- */}
      {selectedEngineer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-200" onClick={() => setSelectedEngineer(null)}>
          <div 
            className="bg-slate-900 border border-blue-500/30 w-full max-w-2xl rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400"></div>
            
            <button 
              onClick={() => setSelectedEngineer(null)}
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedEngineer.name}</h2>
                  <span className={`text-xs px-2 py-1 rounded font-black uppercase text-black ${
                    selectedEngineer.availability === 'Day' ? 'bg-amber-500' : selectedEngineer.availability === 'Swing' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}>
                    {selectedEngineer.availability} Shift
                  </span>
                </div>
                <p className="text-blue-500 font-bold uppercase tracking-widest text-sm">
                  {selectedEngineer.engineer_id} // Division: {selectedEngineer.team}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Detailed Skills */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800 pb-2">Competency Matrix</h4>
                <div className="space-y-4">
                  {/* FIXED: Explicitly passing values to BigSkillBar */}
                  <BigSkillBar label="Diagnostic Capabilities" value={selectedEngineer.skill_matrix?.diagnostics ?? 0} />
                  <BigSkillBar label="Repair Velocity" value={selectedEngineer.skill_matrix?.repairSpeed ?? 0} />
                  <BigSkillBar label="Troubleshooting Logic" value={selectedEngineer.skill_matrix?.troubleshooting ?? 0} />
                </div>

                <div className="mt-8 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 mb-2">
                    <span>Shift Fatigue Level</span>
                    <span className={selectedEngineer.fatigue > 70 ? "text-red-500" : "text-emerald-500"}>{selectedEngineer.fatigue}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${selectedEngineer.fatigue > 70 ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${selectedEngineer.fatigue}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Full Certifications */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-slate-800 pb-2">Authorization Badges</h4>
                <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(selectedEngineer.certifications || []).length > 0 ? (
                    (selectedEngineer.certifications || []).map(c => (
                      <span key={c} className="text-[10px] bg-blue-500/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-lg font-bold uppercase">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-600 italic">No certifications authorized.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setSelectedEngineer(null)}
                className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
              >
                Close Registry Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Expanded Helper Components ---

function BigSkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase font-black text-slate-400">
        <span>{label}</span>
        <span className="text-blue-400">{value}/10</span>
      </div>
      <div className="w-full bg-slate-950 h-2 rounded-full border border-slate-800 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-700 to-blue-400 h-full transition-all duration-1000 ease-out" 
          style={{ width: `${Math.min(value * 10, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function ShiftPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      <span className="text-[9px] font-black uppercase text-slate-300">{label}: {count}</span>
    </div>
  );
}

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[8px] uppercase font-black text-slate-500">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
        <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${Math.min(value * 10, 100)}%` }}></div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}