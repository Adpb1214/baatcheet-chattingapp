import { useState } from 'react';

import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

export function Header() {
  const session = useSession();
  const router = useRouter();
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
       
          <Link
          href={"/"}
            className="flex items-center space-x-2"
            onMouseEnter={() => setIsHoveringLogo(true)}
            onMouseLeave={() => setIsHoveringLogo(false)}
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              Baat<span className={isHoveringLogo ? 'animate-wiggle inline-block' : ''}>cheet</span>
            </h1>
            <span className={`text-2xl ${isHoveringLogo ? 'animate-bounce' : ''}`}>💬</span>
          </Link>
     
        
        <div>
          {session ? (
            <button 
              onClick={signOut}
              className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full font-medium hover:bg-pink-200 transition-colors flex items-center"
            >
              Logout
              <span className="ml-2">👋</span>
            </button>
          ) : (
     
              <Link href="/login" className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-medium hover:bg-purple-200 transition-colors flex items-center">
                Login
                <span className="ml-2">🔑</span>
              </Link>
           
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </header>
  );
}