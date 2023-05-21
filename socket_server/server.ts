import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { PrismaClient, korisnik } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({
    path: process.env.NODE_ENV === 'production' ? path.resolve(__dirname, '.env') : path.resolve(__dirname, '.env.development'),
    override: true, // prisma nagadam ucita .env, a override je false kao default
});
console.log(process.env.NODE_ENV === 'production' ? 'Running prod' : 'Running dev');

//////////////////////////////////////////////////////////////////////////////////////////////////////

interface IMessage {
    idChat: number,
    tekst: string,
    posiljatelj: korisnik,
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
    user: korisnik,
    status: IUserStatus,
};

const prisma = new PrismaClient();
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
io.use(async (socket, next) => {
    const user = socket.handshake.auth;
    if (!user) {
        return next(new Error("no user data set!"));
    }
    // Save user info to socket
    socket.data.user = user as korisnik;
    socket.data.status = 'online';

    // Join socket to all it's Chats it belongs to
    const chats = await prisma.razgovor.findMany({
        where: {
            pripadarazgovoru: {
                some: {
                    idkorisnik: socket.data.user.idkorisnik,
                }
            }
        },
        select: {
            idrazgovor: true,
        }
    });
    for (const { idrazgovor } of chats) {
        socket.join(`chat${idrazgovor}`);
    }

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

    socket.on('message', async (msg) => {
        io.in(`chat${msg.idChat}`).emit('message', msg);

        // Save chat message to db
        try {
            const newMsg = await prisma.poruka.create({
                data: {
                    idrazgovor: msg.idChat,
                    idposiljatelj: msg.posiljatelj.idkorisnik,
                    tekst: msg.tekst,
                },
            });
            console.log("DB_LOG: Saving new message to db: ", newMsg);
        } catch(err) {
            console.error(err);
        }
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
        console.log("LOG:", event, args);
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

const port = process.env.PORT === undefined ? 3001 : process.env.PORT;
server.listen(port, () => {
    console.log(`Running on port ${port}`);
});