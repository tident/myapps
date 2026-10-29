"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Navbar() {
  const router = useRouter();
  const [fullName, setFullName] = useState("Memuat...");

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      setFullName(user.full_name);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("user_session", { path: "/" });
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-slate-800">Halaman Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-slate-600">{fullName}</span>
        <button 
          onClick={handleLogout}
          className="cursor-pointer rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </header>
  );
}