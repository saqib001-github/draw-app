"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api, Room } from "@/services/api";

export default function RoomsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  useEffect(() => {
    if (!user?.token) {
      router.push("/login");
      return;
    }

    fetchRooms();
  }, [user, router]);

  const fetchRooms = async () => {
    try {
      const data = await api.getRooms(user!.token);
      setRooms(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !user?.token) return;

    setCreatingRoom(true);
    try {
      const data = await api.createRoom(
        newRoomName,
        user.token,
        newRoomDescription
      );
      setRooms([...rooms, data.data]);
      setNewRoomName("");
      setNewRoomDescription("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingRoom(false);
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/canvas/${roomId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Drawing Rooms</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Room</h2>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="block mb-1">Room Name</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Description (optional)</label>
              <textarea
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <button
              type="submit"
              disabled={creatingRoom}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {creatingRoom ? "Creating..." : "Create Room"}
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your Rooms</h2>
          <div className="space-y-4">
            {rooms.length === 0 ? (
              <p>No rooms yet. Create your first room!</p>
            ) : (
              rooms.map((room) => (
                <div
                  key={room.id}
                  className="border rounded p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold">{room.name}</h3>
                  {room.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {room.description}
                    </p>
                  )}
                  <button
                    onClick={() => joinRoom(room.id)}
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    Join Room
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
