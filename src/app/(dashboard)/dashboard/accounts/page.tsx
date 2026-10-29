"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  user_id: string;
  full_name: string;
  username: string;
  role: string;
  status: string;
};

export default function AccountsPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formFullName, setFormFullName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("operator");
  const [formStatus, setFormStatus] = useState("aktif");
  const [isSaving, setIsSaving] = useState(false); // State Loading Simpan

  // State Modal Konfirmasi Hapus
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Toast Notifikasi
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Proteksi Halaman
  useEffect(() => {
    const session = localStorage.getItem("user_session");
    if (!session) {
      router.push("/login");
    } else {
      const user = JSON.parse(session);
      if (user.role !== "admin") {
        router.push("/dashboard");
      } else {
        setIsAuthorized(true);
        fetchUsers();
      }
    }
  }, [router]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!url) throw new Error("URL backend tidak ditemukan.");

      const response = await fetch(`${url}?action=getUsers`, { method: "GET" });
      const data = await response.json();

      if (data.status === "success") {
        const rows = data.data;
        const formattedUsers = rows
          .filter((row: any) => row[0] && row[0] !== "user_id")
          .map((row: any) => ({
            user_id: row[0],
            full_name: row[1],
            username: row[2],
            role: row[4],
            status: row[5],
          }));

        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Buka Modal Tambah
  function openAddModal() {
    setEditId(null);
    setFormFullName("");
    setFormUsername("");
    setFormPassword("");
    setFormRole("operator");
    setFormStatus("aktif");
    setIsModalOpen(true);
  }

  // Buka Modal Edit
  function openEditModal(user: User) {
    setEditId(user.user_id);
    setFormFullName(user.full_name);
    setFormUsername(user.username);
    setFormPassword(""); // Kosongkan password
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsModalOpen(true);
  }

  // Proses Simpan (Tambah / Edit)
  async function handleSaveUser(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formFullName || !formUsername) {
      showToast("error", "Nama dan Username wajib diisi!");
      return;
    }
    if (!editId && !formPassword) {
      showToast("error", "Password wajib diisi untuk akun baru!");
      return;
    }

    setIsSaving(true);

    try {
      const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!url) throw new Error("URL backend tidak ditemukan.");

      const actionType = editId ? "updateUser" : "addUser";
      const bodyData = new URLSearchParams();
      bodyData.append("action", actionType);
      bodyData.append("full_name", formFullName);
      bodyData.append("username", formUsername);
      bodyData.append("password", formPassword);
      bodyData.append("role", formRole);
      bodyData.append("status", formStatus);
      
      if (editId) {
        bodyData.append("user_id", editId);
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", editId ? "Akun berhasil diperbarui!" : "Akun berhasil ditambahkan!");
        setIsModalOpen(false); 
        fetchUsers(); 
      } else {
        showToast("error", data.message || "Gagal menyimpan data.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  }

  // Proses Hapus
  async function confirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const url = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!url) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "deleteUser");
      bodyData.append("user_id", deleteTarget.user_id);

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", `Akun "${deleteTarget.username}" berhasil dihapus!`);
        setDeleteTarget(null);
        fetchUsers();
      } else {
        showToast("error", data.message || "Gagal menghapus akun.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Memeriksa sesi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-6 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Akun</h1>
          <p className="text-slate-500">Kelola data pengguna aplikasi.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 sm:mt-0"
        >
          + Tambah Akun
        </button>
      </div>

      {/* Tabel Data */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">No</th>
                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                <th className="px-6 py-4 font-medium">Username</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Memuat data dari Spreadsheet...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data akun.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.user_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{user.full_name}</td>
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin" ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-800"
                      }`}>
                        {user.role === "admin" ? "Admin" : "Operator"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.status === "aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="cursor-pointer rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteTarget(user)}
                        className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:text-red-900"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT AKUN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editId ? "Edit Akun" : "Tambah Akun Baru"}
              </h3>
            </div>
            
            <form onSubmit={handleSaveUser}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
                  <input
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Password {editId && <span className="text-xs text-slate-400 font-normal">(Kosongkan jika tidak ingin ganti)</span>}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                    >
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  {editId && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 border-t border-slate-200 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            
            <h3 className="mb-2 text-center text-lg font-bold text-slate-800">Hapus Akun?</h3>
            <p className="mb-6 text-center text-sm text-slate-500">
              Apakah Anda yakin ingin menghapus akun <strong className="text-slate-800">{deleteTarget.username}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}