const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user-login', (userData) => {
      socket.userId = userData.userId;
      socket.username = userData.username;
      onlineUsers.set(userData.userId, {
        socketId: socket.id,
        username: userData.username,
        userId: userData.userId,
      });
      
      io.emit('online-users', Array.from(onlineUsers.values()));
      console.log(`User ${userData.username} logged in`);
    });

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('send-message', (messageData) => {
      socket.to(messageData.roomId).emit('receive-message', messageData);
      console.log(`Message sent to room ${messageData.roomId}:`, messageData.content);
    });

    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        roomId: data.roomId,
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(data.roomId).emit('user-stop-typing', {
        userId: socket.userId,
        username: socket.username,
        roomId: data.roomId,
      });
    });

    socket.on('room-created', (roomData) => {
      roomData.participants.forEach((participantId) => {
        const user = onlineUsers.get(participantId);
        if (user) {
          io.to(user.socketId).emit('new-room', roomData);
        }
      });
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online-users', Array.from(onlineUsers.values()));
        console.log(`User ${socket.username} disconnected`);
      }
      console.log('User disconnected:', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

