import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const sports = await db.sport.findMany({
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ sports })
  } catch (error) {
    console.error('Error fetching sports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sports' },
      { status: 500 }
    )
  }
}
