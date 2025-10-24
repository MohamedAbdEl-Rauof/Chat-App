import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Message from '@/models/Message';
import Room from '@/models/Room';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { roomId, senderId, senderUsername, content } = await request.json();

    if (!roomId || !senderId || !senderUsername || !content) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const message = await Message.create({
      roomId,
      senderId,
      senderUsername,
      content,
    });

    await Room.findByIdAndUpdate(roomId, {
      lastActivity: new Date(),
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

