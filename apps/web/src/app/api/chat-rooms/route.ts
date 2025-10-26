import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const chatRooms = await db.chatRoom.findMany({
      include: {
        league: {
          select: { name: true, slug: true },
          include: {
            sport: {
              select: { name: true }
            }
          }
        }
      },
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ chatRooms })
  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    )
  }
}
