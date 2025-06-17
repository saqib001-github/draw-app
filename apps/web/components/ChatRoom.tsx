import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { roomApi } from '../lib/api';
import { useAuthStore } from '../store/auth';

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

interface ChatRoomProps {
  roomId: string;
  slug: string;
}

export function ChatRoom({ roomId, slug }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    // Load existing messages
    const loadMessages = async () => {
      try {
        const response = await roomApi.getChats(roomId);
        setMessages(response.data.data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };
    loadMessages();

    // Connect to WebSocket
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:4000', {
      query: { token },
    });

    newSocket.emit('join', { roomId });

    newSocket.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave', { roomId });
      newSocket.disconnect();
    };
  }, [roomId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim() || !user) return;

    const message = {
      type: 'chat',
      content: newMessage,
      roomId,
      userId: user.id,
      userName: user.name,
    };

    socket.emit('message', message);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-sm rounded-lg px-4 py-2 ${
                message.userId === user?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              <div className="font-bold text-sm">
                {message.userId === user?.id ? 'You' : message.userName}
              </div>
              <div>{message.content}</div>
              <div className="text-xs opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
