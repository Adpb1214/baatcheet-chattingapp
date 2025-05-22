import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Heart, 
  Shield, 
  Sparkles, 
  Star, 
  Lock, 
  Users, 
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useRouter } from 'next/router';

export default function Home() {
  const [activeBubble, setActiveBubble] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const router = useRouter();
  const messages = [
    { text: "Share secrets safely", icon: "✨", color: "from-pink-400 to-rose-400" },
    { text: "Whisper your thoughts", icon: "🌙", color: "from-purple-400 to-violet-400" },
    { text: "Connect without fear", icon: "💫", color: "from-indigo-400 to-blue-400" },
    { text: "Express freely, stay hidden", icon: "🎭", color: "from-emerald-400 to-teal-400" }
  ];

  const features = [
    {
      icon: Shield,
      title: "100% Anonymous",
      description: "Your identity stays completely private",
      color: "text-pink-500",
      bgColor: "from-pink-100 to-pink-200",
      position: "left"
    },
    {
      icon: Heart,
      title: "Safe Space",
      description: "Express yourself without judgment",
      color: "text-purple-500",
      bgColor: "from-purple-100 to-purple-200",
      position: "right"
    },
    {
      icon: Zap,
      title: "Instant Connect",
      description: "Find someone to talk to immediately",
      color: "text-indigo-500",
      bgColor: "from-indigo-100 to-indigo-200",
      position: "left"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBubble((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    const handleMouseMove = (e:MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute opacity-20 animate-float-random"
            style={{
              background: `linear-gradient(45deg, hsl(${Math.random() * 60 + 300}, 70%, 80%), hsl(${Math.random() * 60 + 200}, 70%, 85%))`,
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: Math.random() > 0.5 ? '50%' : '20%',
              animationDuration: `${Math.random() * 15 + 10}s`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
        
        {/* Gradient orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse-slow animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-slow animation-delay-4000"></div>
      </div>

      {/* Mouse follower */}
      <div 
        className="fixed pointer-events-none z-50 transition-all duration-300 ease-out"
        style={{ 
          left: mousePosition.x - 10, 
          top: mousePosition.y - 10,
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          filter: 'blur(8px)'
        }}
      />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          {/* Logo and title */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 rounded-2xl flex items-center justify-center shadow-2xl rotate-3 hover:rotate-6 transition-transform duration-300">
                <MessageCircle className="h-10 w-10 text-white" />
                <Heart className="h-6 w-6 text-white absolute -top-2 -right-2 animate-pulse" />
              </div>
              <Sparkles className="h-8 w-8 text-yellow-400 absolute -top-4 -left-4 animate-pulse" />
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
            Baat<span className="text-pink-500">Cheet</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-600 mb-8 font-light">
            Where your <span className="font-semibold text-purple-600">words dance</span> 
            <span className="inline-block ml-2 animate-bounce">💃</span>
            <br />
            <span className="text-lg text-gray-500 mt-2 block">anonymously & beautifully</span>
          </p>

          {/* Rotating message bubbles */}
          <div className="relative h-32 mb-12">
            {messages.map((msg, i) => (
              <div 
                key={i}
                className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ${
                  i === activeBubble ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <div className="relative">
                  {/* Message bubble with tail */}
                  <div className={`px-8 py-6 bg-gradient-to-r ${msg.color} rounded-3xl rounded-bl-lg shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-300 text-white relative`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg backdrop-blur-sm">
                        {msg.icon}
                      </div>
                      <p className="text-xl font-medium">{msg.text}</p>
                    </div>
                  </div>
                  {/* Message tail */}
                  <div className="absolute -bottom-2 left-6 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-pink-400"></div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div onClick={()=>{
router.push('/register');
            }} className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
            <button className="px-10 py-6 text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group flex items-center justify-center">
              <Sparkles className="mr-3 h-5 w-5 group-hover:animate-spin" />
              Start Your Journey
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button onClick={()=>{
router.push('/login');
            }} className="px-10 py-6 text-lg font-semibold border-2 border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group flex items-center justify-center bg-white">
              <Lock className="mr-3 h-5 w-5" />
              Welcome Back
              <Heart className="ml-3 h-5 w-5 text-pink-500 group-hover:animate-pulse" />
            </button>
          </div>
        </div>

        {/* Features Section - Message Bubble Style */}
        <div className="space-y-8 max-w-4xl mx-auto mb-16">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`flex ${feature.position === 'right' ? 'justify-end' : 'justify-start'} mb-8`}
            >
              <div className={`max-w-md ${feature.position === 'right' ? 'mr-4' : 'ml-4'}`}>
                {/* Message bubble container */}
                <div className="relative group">
                  {/* Main message bubble */}
                  <div className={`
                    bg-gradient-to-r ${feature.bgColor} 
                    ${feature.position === 'right' 
                      ? 'rounded-3xl rounded-br-lg' 
                      : 'rounded-3xl rounded-bl-lg'
                    } 
                    p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 
                    transform hover:scale-105 border border-white border-opacity-50 backdrop-blur-sm
                  `}>
                    <div className="flex items-start space-x-4">
                      {feature.position === 'left' && (
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
                          <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                      )}
                      
                      <div className={feature.position === 'right' ? 'text-right' : 'text-left'}>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                        <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                      </div>
                      
                      {feature.position === 'right' && (
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0">
                          <feature.icon className={`h-8 w-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Message tail */}
                  <div className={`
                    absolute -bottom-2 w-0 h-0 
                    ${feature.position === 'right' 
                      ? 'right-6 border-l-8 border-r-0 border-t-8 border-b-0 border-l-transparent border-t-pink-200' 
                      : 'left-6 border-r-8 border-l-0 border-t-8 border-b-0 border-r-transparent border-t-pink-200'
                    }
                  `}>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section - Floating Message Style */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {[
            { icon: Users, label: "Safe Conversations", value: "10K+", color: "text-pink-500", bg: "from-pink-400 to-rose-400" },
            { icon: Star, label: "Happy Users", value: "99%", color: "text-purple-500", bg: "from-purple-400 to-violet-400" },
            { icon: Shield, label: "Privacy Protected", value: "100%", color: "text-indigo-500", bg: "from-indigo-400 to-blue-400" }
          ].map((stat, index) => (
            <div key={index} className="relative group">
              {/* Floating message bubble */}
              <div className={`
                bg-gradient-to-r ${stat.bg} text-white p-6 rounded-2xl rounded-bl-lg 
                shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110
                min-w-40 text-center
              `}>
                <div className="flex items-center justify-center mb-3">
                  <stat.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
              {/* Message tail */}
              <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-pink-400"></div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 max-w-2xl mx-auto">
          <p className="text-lg mb-6 leading-relaxed">
            Create meaningful connections in a space designed for 
            <span className="font-medium text-purple-600"> authentic expression</span> and 
            <span className="font-medium text-pink-600"> genuine understanding</span>
          </p>
          
          <div className="flex justify-center space-x-6">
            {['🌸', '🦋', '💫', '🌙', '✨'].map((emoji, i) => (
              <span 
                key={i}
                className="text-2xl animate-bounce cursor-pointer hover:scale-125 transition-transform duration-300" 
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Enhanced CSS animations */}
      <style jsx global>{`
        @keyframes float-random {
          0% { transform: translateY(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-20px) rotate(90deg) scale(1.1); }
          50% { transform: translateY(-10px) rotate(180deg) scale(0.9); }
          75% { transform: translateY(-30px) rotate(270deg) scale(1.05); }
          100% { transform: translateY(0) rotate(360deg) scale(1); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-float-random { 
          animation: float-random infinite ease-in-out; 
        }
        
        .animate-pulse-slow { 
          animation: pulse-slow 6s infinite; 
        }
        
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
}