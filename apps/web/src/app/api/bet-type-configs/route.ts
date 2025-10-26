import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const betTypeConfigs = await db.betTypeConfig.findMany({
      where: { isActive: true },
      orderBy: { betType: 'asc' }
    })

    return NextResponse.json({ betTypeConfigs })
  } catch (error) {
    console.error('Error fetching bet type configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bet type configs' },
      { status: 500 }
    )
  }
}
