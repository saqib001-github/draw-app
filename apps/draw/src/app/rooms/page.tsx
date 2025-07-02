"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { api, Room } from "@/services/api";
import { 
  Edit3, 
  Plus, 
  Users, 
  Calendar, 
  ArrowRight, 
  Search,
  Grid3X3,
  Settings,
  LogOut
} from 'lucide-react';

export default function RoomsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    if (!user?.token) {
      router.push("/auth");
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
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingRoom(false);
    }
  };

  const joinRoom = (roomId: string) => {
    router.push(`/canvas/${roomId}`);
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Edit3 className="w-4 h-4 text-background" />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Loading your rooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-background" />
          </div>
          <span className="text-xl font-bold">DrawFlow</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <span>Welcome back,</span>
            <span className="font-medium">{user?.email || 'User'}</span>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
          <button 
            onClick={() => router.push('/auth')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Your Drawing Rooms
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Create, join, and manage your collaborative drawing spaces.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Room
            </button>
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl">
              <h2 className="text-2xl font-bold mb-6">Create New Room</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Room Name</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="Enter room name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (optional)</label>
                  <textarea
                    value={newRoomDescription}
                    onChange={(e) => setNewRoomDescription(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Describe your room..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={creatingRoom || !newRoomName.trim()}
                    className="flex-1 px-4 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {creatingRoom ? (
                      <>Creating...</>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Room
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <Grid3X3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm ? 'No rooms found' : 'No rooms yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                {searchTerm 
                  ? 'Try adjusting your search terms.' 
                  : 'Create your first room to start collaborating with your team.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Room
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room, index) => (
                <div
                  key={room.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg group animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created recently</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {room.name}
                  </h3>
                  
                  {room.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>Active</span>
                    </div>
                    <button
                      onClick={() => joinRoom(room.id)}
                      className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 group-hover:scale-105 transform transition-transform"
                    >
                      Join Room
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        {rooms.length > 0 && (
          <div className={`mt-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-2xl font-bold text-foreground">{rooms.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Rooms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{rooms.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Active Sessions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">∞</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}