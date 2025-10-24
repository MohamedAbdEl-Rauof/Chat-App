import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room from '@/models/Room';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { name, type, participants } = await request.json();

    if (!name || !type || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'Name, type, and participants are required' },
        { status: 400 }
      );
    }

    if (type === 'direct' && participants.length === 2) {
      const existingRoom = await Room.findOne({
        type: 'direct',
        participants: { $all: participants },
      }).populate('participants', 'username avatar');

      if (existingRoom) {
        return NextResponse.json({
          success: true,
          room: existingRoom,
          existed: true,
        });
      }
    }

    const room = await Room.create({
      name,
      type,
      participants,
    });

    const populatedRoom = await Room.findById(room._id).populate(
      'participants',
      'username avatar'
    );

    return NextResponse.json({
      success: true,
      room: populatedRoom,
      existed: false,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

