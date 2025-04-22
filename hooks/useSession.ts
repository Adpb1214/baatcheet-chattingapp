import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

// Define specific types for user and session
interface User {
  id: string;
  email?: string;  // email is now optional to match Supabase's User type
  role?: string;  // You can add other specific fields as necessary
}

interface Session {
  user: User | null;
}

export const useSession = (): Session | null => {
  const [session, setSession] = useState<Session | null>(null);

  // On client side, check for session
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);  // Access data.session, not the whole data object
    };

    getSession();
  }, []);

  return session;
};
