"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [isRasarasaOpen, setIsRasarasaOpen] = useState(false);

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      setRole(user.role);
    }
  }, []);

  useEffect(() => {
    if (pathname.includes("/dashboard/rasarasabyrania")) {
      setIsRasarasaOpen(true);
    }
  }, [pathname]);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center rounded-lg px-3 py-2.5 font-medium transition-colors cursor-pointer ${
      isCollapsed ? "justify-center" : "space-x-3"
    } ${
      isActive
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 transform flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out md:static md:flex md:translate-x-0 ${
        isOpen ? "translate-x-0 flex" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-64"}`}>
        
        {/* Header Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link 
            href="/dashboard" 
            onClick={() => setIsOpen(false)}
            className={`flex items-center cursor-pointer ${isCollapsed ? "justify-center w-full" : "space-x-3"}`}
          >
            {isCollapsed ? (
               <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-sm">P</div>
            ) : (
              <>
                <Image 
                  src="/fixlogonew.png" 
                  alt="Logo" 
                  width={45} 
                  height={35} 
                  className="rounded-md object-contain"
                />
                <span className="text-xl font-bold text-indigo-600 whitespace-nowrap">Piw Project</span>
              </>
            )}
          </Link>

          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          
          <Link href="/dashboard" className={getLinkClass("/dashboard")} onClick={() => setIsOpen(false)} title="Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            {!isCollapsed && <span className="whitespace-nowrap">Dashboard</span>}
          </Link>

          <Link href="/dashboard/data-dashboard" className={getLinkClass("/dashboard/data-dashboard")} onClick={() => setIsOpen(false)} title="Dashboard Data">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            {!isCollapsed && <span className="whitespace-nowrap">Dashboard Data</span>}
          </Link>

          <Link href="/dashboard/data-center" className={getLinkClass("/dashboard/data-center")} onClick={() => setIsOpen(false)} title="Data Center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            {!isCollapsed && <span className="whitespace-nowrap">Data Center</span>}
          </Link>

          {role === "admin" && (
            <Link href="/dashboard/accounts" className={getLinkClass("/dashboard/accounts")} onClick={() => setIsOpen(false)} title="Manajemen Akun">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              {!isCollapsed && <span className="whitespace-nowrap">Manajemen Akun</span>}
            </Link>
          )}

          {/* === MENU RASARASABYRANIA (Dropdown) === */}
          <div>
            {isCollapsed ? (
              // JIKA COLLAPSE, JADIKAN LINK LANGSUNG
              <Link href="/dashboard/rasarasabyrania/invoice" className={getLinkClass("/dashboard/rasarasabyrania/invoice")} onClick={() => setIsOpen(false)} title="Rasarasabyrania">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
              </Link>
            ) : (
              // JIKA TIDAK COLLAPSE, JADIKAN TOMBOL DROPDOWN
              <button 
                onClick={() => setIsRasarasaOpen(!isRasarasaOpen)}
                className={`flex w-full items-center rounded-lg px-3 py-2.5 font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer justify-between`}
                title="Rasarasabyrania"
              >
                <div className="flex items-center space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                  <span className="whitespace-nowrap">Rasarasabyrania</span>
                </div>
                
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-4 w-4 transition-transform ${isRasarasaOpen ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            )}
            {/* Submenu Rasarasabyrania */}
            {isRasarasaOpen && !isCollapsed && (
              <div className="ml-10 mt-1 space-y-1 border-l border-slate-200 pl-3">
                
                {/* Submenu Setting Invoice */}
                <Link 
                  href="/dashboard/rasarasabyrania/setting-invoice" 
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === "/dashboard/rasarasabyrania/setting-invoice"
                      ? "text-indigo-700 bg-indigo-50/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`} 
                  onClick={() => setIsOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="whitespace-nowrap">Setting Invoice</span>
                </Link>
                
                {/* Submenu Data Item */}
                <Link 
                  href="/dashboard/rasarasabyrania/data-item" 
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === "/dashboard/rasarasabyrania/data-item"
                      ? "text-indigo-700 bg-indigo-50/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`} 
                  onClick={() => setIsOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                  <span className="whitespace-nowrap">Data Item</span>
                </Link>

                {/* Submenu Invoice */}
                <Link 
                  href="/dashboard/rasarasabyrania/invoice" 
                  className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === "/dashboard/rasarasabyrania/invoice"
                      ? "text-indigo-700 bg-indigo-50/50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`} 
                  onClick={() => setIsOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="whitespace-nowrap">Invoice</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/dashboard/profile" className={getLinkClass("/dashboard/profile")} onClick={() => setIsOpen(false)} title="Profile">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            {!isCollapsed && <span className="whitespace-nowrap">Profile</span>}
          </Link>

        </nav>

        {/* Footer Sidebar */}
        <div className={`border-t border-slate-200 p-4 text-xs text-slate-400 ${isCollapsed ? "text-center" : ""}`}>
          {isCollapsed ? "v12.00" : "Version 12.00"}
        </div>
      </aside>
    </>
  );
}