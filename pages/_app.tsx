import Footer from "@/components/footer";
import { Header } from "@/components/header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (   <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">
    <Toaster position="top-right" reverseOrder={false} toastOptions={{
          duration: 1500,
        }} />
      <Component {...pageProps} />
    </main>
    <Footer />
  </div>)
}
