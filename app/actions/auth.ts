import { auth } from "@/lib/auth";
import axios from "axios";
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  try {
    const { data } = await api.post(
      "/auth/login",
      {
        username,
        password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (data.success) {
      await auth.login(username, data.token);
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Terjadi kesalahan pada server",
      };
    }
    return {
      success: false,
      message: "Terjadi kesalahan pada server",
    };
  }
}
