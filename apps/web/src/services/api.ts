import axios from "axios";

const API_URL = "http://localhost:3011/api"; // Replace with your backend URL

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password,
    });
    return response.data;
  },

  signup: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/users/signup`, {
      email,
      password,
    });
    return response.data;
  },

  // Rooms
  createRoom: async (name: string, token: string) => {
    const response = await axios.post(
      `${API_URL}/users/room`,
      { name },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  // joinRoom: async (roomId: string, token: string) => {
  //   const response = await axios.post(
  //     `${API_URL}/rooms/${roomId}/join`,
  //     {},
  //     {
  //       headers: { Authorization: `Bearer ${token}` },
  //     }
  //   );
  //   return response.data;
  // },
};
