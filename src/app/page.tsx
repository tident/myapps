import { redirect } from "next/navigation";

export default function Home() {
  // Otomatis arahkan ke halaman login
  redirect("/login");
}