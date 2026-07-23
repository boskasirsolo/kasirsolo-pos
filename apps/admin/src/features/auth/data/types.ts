export interface AdminUser {
  id: string;
  email: string;
  displayName: string | null;
  role: "superadmin" | "admin" | "support";
}

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
