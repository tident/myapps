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

  // State untuk Pencarian & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterKategori, setFilterKategori] = useState("");

  // State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  // Reset halaman ke 1 setiap kali filter/pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBulan, filterKategori, itemsPerPage]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

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

  const formatRupiah = (angka: string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(Number(angka));
  };

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

  const uniqueBulan = useMemo(() => {
    // 1. Ambil semua bulan unik
    const bulan = data.map((item) => item.bulan);
    const unique = [...new Set(bulan)].filter(Boolean);

    // 2. Definisikan urutan bulan yang benar
    const monthOrder = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // 3. Urutkan berdasarkan index di dalam array monthOrder
    return unique.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  }, [data]);

  const uniqueKategori = useMemo(() => {
    const kategori = data.map((item) => item.kategori);
    return [...new Set(kategori)].filter(Boolean).sort();
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        row.aktivitas.toLowerCase().includes(searchLower) ||
        row.tempat.toLowerCase().includes(searchLower) ||
        row.kategori.toLowerCase().includes(searchLower) ||
        row.nama_item.toLowerCase().includes(searchLower) ||
        row.bulan.toLowerCase().includes(searchLower);

      const matchBulan = filterBulan === "" || row.bulan === filterBulan;
      const matchKategori = filterKategori === "" || row.kategori === filterKategori;

      return matchSearch && matchBulan && matchKategori;
    });
  }, [data, searchTerm, filterBulan, filterKategori]);

  // === LOGIKA PAGINASI DENGAN OPSI SEMUA DATA ===
  const totalPages = itemsPerPage === 999999 ? 1 : Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = itemsPerPage === 999999 ? filteredData : filteredData.slice(startIndex, endIndex);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = currentData.map((item) => item.id);
      setSelectedRows((prev) => [...new Set([...prev, ...currentIds])]);
    } else {
      const currentIds = currentData.map((item) => item.id);
      setSelectedRows((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllCurrentPageSelected = currentData.length > 0 && currentData.every((row) => selectedRows.includes(row.id));

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-6 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Data Center</h1>
        <p className="text-slate-500">Tarik dan kelola data dari URL sumber secara sementara.</p>
      </div>

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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        
        {/* Top Bar: Show Entries & Filters & Search & Tombol Hapus */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          
          {/* Show Entries */}
          <div className="flex items-center space-x-2 text-sm text-slate-600">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-1.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={999999}>Semua Data</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search & Filter & Hapus */}
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
            
            {role === "admin" && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={selectedRows.length === 0 || isLoading}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Hapus ({selectedRows.length})
              </button>
            )}

            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Semua Bulan</option>
              {uniqueBulan.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>

            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="">Semua Kategori</option>
              {uniqueKategori.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>

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
                placeholder="Search..."
                className="w-full rounded-lg border border-slate-300 py-1.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {role === "admin" && (
                  <th className="px-4 py-4 font-medium w-12">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleSelectAll}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={role === "admin" ? 9 : 8} className="px-4 py-8 text-center text-slate-500">
                    {data.length === 0 ? "Belum ada data. Silakan Load Data." : "Data tidak ditemukan dengan filter tersebut."}
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    {role === "admin" && (
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
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

        {/* BOTTOM BAR: Pagination & Info */}
        <div className="flex flex-col items-center justify-between border-t border-slate-200 p-4 sm:flex-row">
          <div className="mb-4 text-sm text-slate-500 sm:mb-0">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          
          {/* Sembunyikan paginasi jika memilih Semua Data */}
          {itemsPerPage !== 999999 && (
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &lt;
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  if (totalPages <= 5) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                  return false;
                })
                .map((page, index, array) => {
                  const showEllipsis = index > 0 && page - array[index - 1] > 1;
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer ${
                          currentPage === page
                            ? "bg-indigo-600 text-white border border-indigo-600"
                            : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  );
                })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &gt;
              </button>
            </div>
          )}
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