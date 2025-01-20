import React from 'react'
interface ChatMessageProps {
    sender: string;
    message: string;
    isOwnMessage: boolean;
}


function ChatMessage({sender, message, isOwnMessage}: ChatMessageProps) {
    const isSystemsMessage = sender === 'system';
  return (
    <div className={`flex ${isSystemsMessage ? "justify-center" : isOwnMessage ? 'justify-end' : 'justify-start'} items-center gap-2 mt-4`}>
    <div className={`max-w-xs px-4 py-2 rounded-lg ${isSystemsMessage ? 'bg-gray-800 text-white text-center text-xs' : isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
    {!isSystemsMessage && <p className='text-sm font-bold'>System: {sender}</p>}
    <p>{message}</p>
    </div>
    </div>
  )
}

export default ChatMessage
