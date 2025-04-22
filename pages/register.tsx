import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabase";

const RegisterContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState("");
  const role = "user"; // default role
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignup = async () => {
    setError("");
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
    } else {
      console.log("Signup success:", data);
      router.push("/login");
    }
  };

  if (!isClient) {
    return (
      <div className="p-6 text-center text-gray-600">Loading registration page...</div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 max-w-md w-full space-y-6">
        <div className="flex items-center justify-center gap-2">
          <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8 text-pink-500" />
          <h1 className="text-3xl font-bold text-pink-600">BaatCheet</h1>
        </div>

        <p className="text-sm text-center text-gray-600">
          🫶 No real email needed! <br />
          Register anonymously to share your heart — unload your sorrows 😔,
          spread your joy 😊, or simply chat away 💬. <br />
          Let us be a part of your daily life. ❤️
        </p>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email (any placeholder)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            onClick={handleSignup}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            🚀 Sign Up & Start Chatting
          </button>

          <button
            onClick={() => router.push("/login")}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-2 rounded-lg font-semibold transition duration-200"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

const Register = dynamic(() => Promise.resolve(RegisterContent), {
  ssr: false,
});

export default Register;
