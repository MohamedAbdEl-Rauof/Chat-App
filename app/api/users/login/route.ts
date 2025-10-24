import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { username, authToken } = await request.json();
    
    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username: username.trim() });
    
    if (existingUser) {
      if (!authToken) {
        return NextResponse.json(
          { 
            error: 'This username is already taken. Please choose a different username.',
            userExists: true 
          },
          { status: 401 }
        );
      }
      
      if (existingUser.authToken !== authToken) {
        return NextResponse.json(
          { 
            error: 'Invalid authentication. This username belongs to someone else.',
            userExists: true 
          },
          { status: 401 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: {
          _id: existingUser._id,
          username: existingUser.username,
          avatar: existingUser.avatar,
          authToken: existingUser.authToken,
        },
      });
    } else {
      const newAuthToken = crypto.randomBytes(32).toString('hex');
      
      const user = await User.create({
        username: username.trim(),
        authToken: newAuthToken,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      });

      return NextResponse.json({
        success: true,
        isNewUser: true,
        user: {
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          authToken: user.authToken,
        },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
