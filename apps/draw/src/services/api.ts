const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3011/api/users";

export interface Room {
  id: string;
  name: string;
  description?: string;
  slug: string;
  createdAt: string;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }
    return response.json();
  },

  signup: async (email: string, password: string, name: string) => {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }
    return response.json();
  },

  // Rooms
  getRooms: async (token: string) => {
    const response = await fetch(`${API_URL}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch rooms");
    }
    return response.json();
  },

  createRoom: async (name: string, token: string, description?: string) => {
    const response = await fetch(`${API_URL}/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create room");
    }
    return response.json();
  },

  // Get room's existing strokes
  getRoomStrokes: async (roomId: string, token: string) => {
    const response = await fetch(`${API_URL}/shapes/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch room strokes");
    }
    return response.json();
  },
};
