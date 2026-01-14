import { apiGet } from "./client";
import type { Asset } from "../types/asset";

export function fetchAssets() {
  return apiGet<Asset[]>("/assets");
}
