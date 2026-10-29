"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const session = Cookies.get("user_session");
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
    <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center justify-center border-b border-slate-200 px-6">
        <span className="text-xl font-bold text-indigo-600">Dashboard App</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <Link href="/dashboard" className={getLinkClass("/dashboard")}>
          Dashboard
        </Link>
        
        {role === "admin" && (
          <Link href="/dashboard/accounts" className={getLinkClass("/dashboard/accounts")}>
            Manajemen Akun
          </Link>
        )}
        
        <Link href="#" className={getLinkClass("/profil")}>
          Profil
        </Link>
      </nav>
    </aside>
  );
}