export type PatternType = 'diagonal' | 'dots' | 'cross' | 'reverseDiagonal'

export function createPattern(
  type: PatternType,
  color = '#000',
): CanvasPattern {
  const size = 8
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.strokeStyle = color
  ctx.fillStyle = color
  switch (type) {
    case 'diagonal':
      ctx.beginPath()
      ctx.moveTo(0, size)
      ctx.lineTo(size, 0)
      ctx.stroke()
      break
    case 'reverseDiagonal':
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(size, size)
      ctx.stroke()
      break
    case 'cross':
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(size, size)
      ctx.moveTo(size, 0)
      ctx.lineTo(0, size)
      ctx.stroke()
      break
    case 'dots':
    default:
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, 1.5, 0, Math.PI * 2)
      ctx.fill()
      break
  }
  return ctx.createPattern(canvas, 'repeat')!
}
