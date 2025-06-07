"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { generateHslShades } from "@/utils/colorShades";

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
    localStorage.setItem("app_config", JSON.stringify(config));
    document.documentElement.style.setProperty("--font-body", config.font);
    document.documentElement.style.setProperty("--font-heading", config.font);
    document.documentElement.style.setProperty("--accent", config.primaryColor);
    const shades = generateHslShades(config.primaryColor);
    Object.entries(shades).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--primary-${key}`, value);
    });
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
