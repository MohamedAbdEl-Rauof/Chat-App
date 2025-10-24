'use client';

import { useEffect, useRef } from 'react';

interface Message {
  _id: string;
  roomId: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  typingUsers: string[];
}

export default function ChatWindow({
  messages,
  currentUserId,
  typingUsers,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No messages yet. Start the conversation!
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUserId;
            const showUsername = !isOwnMessage && (
              index === 0 || 
              messages[index - 1].senderId !== message.senderId
            );
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
                    isOwnMessage ? 'order-2' : 'order-1'
                  }`}
                >
                  {showUsername && (
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 ml-1">
                      {message.senderUsername}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isOwnMessage
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {typingUsers.length > 0 && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 text-gray-600 dark:text-gray-400 text-sm shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
