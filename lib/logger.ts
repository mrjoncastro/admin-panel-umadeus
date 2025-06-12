export function logInfo(...args: unknown[]) {
  if (process.env.NODE_ENV !== "production") {
    console.info(...args);
  }
}
