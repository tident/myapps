"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (!username || !password) {
      setErrorMessage("Username dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!url) throw new Error("URL backend tidak ditemukan.");

      // MENGGUNAKAN GET DAN QUERY PARAMS (Solusi CORS Google)
      const queryParams = new URLSearchParams({
        action: "login",
        username: username,
        password: password,
      });

      const response = await fetch(`${url}?${queryParams.toString()}`, {
        method: "GET",
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("user_session", JSON.stringify(data.user));// Login berhasil
        router.push("/dashboard"); 
      } else {
        setErrorMessage(data.message || "Login gagal.");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* KIRI */}
      <div className="flex w-full flex-col justify-center px-8 sm:px-16 md:w-1/2 lg:px-24 xl:px-32">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-2 text-3xl font-bold text-slate-800">Sign In</h1>
          <p className="mb-8 text-sm text-slate-500">Enter your username and password to sign in!</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-400 hover:text-slate-600"
                    >
                  {showPassword ? "Sembunyi" : "Lihat"}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
              <label className="ml-2 block text-sm text-slate-700">Keep me logged in</label>
            </div>

            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{errorMessage}</div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70"
            >
              {isLoading ? "Memproses..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* KANAN (Gambar) */}
      <div className="relative hidden w-1/2 bg-slate-900 md:block bg-[url('/login-bgnew.png')] bg-cover bg-center">
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white">
           <h2 className="text-3xl font-bold">Dashboard App</h2>
        </div>
      </div>
    </div>
  );
}