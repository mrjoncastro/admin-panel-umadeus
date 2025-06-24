import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') || formData.get('image') || formData.get('imagem')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const webpBuffer = await sharp(buffer).webp().toBuffer()

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadsDir, { recursive: true })
  const fileName = `${Date.now()}.webp`
  await fs.writeFile(path.join(uploadsDir, fileName), webpBuffer)

  const urlWebp = `/uploads/${fileName}`

  const configPath = path.join(process.cwd(), 'home_sections.config.json')
  let cfg: { images: string[] } = { images: [] }
  try {
    const data = await fs.readFile(configPath, 'utf8')
    cfg = JSON.parse(data)
  } catch {
    /* arquivo inexistente */
  }
  cfg.images.push(urlWebp)
  await fs.writeFile(configPath, JSON.stringify(cfg, null, 2))

  return NextResponse.json({ urlWebp })
}
