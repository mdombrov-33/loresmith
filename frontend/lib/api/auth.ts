import { RegisterRequest, LoginRequest, AuthResponse, RegisterResponse, User } from "@/lib/schemas";
import { API_BASE_URL, fetchWithTimeout } from "./base";

export async function registerUser(
  request: RegisterRequest,
): Promise<RegisterResponse> {
  const url = `${API_BASE_URL}/register`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || `Registration failed: ${response.statusText}`,
    );
  }

  const data = await response.json();
  return data;
}

export async function loginUser(request: LoginRequest): Promise<AuthResponse> {
  const url = `${API_BASE_URL}/login`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function getCurrentUser(): Promise<{ user: User } | null> {
  const url = `${API_BASE_URL}/auth/me`;

  try {
    const response = await fetchWithTimeout(url, {
      method: "GET",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}
