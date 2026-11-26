import { createContext, useContext } from "react";
import type { SiteData } from "../types";

export interface SiteState {
  site: SiteData;
  loaded: boolean; // true once the backend has answered
  failed: boolean; // true if the backend couldn't be reached
  reload: () => Promise<void>;
}

export const SiteContext = createContext<SiteState | null>(null);

// Read the site data from any component: const { site } = useSite();
export function useSite(): SiteState {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite() must be used inside <SiteProvider>");
  return value;
}
