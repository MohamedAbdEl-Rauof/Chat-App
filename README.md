# Chat App - Real-time Messaging

A modern, real-time chat application built with Next.js 14+, Socket.io, MongoDB, and Tailwind CSS. Features include one-to-one messaging, group chats, typing indicators, and online user presence.

## Features

- Real-time messaging via Socket.io
- One-to-one and group chats
- Online/offline user status
- Typing indicators
- Persistent message history
- Simple username-based authentication (no registration)
- Responsive UI with Tailwind CSS

---

## Tech Stack

- **Frontend & Backend**: Next.js 14+ (App Router)
- **Database**: MongoDB (Mongoose)
- **Real-time Communication**: Socket.io
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Installation

1. **Clone the repo**
```bash
cd "/home/mohamed/Projects/Chat App"
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following content:

```env
# MongoDB Connection String
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/chat-app

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# Socket.io URL (for client)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

4. **Make sure MongoDB is running**

If using local MongoDB:
```bash
# Start MongoDB service
sudo systemctl start mongod

# Or if using MongoDB installed locally
mongod
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Usage

1. **Login**: Enter any username on the landing page (no registration required)
2. **Start Chat**: 
   - Click on any online user in the right sidebar to start a one-to-one chat
   - Click "Create Group Chat" to create a group conversation
3. **Send Messages**: Type your message and press Enter or click Send
4. **View Conversations**: All your chats appear in the left sidebar with the latest message preview

## Project Structure

```
/app
  /api
    /messages           # Message API routes
    /rooms              # Room/conversation API routes
    /users              # User API routes
  /chat                 # Main chat interface page
  /layout.tsx           # Root layout
  /page.tsx             # Landing/login page
/components
  /ChatList.tsx         # Conversation list sidebar
  /ChatWindow.tsx       # Message display area
  /MessageInput.tsx     # Message input component
  /UserList.tsx         # Online users and group creation
/lib
  /db.ts                # MongoDB connection utility
  /socket.ts            # Socket.io client setup
/models
  /User.ts              # User model (Mongoose)
  /Room.ts              # Room/conversation model
  /Message.ts           # Message model
/server.js              # Custom server with Socket.io integration
```

## API Routes

### Users
- `POST /api/users/login` - Login or create user with username
- `GET /api/users?exclude={userId}` - Get all users except the specified one

### Rooms
- `GET /api/rooms?userId={userId}` - Get all rooms for a user
- `POST /api/rooms/create` - Create a new room (direct or group)

### Messages
- `GET /api/messages/[roomId]` - Get message history for a room
- `POST /api/messages` - Save a new message

## Socket.io Events

### Client to Server
- `user-login` - User authentication
- `join-room` - Join a chat room
- `leave-room` - Leave a chat room
- `send-message` - Send a message
- `typing` - User is typing
- `stop-typing` - User stopped typing
- `room-created` - Notify about new room

### Server to Client
- `online-users` - Updated list of online users
- `receive-message` - Receive a new message
- `new-room` - Notification of a new room
- `user-typing` - Another user is typing
- `user-stop-typing` - Another user stopped typing

## Features in Detail

### Real-time Messaging
Messages are instantly delivered to all participants in a room using Socket.io. Messages are also persisted to MongoDB for history.

### User Presence
The application tracks which users are online and displays their status in real-time.

### Typing Indicators
When a user is typing, other participants in the same room see a "typing..." indicator.

### Group Chats
Users can create group conversations with multiple participants. The group creator can name the group.

### Message History
All messages are stored in MongoDB and loaded when you open a conversation.

## Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running: `sudo systemctl status mongod`
- Check your `MONGODB_URI` in `.env.local`
- For MongoDB Atlas, ensure your IP is whitelisted

### Socket.io Connection Issues
- Check that the custom server is running (not the default Next.js dev server)
- Verify `NEXT_PUBLIC_SOCKET_URL` matches your server URL
- Check browser console for WebSocket errors

### Port Already in Use
If port 3000 is already in use, you can change it:
```bash
PORT=3001 npm run dev
```

## Contributing

Feel free to submit issues or pull requests to improve the application.

## License

MIT License - feel free to use this project for learning or production.
