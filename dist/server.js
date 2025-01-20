"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const next_1 = __importDefault(require("next"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "4000", 10);
const app = (0, next_1.default)({ dev, hostname, port });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, node_http_1.createServer)(handle);
    const io = new socket_io_1.Server(httpServer);
    const onlineUsers = {};
    io.on("connection", (socket) => {
        console.log(`User connected with id : ${socket.id}`);
        socket.on("register_user", (username) => {
            onlineUsers[socket.id] = username;
            io.emit("online_users", onlineUsers); // Broadcast updated user list
            console.log(`${username} registered`);
        });
        socket.on("join_room", ({ room, username }) => {
            socket.join(room);
            socket.to(room).emit("user_joined", `${username} joined the ${room}`);
        });
        socket.on("message", ({ room, message, sender }) => {
            console.log(`Message from ${sender} in room ${room} : ${message}`);
            socket.to(room).emit("message", { sender, message });
        });
        socket.on("disconnect", () => {
            console.log(`User disconnected with id : ${socket.id}`);
        });
    });
    httpServer.listen(port, () => {
        console.log(`Server is running on http://${hostname}:${port}`);
    });
});
