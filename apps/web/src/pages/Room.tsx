import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useStore } from "../store";

export const Room = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    user,
    currentRoom,
    joinRoom,
    sendMessage: sendMessageToRoom,
  } = useStore();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!currentRoom && roomId) {
      joinRoom(roomId);
    }
  }, [user, currentRoom, roomId, joinRoom, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentRoom?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !roomId) return;

    sendMessageToRoom(roomId, message);
    setMessage("");
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Room Header */}
        <div className="bg-white shadow rounded-lg p-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{currentRoom.name}</h1>
            <p className="text-sm text-gray-500">Room ID: {currentRoom.id}</p>
          </div>
          <Button variant="secondary" onClick={() => navigate("/rooms")}>
            Back to Rooms
          </Button>
        </div>

        {/* Messages */}
        <div className="bg-white shadow rounded-lg p-4 mb-4">
          <div className="h-[60vh] overflow-y-auto space-y-4 mb-4">
            {currentRoom.messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages yet</p>
            ) : (
              currentRoom.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === user?.id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-lg p-3 ${
                      msg.sender === user?.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.sender === user?.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              className="flex-grow"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
