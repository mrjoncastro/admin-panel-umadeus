export function logInfo(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.info(...args);
  }
}

import { appendFile } from "fs/promises";
import path from "path";

export async function logConciliacaoErro(message: string) {
  const date = new Date().toISOString().split("T")[0];
  const env = process.env.NODE_ENV || "dev";
  const line = `## [${date}] ${message} - ${env}\n`;
  try {
    const logPath = path.join(process.cwd(), "logs", "ERR_LOG.md");
    await appendFile(logPath, line);
  } catch (err) {
    console.error("Falha ao registrar ERR_LOG", err);
  }
}
