// import axios from 'axios';

// // Base URL: use env variable if provided, otherwise default to localhost:5000
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// export const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // --- API helper functions ---

// export async function createBooking(payload) {
//   const res = await apiClient.post('/api/bookings', payload);
//   return res.data;
// }

// export async function getAllBookings() {
//   const res = await apiClient.get('/api/bookings');
//   return res.data;
// }

// export async function getWeather(dateISO, location) {
//   const res = await apiClient.get('/api/weather', {
//     params: { date: dateISO, location }
//   });
//   return res.data;
// }










import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
});

export const createBooking = async (payload) => {
  const res = await API.post("/api/bookings", payload);
  return res.data;
};

export const getAllBookings = async () => {
  const res = await API.get("/api/bookings");
  return res.data;
};

export const getWeather = async (dateISO, location) => {
  const res = await API.get("/api/weather", {
    params: { date: dateISO, location },
  });
  return res.data;
};

export default API;
