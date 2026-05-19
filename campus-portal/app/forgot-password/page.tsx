"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [demoLink, setDemoLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to request password reset.');
      } else {
        const data = await response.json();
        if (data.resetLink) setDemoLink(data.resetLink);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center overflow-hidden" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md space-y-8 bg-white/10 p-10 shadow-2xl backdrop-blur-md rounded-3xl border border-white/20">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            Reset Password
          </h2>
          <p className="mt-3 text-center text-sm text-gray-200">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {success ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-indigo-500/20 p-6 border border-indigo-500/50 backdrop-blur-sm text-center">
              <svg className="mx-auto h-12 w-12 text-indigo-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-indigo-100">Check Your Inbox</h3>
              <p className="mt-2 text-sm text-indigo-200 mb-4">
                If an account exists for <b>{email}</b>, we have sent a password reset link to your email. Please check your inbox and spam folders.
              </p>
            </div>
            
            <div className="text-center mt-6 pt-4 border-t border-white/20">
              {demoLink ? (
                <Link
                  href={demoLink}
                  className="inline-block mt-2 font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  🚀 Demo: Jump to Reset Password
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="font-semibold text-indigo-300 hover:text-indigo-200 transition-colors drop-shadow"
                >
                  ← Return to Sign in
                </Link>
              )}
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-500/20 p-4 border border-red-500/50 backdrop-blur-sm">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-200">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email-address"
                  className="block text-sm font-medium text-gray-200 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative block w-full appearance-none rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:z-10 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm transition-all shadow-inner"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl border border-transparent bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>

            <div className="mt-6 border-t border-white/20 pt-6">
              <p className="text-center text-sm text-gray-300">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-300 hover:text-indigo-200 transition-colors drop-shadow"
                >
                  Return to Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
