import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { api } from "../services/api";
import { useStore } from "../store";

export const Rooms = () => {
  const navigate = useNavigate();
  const { user, rooms, addRoom, setCurrentRoom, joinRoom } = useStore();
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.token) return;

    setError("");
    setIsLoading(true);

    try {
      const data = await api.createRoom(roomName, user.token);
      const newRoom = {
        id: data.data.id,
        name: data.data.name,
        messages: [],
      };
      addRoom(newRoom);
      setCurrentRoom(newRoom);
      joinRoom(data.data.id);
      navigate(`/rooms/${data.data.id}`);
    } catch (err) {
      setError("Failed to create room");
      console.error("Create room error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const newRoom = {
        id: roomId,
        name: `Room ${roomId}`,
        messages: [],
      };
      addRoom(newRoom);
      setCurrentRoom(newRoom);
      joinRoom(roomId);
      navigate(`/rooms/${roomId}`);
    } catch (err) {
      setError("Failed to join room");
      console.error("Join room error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Rooms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Create Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <Input
                label="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create Room
              </Button>
            </form>
          </div>

          {/* Join Room */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Join Room</h3>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <Input
                label="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Join Room
              </Button>
            </form>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Room List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Your Rooms</h3>
          {rooms.length === 0 ? (
            <p className="text-gray-500 text-center">No rooms yet</p>
          ) : (
            <div className="grid gap-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{room.name}</h4>
                    <p className="text-sm text-gray-500">ID: {room.id}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setCurrentRoom(room);
                      navigate(`/rooms/${room.id}`);
                    }}
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
