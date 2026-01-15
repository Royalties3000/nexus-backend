import { useState } from 'react';
import { API_BASE } from "../api/client";

export function ManagementConsole() {
  const [assetName, setAssetName] = useState("");
  const [engId, setEngId] = useState("");

  const handleAddAsset = async () => {
    const newAsset = {
      asset_id: Date.now().toString(), // Simple ID generation
      asset_type: assetName,
      risk_level: 5.0,
      health_score: 100.0,
      is_operational: true
    };

    await fetch(`${API_BASE}/assets/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset)
    });
    setAssetName("");
    alert("Asset Registered!");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg my-6 border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-blue-400">Registry Management</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset Registration */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-200">Register New Asset</h3>
          <input 
            className="w-full bg-gray-900 border border-gray-600 p-2 rounded"
            placeholder="e.g. Siemens S7-1500 PLC"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
          />
          <button onClick={handleAddAsset} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm transition">
            Add Machine
          </button>
        </div>

        {/* Engineer Registration */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-200">Register New Engineer</h3>
          <input 
            className="w-full bg-gray-900 border border-gray-600 p-2 rounded"
            placeholder="Engineer ID (e.g. E-42)"
            value={engId}
            onChange={(e) => setEngId(e.target.value)}
          />
          <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm transition">
            Add Worker
          </button>
        </div>
      </div>
    </div>
  );
}