import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";

// Memberi tahu Next.js bahwa halaman ini butuh data per-request (cookie)
export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server memeriksa cookie
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");

  // Jika tidak ada cookie, tendang ke login dari sisi server
  if (!session) {
    redirect("/login");
  }

  // Jika ada, render layout (Sidebar & Navbar) dan isi halamannya
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}