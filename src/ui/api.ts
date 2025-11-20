import { useAuth } from "./AuthContext";

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // 🔥 Chỉ set application/json nếu body KHÔNG phải FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // Thêm token nếu có
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }

    return response;
  };

  return { apiCall };
};

