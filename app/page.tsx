"use client";
import React, { useState, useEffect } from "react";
import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { socket } from "@/lib/SocketClient";

interface Room {
  name: string;
  id: string;
}

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<{ sender: string; message: string }[]>([]);
  const [username, setUsername] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [userId, setUserId] = useState("");
  const [joined, setJoined] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [isPrivateChat, setIsPrivateChat] = useState(false);

  const handleRegister = () => {
    if (username.trim()) {
      socket.emit("register_user", username);
      setUserId(socket?.id || "");
      setJoined(true);
    }
  };

  const handleJoinRoom = (room: Room) => {
    if (room && username.trim()) {
      setIsPrivateChat(false);
      socket.emit("join_room", { room: room.id, username });
      setCurrentRoom(room);
      setMessages([]);
    }
  };

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      const newRoom: Room = { name: newRoomName, id: newRoomName.toLowerCase().replace(/\s+/g, "_") };
      setRooms((prev) => [...prev, newRoom]);
      handleJoinRoom(newRoom);
      setNewRoomName("");
    }
  };

  const handleSendMessage = (message: string) => {
    if (isPrivateChat) {
      
      if (!recipientId.trim() || !message.trim()) return;
      const data = { recipientId, message, sender: username };
      setMessages((prev) => [...prev, { sender: username, message }]);
      socket.emit("private_message", data);
    } else {
      
      if (!currentRoom || !message.trim()) return;
      const data = { room: currentRoom.id, message, sender: username };
      setMessages((prev) => [...prev, { sender: username, message }]);
      socket.emit("message", data);
    }
  };

  useEffect(() => {
    
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("private_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user_joined", (message) => {
      setMessages((prev) => [...prev, { sender: "system", message }]);
    });

    return () => {
      socket.off("message");
      socket.off("private_message");
      socket.off("user_joined");
    };
  }, []);

  return (
    <div className="flex w-full h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 border-r p-4">
        <h2 className="text-xl font-bold mb-4">Chat App</h2>
        {!joined ? (
          <div>
            <input
              className="px-4 py-2 border rounded-lg w-full mb-4"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button
              onClick={handleRegister}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
            >
              Register
            </button>
          </div>
        ) : (
          <div>
            {/* Private Chat */}
            <h3 className="font-bold mb-2">Your Private Converstaion Id : {userId}</h3>
            <div className="mb-4">
              <h3 className="font-bold mb-2">Private Chat</h3>
              <input
                type="text"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="px-4 py-2 border rounded-lg w-full mb-2"
                placeholder="Enter recipient ID"
              />
              <button
                onClick={() => {
                  setIsPrivateChat(true);
                  setMessages([]);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
              >
                Start Private Chat
              </button>
            </div>

            {/* Group Chat */}
            <div className="mb-4">
              <h3 className="font-bold mb-2">Create a Group</h3>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="px-4 py-2 border rounded-lg w-full mb-2"
                placeholder="Enter group name"
              />
              <button
                onClick={handleCreateRoom}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg w-full"
              >
                Create Room
              </button>
            </div>

            {/* Existing Rooms */}
            <h3 className="font-bold mb-2">Rooms</h3>
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleJoinRoom(room)}
                className={`p-3 cursor-pointer rounded-lg ${
                  currentRoom?.id === room.id ? "bg-blue-500 text-white" : "hover:bg-gray-200"
                }`}
              >
                {room.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="w-2/3 flex flex-col">
        {joined ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto bg-gray-300 p-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  sender={message.sender}
                  message={message.message}
                  isOwnMessage={message.sender === username}
                />
              ))}
            </div>
            <div className="p-4 border-t">
              <ChatForm onSendMessage={handleSendMessage} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <h2>Register to start chatting</h2>
          </div>
        )}
      </div>
    </div>
  );
}
