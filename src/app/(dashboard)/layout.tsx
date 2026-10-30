import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/components/DashboardShell";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");

  // 1. Cek Login
  if (!session) {
    redirect("/login");
  }

  // 2. Cek Role (Apakah dia Admin?)
  try {
    // Cookie disimpan dalam bentuk string JSON yang di-encode. Kita harus membacanya.
    const user = JSON.parse(decodeURIComponent(session.value));
    
    // Jika dia Operator, kita tidak tahu dia sedang di halaman apa dari layout ini.
    // Kita hanya bisa mengandalkan pengecekan di dalam halaman (Client-Side).
    // *Catatan: Next.js Layout tidak memiliki akses ke URL path saat ini secara langsung.*
  } catch (error) {
    // Jika cookie rusak, tendang ke login
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}