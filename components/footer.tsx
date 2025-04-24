import React from 'react'

const Footer = () => {
  return (
    <div>
    <footer className="bg-white/80 backdrop-blur-sm py-6 text-center">
        <div className="container mx-auto px-4">
          <p className="text-purple-500 font-medium">
            Made with <span className="text-pink-500 animate-pulse">♥</span>in Kolkata
          </p>
          <div className="flex justify-center space-x-2 mt-2">
            <span className="text-sm text-purple-400">🌸</span>
            <span className="text-sm text-purple-400">🕊️</span>
            <span className="text-sm text-purple-400">💫</span>
          </div>
        </div>
      </footer>
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
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        .animate-float { animation: float infinite ease-in-out; }
        .animate-ping-slow { animation: ping-slow 3s infinite; }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
      `}</style>
    </div>

  )
}

export default Footer