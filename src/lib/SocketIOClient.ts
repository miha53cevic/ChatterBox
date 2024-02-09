import { io } from "socket.io-client";

const URL = process.env.NODE_ENV === 'production' ? 'https://chatterbox-socketio.onrender.com' : 'http://localhost:3001'

const socket = io(URL, { autoConnect: false });

// Returned object is always the same, ES6 modules return single instance from module
export default socket;