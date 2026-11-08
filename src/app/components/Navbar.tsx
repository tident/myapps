"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [fullName, setFullName] = useState<string>("Memuat...");
  const [userInitial, setUserInitial] = useState<string>("?");

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      try {
        const user = JSON.parse(session);
        const name = user.full_name || "User";
        setFullName(name);
        
        // Ambil huruf pertama dari nama untuk avatar
        const initials = name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase();
        setUserInitial(initials || "U");
      } catch (error) {
        console.error("Gagal membaca session:", error);
        setFullName("User");
      }
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user_session", { path: "/" });
    router.push("/login");
  };

  // Penentuan Judul Halaman Dinamis (Spesifik di atas)
  const getPageTitle = (path: string): string => {
    if (path === "/dashboard") return "Overview";
    if (path === "/dashboard/accounts") return "Manajemen Akun";
    if (path === "/dashboard/profile") return "Profile Saya";
    
    // Sub-routes Rasarasa
    if (path.includes("/rasarasabyrania/invoice/create")) return "Buat Invoice Baru";
    if (path.includes("/rasarasabyrania/invoice/edit")) return "Edit Invoice";
    if (path.includes("/rasarasabyrania/invoice")) return "Daftar Invoice";
    if (path.includes("/rasarasabyrania/setting-invoice")) return "Pengaturan Invoice";
    if (path.includes("/rasarasabyrania/data-item")) return "Katalog Data Item";
    
    return "Dashboard";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md transition-all sm:px-6">
      {/* SISI KIRI: Mobile Menu & Dynamic Title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuClick}
          className="group cursor-pointer rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 md:hidden"
          aria-label="Open Sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
            className="h-6 w-6 transition-transform group-hover:scale-105"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <div className="flex items-center space-x-2">
          <span className="hidden h-5 w-1 rounded-full bg-indigo-600 md:inline-block" />
          <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* SISI KANAN: User Info & Actions */}
      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* User Profile Box */}
        <div className="flex items-center space-x-3 border-r border-slate-200/80 pr-3 sm:pr-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-xs font-bold text-white shadow-sm ring-2 ring-white">
            {userInitial}
          </div>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-semibold leading-tight text-slate-800">
              {fullName}
            </span>
            <span className="text-[11px] font-medium leading-tight text-slate-500">
              Administrator
            </span>
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="group flex cursor-pointer items-center space-x-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 sm:px-3.5 sm:text-sm"
          title="Keluar dari sesi"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.75}
            stroke="currentColor"
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}