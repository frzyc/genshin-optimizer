import axios from "axios";
import { UserData } from "../Database/UserData";

export const BACKEND_URL = process.env.NODE_ENV === "development" ? "http://localhost:8080" : process.env.BACKEND_URL
export function register(username: string, email: string, password: string) {
  return axios.post(`${BACKEND_URL}/api/auth/signup`, {
    username,
    email,
    password
  })
}
export function verifyToken(token: string) {
  return axios.post(`${BACKEND_URL}/api/auth/signverify`, {
    headers: {
      'x-access-token': token
    }
  })
}

export async function login(username, password) {
  return axios.post(`${BACKEND_URL}/api/auth/signin`, { username, password });
}

export async function logout() {
  (new UserData()).set({ accessToken: "" });
}
