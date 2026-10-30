"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
        Cookies.set("user_session", JSON.stringify(data.user), { expires: 1, path: "/" });
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
      {/* SISI KIRI: FORM LOGIN */}
      <div className="flex w-full flex-col justify-between px-8 py-8 sm:px-16 md:w-1/2 lg:px-24 xl:px-32">
        {/* Bagian Utama (Logo + Form) */}
        <div className="my-auto w-full max-w-md mx-auto py-6">
          {/* 1. LOGO */}
              <div className="mb-6">
                <Image
                  src="/fixcombine.png"
                  alt="Logo"
                  width={300}
                  height={100}
                  priority
                  className="h-20 w-auto object-contain object-left"
                />
              </div>

          <h1 className="mb-2 text-3xl font-bold text-slate-800">Sign In</h1>
          <p className="mb-8 text-sm text-slate-500">
            Enter your username and password to sign in!
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Input Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 pr-12 text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-700"
              >
                Keep me logged in
              </label>
            </div>

            {/* Pesan Error */}
            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            {/* Tombol Sign In */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? "Memproses..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* 2. FOOTER COPYRIGHT */}
        <div className="text-center text-xs text-slate-500 font-medium pt-4">
          2026 @PIW STUDIO
        </div>
      </div>

      {/* SISI KANAN: GAMBAR */}
      <div className="relative hidden w-1/2 overflow-hidden bg-white md:block">
        <Image
          src="/piwstudio.png"
          alt="Login Background"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}