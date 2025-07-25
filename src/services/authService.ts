
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
      console.log("Starting registration process for:", userData.email);
      
      // Set up user metadata
      const userMetadata = {
        name: userData.name,
        role: userData.role,
        matricNumber: userData.matricNumber,
        level: userData.level,
        staffId: userData.staffId,
        department: userData.department,
        qualification: userData.qualification
      };
      
      console.log("User metadata:", userMetadata);
      
      // Register and automatically sign in the user
      const signUpResult = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { 
          data: userMetadata
        }
      });

      if (signUpResult.error) {
        console.error("Registration error details:", signUpResult.error);
        return { error: signUpResult.error };
      }

      console.log("Registration successful:", signUpResult.data);
      return { data: signUpResult.data };
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
