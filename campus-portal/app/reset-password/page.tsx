"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset password.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 w-full max-w-md space-y-8 bg-white/10 p-10 shadow-2xl backdrop-blur-md rounded-3xl border border-white/20">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            Create New Password
          </h2>
          <p className="mt-3 text-center text-sm text-gray-200">
            Please enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl bg-emerald-500/20 p-6 border border-emerald-500/50 backdrop-blur-sm text-center">
              <svg className="mx-auto h-12 w-12 text-emerald-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-medium text-emerald-100">Password Reset!</h3>
              <p className="mt-2 text-sm text-emerald-200">
                Your password has been successfully updated. Redirecting you to login...
              </p>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-red-500/20 p-4 border border-red-500/50 backdrop-blur-sm">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-200">{error}</h3>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:z-10 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-xl border border-white/30 bg-white/5 px-4 py-3 text-white placeholder-gray-400 focus:z-10 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 sm:text-sm transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70 transition-all"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
            
            <div className="text-center mt-6 pt-4 border-t border-white/20">
              <Link href="/login" className="font-semibold text-indigo-300 hover:text-indigo-200 transition-colors drop-shadow">
                ← Return to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen bg-gray-900 justify-center items-center text-white">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
