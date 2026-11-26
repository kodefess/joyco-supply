"use client";

import { createContext, useContext } from "react";

import type { PublicSettings } from "@/lib/settings";

const SettingsContext = createContext<PublicSettings | null>(null);

/** Pengaturan situs dari admin, untuk komponen client. */
export function SettingsProvider({ settings, children }: { settings: PublicSettings; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const s = useContext(SettingsContext);
  if (!s) throw new Error("useSettings harus di dalam SettingsProvider");
  return s;
}
