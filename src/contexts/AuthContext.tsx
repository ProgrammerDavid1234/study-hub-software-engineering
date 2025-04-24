
import { createContext, useContext, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useSessionManager } from "@/hooks/useSessionManager";
import { authService } from "@/services/authService";
import { AuthContextType, UserProfile } from "@/types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser } = useSessionManager();
  const { toast } = useToast();
  const isAuthenticated = !!user;

  const login = async (email: string, password: string, role: "student" | "teacher"): Promise<boolean> => {
    try {
      const { error } = await authService.login(email, password);

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: Omit<UserProfile, "id"> & { password: string }): Promise<boolean> => {
    try {
      console.log("Attempting to register user with email:", userData.email);
      
      const { error } = await authService.register(userData);
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "Registration failed",
            description: "This email is already registered. Please try logging in instead.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return false;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
      return true;
    } catch (error) {
      console.error("Registration failed with exception:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
