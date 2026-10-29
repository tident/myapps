"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Tambahkan props untuk menerima aksi klik menu
export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("Memuat...");

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const user = JSON.parse(session);
      setFullName(user.full_name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_session");
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex items-center space-x-4">
        {/* Tombol Hamburger (Hanya muncul di mobile/tablet) */}
        <button 
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-800">Halaman Dashboard</h2>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="hidden text-sm font-medium text-slate-600 sm:block">{fullName}</span>
        <button 
          onClick={handleLogout}
          className="cursor-pointer rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 sm:px-4"
        >
          Logout
        </button>
      </div>
    </header>
  );
}