"use client";

import { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";

type DataCenterItem = {
  id: string;
  aktivitas: string;
  tempat: string;
  bulan: string;
  date: string;
  kategori: string;
  nama_item: string;
  harga: string;
  source_url: string;
};

export default function DataCenterPage() {
  const [role, setRole] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [data, setData] = useState<DataCenterItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // State untuk Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  // State untuk konfirmasi hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Cek Role dan Ambil Data saat halaman dimuat
  useEffect(() => {
    const session = Cookies.get("user_session");
    if (session) {
      const user = JSON.parse(session);
      setRole(user.role);
    }
    fetchLocalData();
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  // 1. Ambil data yang ADA DI DATABASE KITA (Sheet DataCenter)
  async function fetchLocalData() {
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const response = await fetch(`${backendUrl}?action=getDataCenter`, { method: "GET" });
      const result = await response.json();

      if (result.status === "success") {
        const rows = result.data.slice(1);
        const formattedData = rows
          .filter((row: any) => row[0])
          .map((row: any) => ({
            id: row[0],
            aktivitas: row[1],
            tempat: row[2],
            bulan: row[3],
            date: row[4],
            kategori: row[5],
            nama_item: row[6],
            harga: row[7],
            source_url: row[8],
          }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data lokal:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // 2. Ambil data DARI URL SUMBER
  async function handleLoadData() {
    if (!url) {
      showToast("error", "URL sumber wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      const sourceResponse = await fetch(url);
      const sourceData = await sourceResponse.json();

      if (!Array.isArray(sourceData)) {
        throw new Error("Format data dari URL tidak valid (harus berupa Array).");
      }

      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "syncDataCenter");
      bodyData.append("data", JSON.stringify(sourceData));
      bodyData.append("source_url", url);

      const saveResponse = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const saveResult = await saveResponse.json();

      if (saveResult.status === "success") {
        showToast("success", `Berhasil menarik ${saveResult.total} data dari sumber!`);
        fetchLocalData();
      } else {
        showToast("error", saveResult.message || "Gagal menyimpan data.");
      }
    } catch (error: any) {
      showToast("error", error.message || "Gagal mengambil data dari URL.");
    } finally {
      setIsLoading(false);
    }
  }

  // 3. Hapus data yang dipilih
  async function handleDeleteSelected() {
    if (selectedRows.length === 0) return;

    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "deleteDataCenter");
      bodyData.append("ids", JSON.stringify(selectedRows));

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const result = await response.json();

      if (result.status === "success") {
        showToast("success", `${selectedRows.length} data berhasil dihapus!`);
        setSelectedRows([]);
        setIsDeleteModalOpen(false);
        fetchLocalData();
      } else {
        showToast("error", result.message || "Gagal menghapus data.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Select All
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredData.map((item) => item.id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle Select Row
  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  // Format Rupiah
  const formatRupiah = (angka: string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(angka));
  };

  // Format Tanggal
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Jakarta"
      });
    } catch (error) {
      return dateString;
    }
  };

  // === LOGIKA FILTER & SEARCH ===
  
  // Ambil daftar Bulan & Kategori unik dari data untuk dropdown
  const uniqueBulan = useMemo(() => {
    const bulan = data.map((item) => item.bulan);
    return [...new Set(bulan)].filter(Boolean).sort();
  }, [data]);

  const uniqueKategori = useMemo(() => {
    const kategori = data.map((item) => item.kategori);
    return [...new Set(kategori)].filter(Boolean).sort();
  }, [data]);

  // Filter Data berdasarkan Search Term, Bulan, dan Kategori
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Cek Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        row.aktivitas.toLowerCase().includes(searchLower) ||
        row.tempat.toLowerCase().includes(searchLower) ||
        row.kategori.toLowerCase().includes(searchLower) ||
        row.nama_item.toLowerCase().includes(searchLower) ||
        row.bulan.toLowerCase().includes(searchLower);

      // Cek Filter Bulan
      const matchBulan = filterBulan === "" || row.bulan === filterBulan;

      // Cek Filter Kategori
      const matchKategori = filterKategori === "" || row.kategori === filterKategori;

      return matchSearch && matchBulan && matchKategori;
    });
  }, [data, searchTerm, filterBulan, filterKategori]);


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
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Data Center</h1>
        <p className="text-slate-500">Tarik dan kelola data dari URL sumber secara sementara.</p>
      </div>

      {/* Panel Kontrol (HANYA UNTUK ADMIN) */}
      {role === "admin" && (
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-slate-700">URL Sumber Data (JSON)</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <div className="flex space-x-3 pt-6 sm:pt-0">
            <button
              onClick={handleLoadData}
              disabled={isLoading}
              className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isLoading ? "Memproses..." : "Load / Refresh"}
            </button>
          </div>
        </div>
      )}

      {/* Tabel Data & Search & Filter */}
      <div className="space-y-4">
        
        {/* Baris Kontrol: Search, Filter, dan Tombol Hapus */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Grup Search & Filter */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            {/* Input Search */}
            <div className="relative w-full max-w-xs">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari data..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>

            {/* Dropdown Filter Bulan */}
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Semua Bulan</option>
              {uniqueBulan.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            {/* Dropdown Filter Kategori */}
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Semua Kategori</option>
              {uniqueKategori.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          
          {/* Tombol Hapus (HANYA UNTUK ADMIN) */}
          {role === "admin" && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={selectedRows.length === 0 || isLoading}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 sm:w-auto w-full"
            >
              Hapus Terpilih ({selectedRows.length})
            </button>
          )}
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  {role === "admin" && (
                    <th className="px-4 py-4 font-medium">
                      <input
                        type="checkbox"
                        checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  <th className="px-4 py-4 font-medium">ID</th>
                  <th className="px-4 py-4 font-medium">Aktivitas</th>
                  <th className="px-4 py-4 font-medium">Tempat</th>
                  <th className="px-4 py-4 font-medium">Bulan</th>
                  <th className="px-4 py-4 font-medium">Tanggal</th>
                  <th className="px-4 py-4 font-medium">Kategori</th>
                  <th className="px-4 py-4 font-medium">Nama Item</th>
                  <th className="px-4 py-4 text-right font-medium">Harga</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {isLoading && data.length === 0 ? (
                  <tr>
                    <td colSpan={role === "admin" ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={role === "admin" ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                      {data.length === 0 ? "Belum ada data. Silakan Load Data." : "Data tidak ditemukan dengan filter tersebut."}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      {role === "admin" && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(row.id)}
                            onChange={() => handleSelectRow(row.id)}
                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-4">{row.id}</td>
                      <td className="px-4 py-4">{row.aktivitas}</td>
                      <td className="px-4 py-4">{row.tempat}</td>
                      <td className="px-4 py-4">{row.bulan}</td>
                      <td className="px-4 py-4">{formatDate(row.date)}</td>
                      <td className="px-4 py-4">{row.kategori}</td>
                      <td className="px-4 py-4">{row.nama_item}</td>
                      <td className="px-4 py-4 text-right">{formatRupiah(row.harga)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            
            <h3 className="mb-2 text-center text-lg font-bold text-slate-800">Hapus Data Terpilih?</h3>
            <p className="mb-6 text-center text-sm text-slate-500">
              Anda akan menghapus <strong className="text-slate-800">{selectedRows.length}</strong> data. Data bisa dikembalikan dengan menekan tombol Refresh (jika Anda Admin).
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={isLoading}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}