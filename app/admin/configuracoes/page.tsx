"use client";
import { useState, useRef, ChangeEvent } from "react";
import { useAppConfig } from "@/lib/context/AppConfigContext";
import Image from "next/image";

export default function ConfiguracoesPage() {
  const { config, updateConfig } = useAppConfig();
  const [font, setFont] = useState(config.font);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setLogoUrl(url);
      updateConfig({ logoUrl: url });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateConfig({ font, primaryColor, logoUrl });
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configurações do App</h1>
      <div className="space-y-4">
        <label className="block">
          <span className="block mb-1">Fonte</span>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="input-base"
          >
            <option value="var(--font-geist)">Geist</option>
            <option value="var(--font-bebas)">Bebas Neue</option>
            <option value="Arial, sans-serif">Arial</option>
          </select>
        </label>
        <label className="block">
          <span className="block mb-1">Cor Primária</span>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-16 h-8 p-0 border-none"
          />
        </label>
        <label className="block">
          <span className="block mb-1">Logo</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
        </label>
        {logoUrl && (
          <Image src={logoUrl} alt="Logo" width={64} height={64} className="h-16 w-auto" />
        )}
      </div>
      <button onClick={handleSave} className="btn btn-primary">
        Salvar
      </button>
    </div>
  );
}
