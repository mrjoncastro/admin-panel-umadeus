// utils/isExternalUrl.ts

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
