const path = require('path');
const express = require('express');
const app = require('./backend/app');
const connectDatabase = require('./backend/config/database');
const PORT = process.env.PORT || 4000;

connectDatabase();

// small health endpoint to help diagnose proxy/connectivity issues
app.get('/health', (req, res) => {
    res.status(200).json({ ok: true, env: process.env.NODE_ENV || 'development', time: new Date().toISOString() });
});

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/frontend/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
    });
} else {
    app.get('/', (req, res) => {
        res.send('Server is Running! 🚀');
    });
}

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Running on http://localhost:${PORT} (bound to 0.0.0.0)`);
});

// process-level error handlers to avoid silent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
    // exit after a short delay to allow logs to flush
    setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // optionally close server then exit
    try {
        server.close(() => process.exit(1));
    } catch (e) {
        setTimeout(() => process.exit(1), 1000);
    }
});


// ============= socket.io ==============

const io = require("socket.io")(server, {
    // pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    }
});

// make io available to controllers via app
try {
    app.set('io', io);
} catch (e) {
    console.warn('Failed to set io on app:', e && e.message ? e.message : e);
}

let users = [];

const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
        users.push({ userId, socketId });
}

const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
}

io.on("connection", (socket) => {
    console.log("🚀 Someone connected!");
    // console.log(users);

    // get userId and socketId from client
    socket.on("addUser", (userId) => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);
    });

    // get and send message
    socket.on("sendMessage", ({ senderId, receiverId, content }) => {

        const user = getUser(receiverId);

        io.to(user?.socketId).emit("getMessage", {
            senderId,
            content,
        });
    });

    // typing states
    socket.on("typing", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        console.log(user)
        io.to(user?.socketId).emit("typing", senderId);
    });

    socket.on("typing stop", ({ senderId, receiverId }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit("typing stop", senderId);
    });

    // user disconnected
    socket.on("disconnect", () => {
        console.log("⚠️ Someone disconnected")
        removeUser(socket.id);
        io.emit("getUsers", users);
        // console.log(users);
    });
});

// start birthday scheduler (optional)
try {
    const { scheduleDaily } = require('./backend/utils/birthdayScheduler');
    scheduleDaily(io);
} catch (e) {
    console.error('Failed to start birthday scheduler', e.message || e);
}