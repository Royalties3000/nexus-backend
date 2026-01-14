export const DURATION_RULES: Record<string, { baseMin: number; bufferMin: number }> = {
  "Main Conveyor Line": { baseMin: 180, bufferMin: 30 }, // High risk
  "Packaging Robot": { baseMin: 90, bufferMin: 15 },
  "CNC Milling Machine": { baseMin: 120, bufferMin: 45 },
  "HV Transformer": { baseMin: 240, bufferMin: 60 },
  "SCADA Server": { baseMin: 45, bufferMin: 0 },
  "Boiler Plant": { baseMin: 200, bufferMin: 30 },
  "DEFAULT": { baseMin: 60, bufferMin: 15 }
};

export const calculateEstimatedEnd = (startTime: string, assetType: string): string => {
  const rule = DURATION_RULES[assetType] || DURATION_RULES["DEFAULT"];
  const start = new Date(startTime);
  const end = new Date(start.getTime() + (rule.baseMin + rule.bufferMin) * 60000);
  return end.toISOString();
};