"use client";
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { generatePrimaryShades } from "@/utils/primaryShades";
import createPocketBase from "@/lib/pocketbase";

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
  const [configId, setConfigId] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      if (typeof window === "undefined") return;

      try {
        const tenantRes = await fetch("/api/tenant");
        if (tenantRes.ok) {
          const { tenantId } = await tenantRes.json();
          if (tenantId) {
            const pb = createPocketBase();
            const cliente = await pb
              .collection("clientes_config")
              .getFirstListItem(`cliente='${tenantId}'`);
            setConfigId(cliente.id);
            const cfg: AppConfig = {
              font: cliente.font || defaultConfig.font,
              primaryColor: cliente.cor_primary || defaultConfig.primaryColor,
              logoUrl: cliente.logo_url || defaultConfig.logoUrl,
            };
            setConfig(cfg);
            localStorage.setItem("app_config", JSON.stringify(cfg));
            return;
          }
        }
      } catch {
        /* ignore */
      }

      const token = localStorage.getItem("pb_token");
      const user = localStorage.getItem("pb_user");

      if (token && user) {
        try {
          const res = await fetch("/admin/api/configuracoes", {
            headers: {
              Authorization: `Bearer ${token}`,
              "X-PB-User": user,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setConfig({
              font: data.font || defaultConfig.font,
              primaryColor: data.cor_primary || defaultConfig.primaryColor,
              logoUrl: data.logo_url || defaultConfig.logoUrl,
            });
            return;
          }
        } catch {
          /* ignore */
        }
      }

      const stored = localStorage.getItem("app_config");
      if (stored) setConfig(JSON.parse(stored));
    }

    loadConfig();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem("app_config", JSON.stringify(config));
    document.documentElement.style.setProperty("--font-body", config.font);
    document.documentElement.style.setProperty("--font-heading", config.font);
    document.documentElement.style.setProperty("--accent", config.primaryColor);
    const shades = generatePrimaryShades(config.primaryColor);
    document.documentElement.style.setProperty("--accent-900", shades["900"]);
    Object.entries(shades).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--primary-${key}`, value);
    });
  }, [config]);

  const updateConfig = (cfg: Partial<AppConfig>) => {
    const newCfg = { ...config, ...cfg };
    setConfig(newCfg);

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("pb_token");
      const user = localStorage.getItem("pb_user");
      if (token && user && configId) {
        fetch("/admin/api/configuracoes", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-PB-User": user,
          },
          body: JSON.stringify({
            id: configId,
            cor_primary: newCfg.primaryColor,
            logo_url: newCfg.logoUrl,
            font: newCfg.font,
          }),
        }).catch((err) => console.error("Erro ao salvar config:", err));
      }
    }
  };

  return (
    <AppConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
