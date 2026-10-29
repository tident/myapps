"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Memeriksa sesi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang!</h1>
        <p className="text-slate-500">Ini adalah halaman dashboard utama Anda.</p>
      </div>
    </div>
  );
}