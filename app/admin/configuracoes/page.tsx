"use client";
import { useState, useRef, ChangeEvent } from "react";
import { useAppConfig } from "@/lib/context/AppConfigContext";
import Image from "next/image";

// Lista de tons proibidos (branco, quase branco, preto, quase preto)
const BLOCKED_COLORS = [
  "#fff",
  "#ffffff",
  "#f8f8f8",
  "#f9f9f9",
  "#f7f7f7",
  "#fafafa",
  "#000",
  "#000000",
  "#111",
  "#111111",
  "#1a1a1a",
  "#222",
  "#222222",
];

function isBlockedColor(hex: string) {
  if (!hex) return false;
  hex = hex.toLowerCase();
  if (BLOCKED_COLORS.includes(hex)) return true;

  // Converte para rgb
  const c = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0;
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16);
    g = parseInt(c[1] + c[1], 16);
    b = parseInt(c[2] + c[2], 16);
  } else if (c.length === 6) {
    r = parseInt(c.substr(0, 2), 16);
    g = parseInt(c.substr(2, 2), 16);
    b = parseInt(c.substr(4, 2), 16);
  }
  // Checa se está muito claro ou muito escuro
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 245 || luminance < 15;
}

// Checa se cor é clara, para ajuste de texto no botão
function isColorLight(hex: string) {
  const c = hex.replace("#", "");
  let r = 0,
    g = 0,
    b = 0;
  if (c.length === 3) {
    r = parseInt(c[0] + c[0], 16);
    g = parseInt(c[1] + c[1], 16);
    b = parseInt(c[2] + c[2], 16);
  } else if (c.length === 6) {
    r = parseInt(c.substr(0, 2), 16);
    g = parseInt(c.substr(2, 2), 16);
    b = parseInt(c.substr(4, 2), 16);
  }
  return 0.299 * r + 0.587 * g + 0.114 * b > 186;
}

const fontes = [
  { label: "Geist", value: "var(--font-geist)" },
  { label: "Bebas Neue", value: "var(--font-bebas)" },
  { label: "Arial", value: "Arial, sans-serif" },
];

export default function ConfiguracoesPage() {
  const { config, updateConfig } = useAppConfig();
  const [font, setFont] = useState(config.font);
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [logoUrl, setLogoUrl] = useState(config.logoUrl);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Preview dinâmico
  if (typeof window !== "undefined") {
    document.documentElement.style.setProperty("--font-body", font);
    document.documentElement.style.setProperty("--font-heading", font);
    document.documentElement.style.setProperty("--accent", primaryColor);
  }

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.type === "text") {
      const url = e.target.value;
      setLogoUrl(url);
      updateConfig({ logoUrl: url });
      return;
    }
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

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setPrimaryColor(color);

    if (isBlockedColor(color)) {
      setError(
        "Por favor, escolha uma cor mais escura ou mais viva (evite branco/preto)."
      );
    } else {
      setError("");
    }
  };

  const handleSave = () => {
    if (isBlockedColor(primaryColor)) {
      setError("Cor inválida. Escolha uma cor mais escura ou mais viva.");
      return;
    }
    updateConfig({ font, primaryColor, logoUrl });
    setError("");
  };

  const isLight = isColorLight(primaryColor);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-8 card">
      <h1 className="text-2xl font-bold">Configurações do App</h1>
      <div className="space-y-4">
        <label className="block">
          <span className="block mb-1">Fonte</span>
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="input-base"
            style={{ fontFamily: font }}
          >
            {fontes.map((f) => (
              <option
                key={f.value}
                value={f.value}
                style={{ fontFamily: f.value }}
              >
                {f.label}
              </option>
            ))}
          </select>
          <span
            className="mt-2 block text-xs text-neutral-600"
            style={{ fontFamily: font }}
          >
            Prévia da fonte: UMADEUS Portal
          </span>
        </label>
        <label className="block">
          <span className="block mb-1">Cor Primária</span>
          <input
            type="color"
            value={primaryColor}
            onChange={handleColorChange}
            className="w-16 h-8 p-0 border-none"
            style={{ background: primaryColor }}
          />
          <span
            className="inline-block ml-3 align-middle text-xs"
            style={{ color: primaryColor, fontWeight: 600 }}
          >
            {primaryColor}
          </span>
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <label className="block">
          <span className="block mb-1">Logo (URL ou Upload)</span>
          <input
            type="text"
            value={logoUrl.startsWith("data:") ? "" : logoUrl}
            placeholder="Cole a URL do logo"
            onChange={handleLogoChange}
            className="input-base mb-2"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="input-base"
          />
        </label>
        {logoUrl && (
          <div className="mt-2 flex items-center gap-2">
            <Image
              src={logoUrl}
              alt="Logo"
              width={64}
              height={64}
              className="h-16 w-auto rounded border border-neutral-200 bg-white p-1"
            />
            <span className="text-xs text-neutral-500">Prévia</span>
          </div>
        )}
        <div className="mt-4">
          <span className="block mb-1 text-sm">Preview do botão:</span>
          <button
            className="btn btn-primary w-40"
            style={{
              background: primaryColor,
              color: isLight ? "#222" : "#fff",
              border: "1px solid #ddd",
            }}
            disabled={!!error}
          >
            Salvar
          </button>
        </div>
      </div>
      <button
        onClick={handleSave}
        className="btn btn-primary w-full"
        style={{
          background: primaryColor,
          color: isLight ? "#222" : "#fff",
        }}
        disabled={!!error}
      >
        Salvar Configurações
      </button>
    </div>
  );
}
