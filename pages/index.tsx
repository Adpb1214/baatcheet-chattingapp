import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
;

export default function Home() {
  const [activeBubble, setActiveBubble] = useState(0);
  const messages = [
    "Share secrets safely ✨",
    "Whisper your thoughts 🍃",
    "Connect without fear 💫",
    "Express freely, stay hidden 🎭"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBubble((prev) => (prev + 1) % messages?.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages?.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <Head>
        <title>Baatcheet - Anonymous Cute Messaging</title>
        <meta name="description" content="Share your thoughts anonymously with cute messages" />
      </Head>

      {/* Floating bubbles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              background: `hsl(${Math.random() * 60 + 300}, 70%, 70%)`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${Math.random() * 20 + 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Animated header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-purple-600 mb-4 animate-bounce">
            Baat<span className="text-pink-500">cheet</span>
          </h1>
          <p className="text-xl text-purple-500 mb-6">
            Where your words dance anonymously 💃
          </p>
          
          {/* Rotating message bubble */}
          <div className="relative h-24 mb-8">
            {messages.map((msg, i) => (
              <div 
                key={i}
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${i === activeBubble ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="bg-white px-6 py-3 rounded-full shadow-lg border-2 border-purple-200">
                  <p className="text-purple-700 font-medium">{msg}</p>
                </div>
                <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rotate-45 ${i === activeBubble ? 'opacity-100' : 'opacity-0'}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Cute illustration */}
        <div className="relative mb-12">
          <div className="w-48 h-48 bg-white rounded-full shadow-xl flex items-center justify-center">
            <div className="relative">
              {/* Face */}
              <div className="w-32 h-32 bg-yellow-100 rounded-full relative">
                {/* Eyes */}
                <div className="absolute top-8 left-6 w-6 h-6 bg-white rounded-full">
                  <div className="w-3 h-3 bg-purple-600 rounded-full absolute top-1.5 left-1.5 animate-pulse" />
                </div>
                <div className="absolute top-8 right-6 w-6 h-6 bg-white rounded-full">
                  <div className="w-3 h-3 bg-purple-600 rounded-full absolute top-1.5 right-1.5 animate-pulse" />
                </div>
                {/* Blush */}
                <div className="absolute top-12 left-4 w-4 h-2 bg-pink-200 rounded-full" />
                <div className="absolute top-12 right-4 w-4 h-2 bg-pink-200 rounded-full" />
                {/* Mouth */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-pink-300 rounded-b-full" />
              </div>
              {/* Ears */}
              <div className="absolute -top-4 -left-4 w-10 h-10 bg-yellow-100 rounded-full" />
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-yellow-100 rounded-full" />
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-pink-200 rounded-full opacity-80 animate-ping-slow" />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
        
            <Link href='/register' className="px-8 py-3 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center">
              <span className="mr-2">Get Started</span>
              <span className="text-xl">✨</span>
            </Link>
       
        
            <Link href='/login' className="px-8 py-3 bg-white text-purple-600 border-2 border-purple-300 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center">
              <span className="mr-2">Login</span>
              <span className="text-xl">🔒</span>
            </Link>
        
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-purple-400">
          <p>Share your thoughts without revealing yourself</p>
          <div className="flex justify-center space-x-4 mt-4">
            <span className="animate-bounce">🌸</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🐇</span>
            <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>💌</span>
          </div>
        </div>
      </main>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.8; }
          70%, 100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-float { animation: float infinite ease-in-out; }
        .animate-ping-slow { animation: ping-slow 3s infinite; }
        .animate-bounce { animation: bounce 1s infinite; }
      `}</style>
    </div>
  );
}