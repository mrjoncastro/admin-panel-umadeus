export function hexToHsl(hex?: string | null): [number, number, number] {
  let sanitized = (hex ?? '#000000').replace('#', '')
  if (sanitized.length === 3) {
    sanitized = sanitized
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = parseInt(sanitized.substring(0, 2), 16) / 255
  const g = parseInt(sanitized.substring(2, 4), 16) / 255
  const b = parseInt(sanitized.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export function generatePrimaryShades(hex: string): Record<string, string> {
  const [h, s, l] = hexToHsl(hex)
  const steps: Record<string, number> = {
    50: 42,
    100: 32,
    200: 24,
    300: 16,
    400: 8,
    500: 4,
    600: 0,
    700: -8,
    800: -16,
    900: -24,
  }

  const shades: Record<string, string> = {}
  Object.keys(steps).forEach((key) => {
    const delta = steps[key]
    const newL = Math.max(0, Math.min(100, l + delta))
    shades[key] = `${h} ${s}% ${newL}%`
  })

  return shades
}
