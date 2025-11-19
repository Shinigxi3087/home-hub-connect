import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/types/database";

export interface AuthUser {
  id: string;
  email: string;
  roles: AppRole[];
}

export const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) return { error };
  if (!data.user) return { error: new Error('User creation failed') };

  // Assign role after user creation
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: data.user.id, role });

  if (roleError) return { error: roleError };

  return { data, error: null };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUserRoles = async (userId: string): Promise<AppRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map(r => r.role as AppRole);
};

export const hasRole = (roles: AppRole[], checkRole: AppRole): boolean => {
  return roles.includes(checkRole);
};
