'use client';

import { useState } from 'react';

interface User {
  _id: string;
  username: string;
  avatar: string;
}

interface OnlineUser {
  userId: string;
  username: string;
  socketId: string;
}

interface UserListProps {
  allUsers: User[];
  onlineUsers: OnlineUser[];
  currentUserId: string;
  onStartChat: (userId: string, username: string) => void;
  onCreateGroup: (userIds: string[], groupName: string) => void;
}

export default function UserList({
  allUsers,
  onlineUsers,
  currentUserId,
  onStartChat,
  onCreateGroup,
}: UserListProps) {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  const isUserOnline = (userId: string) => {
    return onlineUsers.some((u) => u.userId === userId);
  };

  const handleUserClick = (userId: string, username: string) => {
    onStartChat(userId, username);
  };

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateGroup = () => {
    if (selectedUsers.length >= 1 && groupName.trim()) {
      onCreateGroup([currentUserId, ...selectedUsers], groupName.trim());
      setShowGroupModal(false);
      setSelectedUsers([]);
      setGroupName('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setShowGroupModal(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 font-medium shadow-md"
        >
          ➕ Create Group Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center justify-between">
            <span>Users</span>
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
              {onlineUsers.length} online
            </span>
          </h3>
          <div className="space-y-1">
            {allUsers
              .filter((user) => user._id !== currentUserId)
              .map((user) => {
                const online = isUserOnline(user._id);
                return (
                  <button
                    key={user._id}
                    onClick={() => handleUserClick(user._id, user.username)}
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-11 h-11 rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                      {online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {user.username}
                      </p>
                      <p className={`text-xs ${online ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                        {online ? '● Online' : '○ Offline'}
                      </p>
                    </div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slideUp">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Group Chat</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select members and name your group</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g., Team Project, Friends"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Members ({selectedUsers.length} selected)
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-200 dark:divide-gray-700">
                  {allUsers
                    .filter((user) => user._id !== currentUserId)
                    .map((user) => (
                      <label
                        key={user._id}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleToggleUser(user._id)}
                          className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <img
                          src={user.avatar}
                          alt={user.username}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="text-gray-900 dark:text-gray-100 font-medium flex-1">
                          {user.username}
                        </span>
                        {isUserOnline(user._id) && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Online
                          </span>
                        )}
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex space-x-3">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedUsers([]);
                  setGroupName('');
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={selectedUsers.length === 0 || !groupName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-medium shadow-md"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
