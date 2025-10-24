'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSocket } from '@/lib/socket';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import MessageInput from '@/components/MessageInput';
import UserList from '@/components/UserList';

interface User {
  _id: string;
  username: string;
  avatar: string;
}

interface Participant {
  _id: string;
  username: string;
  avatar: string;
}

interface Room {
  _id: string;
  name: string;
  type: 'direct' | 'group';
  participants: Participant[];
  lastActivity: string;
  lastMessage: {
    content: string;
    senderUsername: string;
    timestamp: string;
  } | null;
}

interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
}

interface OnlineUser {
  userId: string;
  username: string;
  socketId: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Array<{ username: string; roomId: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      router.push('/');
      return;
    }

    const user = JSON.parse(userStr);
    setCurrentUser(user);

    const socket = getSocket();
    socket.connect();

    socket.emit('user-login', {
      userId: user._id,
      username: user.username,
    });

    socket.on('online-users', (users: OnlineUser[]) => {
      setOnlineUsers(users);
    });

    socket.on('receive-message', (messageData: Message) => {
      console.log('Received message from another user:', messageData);
      
      setMessages((prev) => {
        const existsById = prev.some(m => m._id === messageData._id);
        if (existsById) {
          console.log('Message already exists by ID, skipping');
          return prev;
        }
        
        const existsByContent = prev.some(m => 
          m.content === messageData.content &&
          m.senderId === messageData.senderId &&
          Math.abs(new Date(m.timestamp).getTime() - new Date(messageData.timestamp).getTime()) < 2000
        );
        
        if (existsByContent) {
          console.log('Duplicate message by content, skipping');
          return prev;
        }
        
        return [...prev, messageData];
      });

      fetchRooms(user._id);
    });

    socket.on('new-room', (roomData: Room) => {
      fetchRooms(user._id);
    });

    socket.on('user-typing', (data: { userId: string; username: string; roomId: string }) => {
      console.log('User typing:', data);
      setTypingUsers((prev) => {
        const alreadyTyping = prev.some(t => t.username === data.username && t.roomId === data.roomId);
        if (data.userId !== user._id && !alreadyTyping) {
          return [...prev, { username: data.username, roomId: data.roomId }];
        }
        return prev;
      });
    });

    socket.on('user-stop-typing', (data: { userId: string; username: string; roomId: string }) => {
      setTypingUsers((prev) => prev.filter((u) => u.username !== data.username || u.roomId !== data.roomId));
    });

    fetchRooms(user._id);
    fetchAllUsers(user._id);

    return () => {
      socket.off('online-users');
      socket.off('receive-message');
      socket.off('new-room');
      socket.off('user-typing');
      socket.off('user-stop-typing');
    };
  }, []);

  useEffect(() => {
    if (selectedRoomId && currentUser) {
      fetchMessages(selectedRoomId);

      const socket = getSocket();
      socket.emit('join-room', selectedRoomId);

      return () => {
        socket.emit('leave-room', selectedRoomId);
      };
    }
  }, [selectedRoomId, currentUser]);

  const fetchRooms = async (userId: string) => {
    try {
      const response = await fetch(`/api/rooms?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/messages/${roomId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(prev => {
          const otherRoomMessages = prev.filter(m => m.roomId !== roomId);
          return [...otherRoomMessages, ...data.messages];
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAllUsers = async (excludeUserId: string) => {
    try {
      const response = await fetch(`/api/users?exclude=${excludeUserId}`);
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedRoomId || !currentUser) return;

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const tempMessage: Message = {
      _id: tempId,
      roomId: selectedRoomId,
      senderId: currentUser._id,
      senderUsername: currentUser.username,
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempMessage),
      });

      const data = await response.json();
      if (data.success && data.message._id) {
        const savedMessage: Message = {
          ...tempMessage,
          _id: data.message._id,
        };

        setMessages((prev) =>
          prev.map((m) =>
            m._id === tempId ? savedMessage : m
          )
        );

        const socket = getSocket();
        socket.emit('send-message', savedMessage);

        fetchRooms(currentUser._id);
      }
    } catch (error) {
      console.error('Error saving message:', error);

      const socket = getSocket();
      socket.emit('send-message', tempMessage);
    }
  };

  const handleTyping = () => {
    if (!selectedRoomId) return;
    const socket = getSocket();
    socket.emit('typing', { roomId: selectedRoomId });
  };

  const handleStopTyping = () => {
    if (!selectedRoomId) return;
    const socket = getSocket();
    socket.emit('stop-typing', { roomId: selectedRoomId });
  };

  const handleStartChat = async (userId: string, username: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${currentUser.username} & ${username}`,
          type: 'direct',
          participants: [currentUser._id, userId],
        }),
      });

      const data = await response.json();
      if (data.success) {

        await fetchRooms(currentUser._id);
        
        setSelectedRoomId(data.room._id);
        
        if (!data.existed) {
          const socket = getSocket();
          socket.emit('room-created', {
            ...data.room,
            participants: data.room.participants.map((p: Participant) => p._id)
          });
        }
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleCreateGroup = async (userIds: string[], groupName: string) => {
    if (!currentUser) return;

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          type: 'group',
          participants: userIds,
        }),
      });

      const data = await response.json();
      if (data.success) {

        await fetchRooms(currentUser._id);
        
        setSelectedRoomId(data.room._id);
        
        const socket = getSocket();
        socket.emit('room-created', {
          ...data.room,
          participants: data.room.participants.map((p: Participant) => p._id)
        });
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleLogout = () => {
    const socket = getSocket();
    socket.disconnect();
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  if (loading || !currentUser) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const selectedRoom = rooms.find(r => r._id === selectedRoomId);
  const getRoomDisplayName = (room: Room) => {
    if (room.type === 'group') {
      return room.name;
    }
    const otherUser = room.participants.find((p) => p._id !== currentUser._id);
    return otherUser?.username || 'Unknown User';
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between  mx-auto">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">💬</div>
            <div>
              <h1 className="text-2xl font-bold">Chat App</h1>
              <p className="text-sm text-blue-100">Real-time messaging</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.username}
                className="w-9 h-9 rounded-full ring-2 ring-white/50"
              />
              <div>
                <span className="font-medium block">{currentUser.username}</span>
                <span className="text-xs text-blue-100">● Online</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chat List */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100">Conversations</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{rooms.length} chat{rooms.length !== 1 ? 's' : ''}</p>
          </div>
          <ChatList
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            currentUserId={currentUser._id}
          />
        </div>

        {/* Center - Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {selectedRoomId && selectedRoom ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">
                    {selectedRoom.type === 'group' ? '👥' : '👤'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100">
                      {getRoomDisplayName(selectedRoom)}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedRoom.type === 'group' 
                        ? `${selectedRoom.participants.length} members`
                        : 'Direct message'
                      }
                    </p>
                  </div>
                </div>
              </div>
              <ChatWindow
                messages={messages.filter(m => m.roomId === selectedRoomId)}
                currentUserId={currentUser._id}
                typingUsers={typingUsers
                  .filter(t => t.roomId === selectedRoomId)
                  .map(t => t.username)
                }
              />
              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onStopTyping={handleStopTyping}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome to Chat App
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation or start a new chat to begin messaging
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - User List */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700">
          <UserList
            allUsers={allUsers}
            onlineUsers={onlineUsers}
            currentUserId={currentUser._id}
            onStartChat={handleStartChat}
            onCreateGroup={handleCreateGroup}
          />
        </div>
      </div>
    </div>
  );
}

