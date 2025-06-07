"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

export type AppConfig = {
  font: string;
  primaryColor: string;
  logoUrl: string;
};

const defaultConfig: AppConfig = {
  font: "var(--font-geist)",
  primaryColor: "#7c3aed",
  logoUrl: "/img/logo_umadeus_branco.png",
};

type AppConfigContextType = {
  config: AppConfig;
  updateConfig: (cfg: Partial<AppConfig>) => void;
};

const AppConfigContext = createContext<AppConfigContextType>({
  config: defaultConfig,
  updateConfig: () => {},
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);

  useEffect(() => {
    const stored = localStorage.getItem("app_config");
    if (stored) setConfig(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("app_config", JSON.stringify(config));
    const doc = document.documentElement;
    doc.style.setProperty("--font-body", config.font);
    doc.style.setProperty("--font-heading", config.font);
    doc.style.setProperty("--accent", config.primaryColor);
  }, [config]);

  const updateConfig = (cfg: Partial<AppConfig>) =>
    setConfig((prev) => ({ ...prev, ...cfg }));

  return (
    <AppConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
