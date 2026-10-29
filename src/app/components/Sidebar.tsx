"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Tambahkan props untuk kontrol buka/tutup
type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (session) {
      const user = JSON.parse(session);
      setRole(user.role);
    }
  }, []);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `block rounded-lg px-4 py-2 font-medium transition-colors ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  return (
    <>
      {/* Latar belakang gelap saat sidebar mobile terbuka */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Utama */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:static md:flex md:translate-x-0 ${
        isOpen ? "translate-x-0 flex" : "-translate-x-full"
      }`}>
        <div className="flex h-16 items-center justify-center border-b border-slate-200 px-6">
          <span className="text-xl font-bold text-indigo-600">Dashboard App</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link href="/dashboard" className={getLinkClass("/dashboard")} onClick={() => setIsOpen(false)}>
            Dashboard
          </Link>
          
          {role === "admin" && (
            <Link href="/dashboard/accounts" className={getLinkClass("/dashboard/accounts")} onClick={() => setIsOpen(false)}>
              Manajemen Akun
            </Link>
          )}
          
          <Link href="#" className={getLinkClass("/profil")} onClick={() => setIsOpen(false)}>
            Profil
          </Link>
        </nav>
      </aside>
    </>
  );
}