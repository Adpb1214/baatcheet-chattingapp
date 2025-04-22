import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface User {
  id: string;
  email?: string;
  role?: string;
}

interface Session {
  user: User | null;
}

export const useSession = (): Session | null => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Initial session fetch
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };

    fetchSession();

    // Listen for login/logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return session;
};
