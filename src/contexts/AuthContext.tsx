import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Session, User } from "@supabase/supabase-js";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher";
  matricNumber?: string;
  level?: string;
};

type AuthContextType = {
  user: UserProfile | null;
  login: (email: string, password: string, role: "student" | "teacher") => Promise<boolean>;
  register: (userData: Omit<UserProfile, "id"> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const isAuthenticated = !!user;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session) {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', session.user.id)
              .single();
            
            if (data) {
              const userMetadata = session.user.user_metadata || {};
              
              setUser({
                id: session.user.id,
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: (userMetadata.role as "student" | "teacher") || "student",
                matricNumber: userMetadata.matricNumber,
                level: userMetadata.level,
              });
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          setUser(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session) {
        (async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('first_name, last_name, avatar_url')
              .eq('id', session.user.id)
              .single();
            
            if (data) {
              const userMetadata = session.user.user_metadata || {};
              
              setUser({
                id: session.user.id,
                name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || session.user.email?.split('@')[0] || 'User',
                email: session.user.email || '',
                role: (userMetadata.role as "student" | "teacher") || "student",
                matricNumber: userMetadata.matricNumber,
                level: userMetadata.level,
              });
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        })();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role: "student" | "teacher"): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

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
      
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle();
      
      if (checkError) {
        console.error("Error checking existing user:", checkError);
      } else if (existingUsers) {
        toast({
          title: "Registration failed",
          description: "This email is already registered",
          variant: "destructive",
        });
        return false;
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            matricNumber: userData.matricNumber,
            level: userData.level
          }
        }
      });

      if (error) {
        console.error("Registration error details:", error);
        
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
      await supabase.auth.signOut();
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
