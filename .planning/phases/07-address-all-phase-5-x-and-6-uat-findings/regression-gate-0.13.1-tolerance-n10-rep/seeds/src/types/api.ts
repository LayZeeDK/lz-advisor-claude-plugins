export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta?: Record<string, unknown>;
}
