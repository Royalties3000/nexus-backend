export interface Asset {
  asset_id: string;
  name: string;
  risk_level: number;
  is_operational: boolean;
}

export interface Engineer {
  engineer_id: string;
  name: string;
  fatigue_hours: number;
  max_legal_hours: number;
}

export interface Alert {
  alert_id: string;
  severity: number;
  message: string;
  active: boolean;
}
