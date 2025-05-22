import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { showCustomToast } from "@/components/customToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Heart, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  UserPlus,
  Shield,
  Smile,
  MessageSquare
} from "lucide-react";

const RegisterContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const role = "user"; // default role
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters long");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    setError("");
    
    if (!validateForm()) {
      showCustomToast("Please check your details! 🤔");
      return;
    }

    setIsLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (error) {
      console.error(error.message);
      setError(error.message);
      showCustomToast("Hmm... something went wrong while signing up 😓");
    } else {
      console.log("Signup success:", data);
      showCustomToast("Ayo! Account created. Welcome to the crew 🎉");
      router.push("/login");
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e:React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <div className="flex items-center space-x-2 text-pink-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
          <span className="text-lg font-medium">Setting up your safe space...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-40 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20"></div>
        <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20"></div>
      </div>

      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center items-center space-x-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <Heart className="h-4 w-4 text-red-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <Sparkles className="h-6 w-6 text-purple-400 animate-pulse" />
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Join BaatCheet
          </CardTitle>
          
          <CardDescription className="text-gray-600 leading-relaxed space-y-2">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-600">No real email needed!</span>
            </div>
            <p className="text-sm">
              Register anonymously to share your heart — unload your sorrows 😔,
              spread your joy 😊, or simply chat away 💬
            </p>
            <p className="text-xs text-purple-600 font-medium">
              Let us be a part of your daily life ❤️
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Mail className="h-4 w-4 text-pink-500" />
                <span>Email (any placeholder works!)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="anything@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 text-gray-700 placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-purple-500" />
                <span>Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 text-gray-700 placeholder:text-gray-400 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                <Lock className="h-4 w-4 text-indigo-500" />
                <span>Confirm Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 text-gray-700 placeholder:text-gray-400 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>Talk to us, we are listening 👂
              </div>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-600 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleSignup}
              disabled={isLoading || !email || !password || !confirmPassword}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-medium py-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating your account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>🚀 Sign Up & Start Chatting</span>
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button 
              onClick={() => router.push("/login")}
              variant="outline"
              disabled={isLoading}
              className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-medium py-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Already have an account? Login</span>
              </div>
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-pink-100">
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Shield className="h-3 w-3 text-green-500" />
                <span>Anonymous</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Heart className="h-3 w-3 text-pink-500" />
                <span>Safe</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Smile className="h-3 w-3 text-purple-500" />
                <span>Judgment-free</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium text-pink-600">Your privacy is our priority.</span>
              <br />
              Express yourself freely 🫶
            </p>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

const Register = dynamic(() => Promise.resolve(RegisterContent), {
  ssr: false,
});

export default Register;