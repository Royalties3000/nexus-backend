export interface Assignment {
  id: string;
  asset_id: string;
  asset_name: string;
  engineer_name: string;
  type: "CRITICAL" | "ROUTINE" | "DECAY_REPAIR";
  
  // NEW PRECISION FIELDS
  signal_received_at: string; // When health first dropped
  scheduled_start: string;    // Predicted start (ISO)
  scheduled_end: string;      // Predicted end (ISO)
  
  // REAL-TIME AUDIT FIELDS
  actual_start_at?: string;    // When engineer clicked 'Start'
  actual_completed_at?: string; // When engineer clicked 'Complete'
}