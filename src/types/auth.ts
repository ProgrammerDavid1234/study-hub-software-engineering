
import { User } from "@supabase/supabase-js";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  matricNumber?: string;
  level?: string;
  staffId?: string;
  department?: string;
  qualification?: string;
};

export type AuthContextType = {
  user: UserProfile | null;
  login: (email: string, password: string, role: "student" | "teacher") => Promise<boolean>;
  register: (userData: Omit<UserProfile, "id"> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};
