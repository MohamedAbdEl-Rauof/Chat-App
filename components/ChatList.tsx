'use client';

import { useState, useEffect } from 'react';

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

interface ChatListProps {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  currentUserId: string;
}

export default function ChatList({
  rooms,
  selectedRoomId,
  onSelectRoom,
  currentUserId,
}: ChatListProps) {
  const getRoomDisplayName = (room: Room) => {
    if (room.type === 'group') {
      return room.name;
    }
    const otherUser = room.participants.find((p) => p._id !== currentUserId);
    return otherUser?.username || 'Unknown User';
  };

  const getRoomAvatar = (room: Room) => {
    if (room.type === 'group') {
      return '👥';
    }
    const otherUser = room.participants.find((p) => p._id !== currentUserId);
    return otherUser?.avatar;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-900">
      {rooms.length === 0 ? (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No conversations yet. Start a new chat!
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => onSelectRoom(room._id)}
              className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedRoomId === room._id 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                  : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {typeof getRoomAvatar(room) === 'string' &&
                  getRoomAvatar(room)?.startsWith('http') ? (
                    <img
                      src={getRoomAvatar(room)}
                      alt={getRoomDisplayName(room)}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                      {getRoomAvatar(room)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {getRoomDisplayName(room)}
                    </h3>
                    {room.lastMessage && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTimestamp(room.lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  {room.lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                      <span className="font-medium">
                        {room.lastMessage.senderUsername}:
                      </span>{' '}
                      {room.lastMessage.content}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
