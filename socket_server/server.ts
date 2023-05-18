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

//////////////////////////////////////////////////////////////////////////////////////////////////////

interface ClientToServerEvents {
    joinChat: (idChat: number) => void,
    message: (msg: IMessage) => void,
};

interface ServerToClientEvents {
    message: (msg: IMessage) => void,
};

interface InterServerEvents {
};

interface SocketData {
    user: any,
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
    next();
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

io.on('connection', socket => {
    console.log(`Connected: ${socket.id}`);
    //io.fetchSockets().then(i => console.log(i.map(k => k.id)));

    socket.on('disconnect', (reason) => {
        console.log(`User id: ${socket.id} disconnected with reason: ${reason}`);
    });

    socket.on('joinChat', (idChat) => { 
        socket.join(`chat${idChat}`);
    });

    socket.on('message', (msg) => {
        io.in(`chat${msg.idChat}`).emit('message', msg);
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