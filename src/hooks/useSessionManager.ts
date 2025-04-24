
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";

export const useSessionManager = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  const extractUserProfile = async (session: Session | null): Promise<UserProfile | null> => {
    if (!session) return null;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (!data) return null;
      
      const userMetadata = session.user.user_metadata || {};
      
      return {
        id: session.user.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || session.user.email?.split('@')[0] || 'User',
        email: session.user.email || '',
        role: (userMetadata.role as "student" | "teacher") || "student",
        matricNumber: userMetadata.matricNumber,
        level: userMetadata.level,
      };
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

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
        extractUserProfile(session)
          .then(userProfile => {
            if (userProfile) {
              setUser(userProfile);
            }
          })
          .catch(error => {
            console.error("Error extracting user profile:", error);
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, setUser };
};
