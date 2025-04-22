
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { showCustomToast } from "@/components/customToast";

const LoginContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login error:", error.message);
      setError(error.message);
      showCustomToast("Login failed. Maybe double check your email? 📧");

    } else {
      const userRole = data.user?.user_metadata?.role;
      if (userRole === "agent") {
        router.push("/agent-dashboard");
        showCustomToast("Welcome back, yaar! You're in 😎");
      } else if (userRole === "user") {
        router.push("/user-dashboard");
        showCustomToast("Welcome back, yaar! You're in 😎");
      } else {
        console.error("No role found for user");
        setError("No role assigned to this user.");
        showCustomToast("No role assigned to this user. Please contact support.");
      }
    

    }
  };

  if (!isClient) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading login page...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full space-y-6">
        <h1 className="text-3xl font-bold text-center text-pink-600">💌 BaatCheet 💬</h1>
        <p className="text-sm text-center text-gray-600">
          A safe space to talk anonymously.<br />Speak your heart — no names, no pressure 💖
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-pink-400 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-pink-400 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg transition duration-200"
          >
            Log In
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center pt-4">
          No judgments. Just feelings. Let it out 🫶
        </p>
      </div>
    </div>
  );
};

const Login = dynamic(() => Promise.resolve(LoginContent), {
  ssr: false,
});

export default Login;
