import next from "next";
import {createServer} from "node:http";
import {Server} from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({dev, hostname, port});
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handle);

    const io = new Server(httpServer);
    const onlineUsers: { [id: string]: string } = {};

    io.on("connection", (socket : any) => {
        console.log(`User connected with id : ${socket.id}`);

        socket.on("register_user", (username: string) => {
            onlineUsers[socket.id] = username;
            io.emit("online_users", onlineUsers); // Broadcast updated user list
            console.log(`${username} registered`);
          });

          socket.on("private_message", ({ recipientId, message, sender }: { recipientId: string; message: string; sender: string }) => {
            console.log(`Private message from ${sender} to ${recipientId}: ${message}`);
            if (io.sockets.sockets.get(recipientId)) {
              io.to(recipientId).emit("private_message", { sender, message });
            } else {
              socket.emit("error", { message: "Recipient not connected or does not exist." });
            }
          });
          
        socket.on("join_room", ({room, username}: {room: string, username: string}) =>{
            socket.join(room);
            socket.to(room).emit("user_joined", `${username} joined the ${room}`);
        })

        socket.on("message", ({room, message, sender}: {room: string, message: string, sender : string}) =>{
            console.log(`Message from ${sender} in room ${room} : ${message}`);
            socket.to(room).emit("message", {sender, message});
        })

        socket.on("disconnect", () => {
            console.log(`User disconnected with id : ${socket.id}`);
        });
    });
 
    httpServer.listen(port, () => {
        console.log(`Server is running on http://${hostname}:${port}`);
    });
});