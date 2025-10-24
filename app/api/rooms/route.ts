import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Room from '@/models/Room';
import Message from '@/models/Message';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const rooms = await Room.find({
      participants: userId,
    })
      .populate('participants', 'username avatar')
      .sort({ lastActivity: -1 });

    const roomsWithMessages = await Promise.all(
      rooms.map(async (room) => {
        const lastMessage = await Message.findOne({ roomId: room._id })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          _id: room._id,
          name: room.name,
          type: room.type,
          participants: room.participants,
          lastActivity: room.lastActivity,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderUsername: lastMessage.senderUsername,
                timestamp: lastMessage.timestamp,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      rooms: roomsWithMessages,
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

