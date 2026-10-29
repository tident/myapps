"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Cek keberadaan cookie sesi
    const session = Cookies.get("user_session");
    
    if (!session) {
      // 2. Jika tidak ada, tendang ke login menggunakan replace
      // (replace agar halaman dashboard tidak masuk ke history browser)
      router.replace("/login");
    } else {
      // 3. Jika ada, baru izinkan render
      setIsAuthorized(true);
    }
  }, [router]);

  // Jika belum terverifikasi, tampilkan layar netral (putih/loading)
  // Ini yang mencegah halaman "Selamat Datang!" muncul sepersekian detik
  if (!isAuthorized) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          {/* Indikator Loading Berputar */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
          <p className="text-slate-500">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Tampilan asli Dashboard
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang!</h1>
        <p className="text-slate-500">Ini adalah halaman dashboard utama Anda.</p>
      </div>
    </div>
  );
}