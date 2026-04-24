import axios, { type AxiosInstance } from "axios";


// const api: AxiosInstance = axios.create({
//   baseURL: "http://localhost:8000/api",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true, 
// });


const api: AxiosInstance = axios.create({
  baseURL: "https://backendsproj-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, 
});

export default api;
