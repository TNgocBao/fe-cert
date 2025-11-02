import { useAuth } from './AuthContext';

export const useApi = () => {
  const { token, logout } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      logout();
      throw new Error('Session expired. Please login again.');
    }

    return response;
  };

  return { apiCall };
};