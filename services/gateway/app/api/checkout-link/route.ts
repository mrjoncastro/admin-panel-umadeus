import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.CAMISETA_CHECKOUT_URL

  if (!url) {
    return NextResponse.json(
      { error: 'Checkout URL not configured' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url })
}
