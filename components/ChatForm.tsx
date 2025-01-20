"use client";
import React, { useState } from "react";

function ChatForm({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg"
          placeholder="Type your message here ..."
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-500 text-white"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatForm;
