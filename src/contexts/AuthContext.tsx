import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getUserRoles } from '@/lib/auth';
import { AppRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isLoading: boolean;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  roles: [],
  isLoading: true,
  hasRole: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching to avoid blocking
        if (session?.user) {
          setTimeout(() => {
            getUserRoles(session.user.id).then(setRoles);
          }, 0);
        } else {
          setRoles([]);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        getUserRoles(session.user.id).then((userRoles) => {
          setRoles(userRoles);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, roles, isLoading, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
