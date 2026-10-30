"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // State Form
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State Notifikasi
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const session = Cookies.get("user_session");
    if (!session) {
      router.replace("/login");
    } else {
      const parsedUser = JSON.parse(session);
      setUser(parsedUser);
      setFullName(parsedUser.full_name);
      setIsAuthorized(true);
    }
  }, [router]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    
    if (!fullName) {
      showToast("error", "Nama lengkap tidak boleh kosong.");
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      showToast("error", "Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!url) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "updateProfile");
      bodyData.append("user_id", user.user_id);
      bodyData.append("full_name", fullName);
      bodyData.append("new_password", newPassword);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", "Profil berhasil diperbarui!");
        
        // Update cookie dengan data terbaru
        Cookies.set("user_session", JSON.stringify(data.user), { expires: 1, path: "/" });
        
        // Kosongkan form password
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showToast("error", data.message || "Gagal memperbarui profil.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthorized) return null;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Toast Notifikasi */}
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-6 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Profile Saya</h1>
        <p className="text-slate-500">Perbarui informasi akun dan keamanan Anda.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleUpdate} className="space-y-6">
          
          {/* Info Read-Only */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
              <input
                type="text"
                value={user?.username || ""}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role Akses</label>
              <input
                type="text"
                value={user?.role === "admin" ? "Administrator" : "Operator"}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 outline-none cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Form Update */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kosongkan jika tidak diganti"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}