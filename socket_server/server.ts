import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

//////////////////////////////////////////////////////////////////////////////////////////////////////

interface IMessage {
    idChat: number,
    tekst: string,
    posiljatelj: any,
    timestamp: string,
};

export type IUserStatus = 'online' | 'away' | 'offline';

//////////////////////////////////////////////////////////////////////////////////////////////////////

interface ClientToServerEvents {
    joinChat: (idChat: number) => void,
    message: (msg: IMessage) => void,
    away: () => void,
    active: () => void,
};

interface ServerToClientEvents {
    message: (msg: IMessage) => void,
    connectedUsers: (connectedUsers: any[]) => void,
};

interface InterServerEvents {
};

interface SocketData {
    user: any,
    status: IUserStatus,
};

const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
        origin: ['https://chatterbox-zavrad.herokuapp.com', 'http://localhost:3000', 'http://127.0.0.1:3000'],
        credentials: true,
        preflightContinue: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    }
});

app.use(cors({ origin: true }));
app.get('/', (req, res) => {
    res.send(`<h1>Running on: ${port}</h1>`);
});

// Middleware for when connecting
io.use((socket, next) => {
    const user = socket.handshake.auth;
    if (!user) {
        return next(new Error("no user data set!"));
    }
    // Save user info to socket
    socket.data.user = user;
    socket.data.status = 'online';
    next();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

io.on('connection', async (socket) => {
    console.log(`Connected: ${socket.id}`);
    //(await io.fetchSockets()).map(i => i.id);

    // Emit connected sockets for status
    const connectedUsers = Array.from(io.of('/').sockets.values()).map(sock => sock.data);
    io.emit("connectedUsers", connectedUsers); // send to everyone

    socket.on('disconnect', (reason) => {
        console.log(`User id: ${socket.id} disconnected with reason: ${reason}`);
        const connectedUsers = Array.from(io.of('/').sockets.values()).map(sock => sock.data);
        socket.broadcast.emit("connectedUsers", connectedUsers); // send to everyone except disconnecting user
    });

    socket.on('joinChat', (idChat) => { 
        socket.join(`chat${idChat}`);
    });

    socket.on('message', (msg) => {
        io.in(`chat${msg.idChat}`).emit('message', msg);
    });

    socket.on('away', () => {
        io.of('/').sockets.get(socket.id)!.data.status = 'away';
        const connectedUsers = Array.from(io.of('/').sockets.values()).map(sock => sock.data);
        io.emit("connectedUsers", connectedUsers);
    });

    socket.on('active', () => {
        io.of('/').sockets.get(socket.id)!.data.status = 'online';
        const connectedUsers = Array.from(io.of('/').sockets.values()).map(sock => sock.data);
        io.emit("connectedUsers", connectedUsers);
    });

    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

const port = process.env.PORT === undefined ? 3001 : process.env.PORT;
server.listen(port, () => {
    console.log(`Running on port ${port}`);
});