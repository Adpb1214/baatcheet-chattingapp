import toast from "react-hot-toast";
import React from "react";

export const showCustomToast = (message: string): void => {
  toast.custom((t) => (
    <div
      className={`flex items-center space-x-3 bg-pink-50 text-pink-700 border border-pink-300 rounded-xl px-4 py-3 shadow-lg min-w-[250px] transition-all duration-300 ${
        t.visible ? "animate-slide-in" : "animate-fade-out"
      }`}
    >
      {/* Chat Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-pink-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.978 9.978 0 01-4.9-1.3L3 20l1.3-3.9A9.978 9.978 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>

      <span className="font-semibold flex-1">{message}</span>

      {/* Heart Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 text-pink-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
      </svg>
    </div>
  ));
};
