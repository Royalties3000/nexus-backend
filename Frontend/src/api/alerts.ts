import { apiGet } from "./client";
import type { Alert } from "../types/alerts";

export const fetchAlerts = () => {
  return apiGet<Alert[]>("/alerts");
};

export default fetchAlerts;
