import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/app/components/DashboardShell";

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

  // Jika ada, render DashboardShell (Sidebar + Navbar) dan isi halamannya
  return <DashboardShell>{children}</DashboardShell>;
}