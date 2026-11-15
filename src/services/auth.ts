
const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface ApiError {
  detail?: string;
  message?: string;
  email?: string[];
  password?: string[];
  non_field_errors?: string[];
}

async function getCsrfToken(): Promise<string> {
  // Django will provide this endpoint.
  await fetch(`${API_URL}/api/v1/auth/csrf/`, {
    credentials: "include",
  });

  const csrfCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrftoken="));

  return csrfCookie
    ? decodeURIComponent(csrfCookie.split("=")[1])
    : "";
}

async function postRequest<T>(
  endpoint: string,
  data: Record<string, string>
): Promise<T> {
  const csrfToken = await getCsrfToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrfToken,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = result as ApiError;

    const message =
      error.detail ||
      error.message ||
      error.email?.[0] ||
      error.password?.[0] ||
      error.non_field_errors?.[0] ||
      "Something went wrong. Please try again.";

    throw new Error(message);
  }

  return result as T;
}

export async function login(
  email: string,
  password: string
): Promise<User> {
  const result = await postRequest<{ user: User }>(
    "/api/v1/auth/login/",
    { email, password }
  );

  return result.user;
}

export async function signup(
  first_name: string,
  last_name: string,
  email: string,
  password: string,
  password_confirm: string
): Promise<void> {
  await postRequest(
    "/api/v1/auth/register/",
    {
      first_name,
      last_name,
      email,
      password,
      password_confirm,
    }
  );
}
