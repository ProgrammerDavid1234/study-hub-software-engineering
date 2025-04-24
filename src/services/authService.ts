
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const authService = {
  login: async (email: string, password: string): Promise<{ error?: Error; data?: any }> => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      return { data };
    } catch (error) {
      console.error("Login failed:", error);
      return { error: error as Error };
    }
  },
  
  register: async (userData: Omit<UserProfile, "id"> & { password: string }): Promise<{ error?: Error; data?: any }> => {
    try {
      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing user:", checkError);
      } else if (existingUsers) {
        return { error: new Error("This email is already registered") };
      }
      
      // Set up user metadata
      const userMetadata = {
        name: userData.name,
        role: userData.role,
        matricNumber: userData.matricNumber,
        level: userData.level
      };
      
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: userMetadata }
      });

      if (error) {
        console.error("Registration error details:", error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error("Registration failed with exception:", error);
      return { error: error as Error };
    }
  },
  
  logout: async (): Promise<{ error?: Error }> => {
    try {
      await supabase.auth.signOut();
      return {};
    } catch (error) {
      console.error("Logout failed:", error);
      return { error: error as Error };
    }
  }
};
