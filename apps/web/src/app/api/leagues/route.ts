import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const leagues = await db.league.findMany({
      include: {
        sport: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ leagues })
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
}
