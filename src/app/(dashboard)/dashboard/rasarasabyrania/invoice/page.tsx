"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Invoice = {
  invoice_id: string;
  invoice_number: string;
  billed_to: string;
  date: string;
  total_amount: string;
  total_modal: string;
  profit: string;
  created_at: string;
};

export default function InvoiceListPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Pencarian & Paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk Multi-Select
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // State untuk Modal Konfirmasi Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterBulan, itemsPerPage]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchInvoices() {
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const response = await fetch(`${backendUrl}?action=getInvoices`, { method: "GET" });
      const result = await response.json();

      if (result.status === "success") {
        const rows = result.data.slice(1);
        const formattedData = rows
          .filter((row: any) => row[0])
          .map((row: any) => ({
            invoice_id: row[0],
            invoice_number: row[1],
            billed_to: row[2],
            date: row[3],
            total_amount: row[5],
            total_modal: row[8], // Ambil dari index 8
            profit: row[9],      // Ambil dari index 9
            created_at: row[7],
          }));
        setInvoices(formattedData.reverse());
      }
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatRupiah = (angka: string | number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(angka));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // === LOGIKA DROPDOWN BULAN ===
  const uniqueBulan = useMemo(() => {
    const months = invoices.map((item) => {
      if (!item.date) return "";
      try {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-GB", { month: "long" });
      } catch (e) {
        return "";
      }
    }).filter(Boolean);

    const unique = [...new Set(months)];
    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return unique.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  }, [invoices]);

  // === LOGIKA FILTER & PAGINASI ===
  const filteredData = useMemo(() => {
    return invoices.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        row.invoice_number.toLowerCase().includes(searchLower) ||
        row.billed_to.toLowerCase().includes(searchLower);

      let matchBulan = true;
      if (filterBulan !== "" && row.date) {
        const date = new Date(row.date);
        const rowMonth = date.toLocaleDateString("en-GB", { month: "long" });
        matchBulan = rowMonth === filterBulan;
      }

      return matchSearch && matchBulan;
    });
  }, [invoices, searchTerm, filterBulan]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === LOGIKA MULTI-SELECT ===
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = currentData.map((item) => item.invoice_id);
      setSelectedRows((prev) => [...new Set([...prev, ...currentIds])]);
    } else {
      const currentIds = currentData.map((item) => item.invoice_id);
      setSelectedRows((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllCurrentPageSelected = currentData.length > 0 && currentData.every((row) => selectedRows.includes(row.invoice_id));

  // === LOGIKA HAPUS ===
  function openDeleteSingle(invoiceId: string) {
    setSelectedRows([invoiceId]);
    setIsDeleteModalOpen(true);
  }

  function openDeleteMultiple() {
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    if (selectedRows.length === 0) return;

    setIsDeleting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "deleteInvoice");
      bodyData.append("invoice_id", JSON.stringify(selectedRows));

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", data.message || "Invoice berhasil dihapus!");
        setSelectedRows([]);
        setIsDeleteModalOpen(false);
        fetchInvoices();
      } else {
        showToast("error", data.message || "Gagal menghapus invoice.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-6 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoice</h1>
          <p className="text-slate-500">Riwayat tagihan Rasarasabyrania.</p>
        </div>
        <Link
          href="/dashboard/rasarasabyrania/invoice/create"
          className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 sm:mt-0 text-center"
        >
          + Buat Invoice Baru
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
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
            </select>
            <span>entries</span>
          </div>

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end sm:items-center">
            {selectedRows.length > 0 && (
              <button
                onClick={openDeleteMultiple}
                className="cursor-pointer rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 whitespace-nowrap"
              >
                Hapus Terpilih ({selectedRows.length})
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
                placeholder="Cari No. Invoice atau Nama..."
                className="w-full rounded-lg border border-slate-300 py-1.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-4 font-medium w-12">
                  <input
                    type="checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 font-medium">No. Invoice</th>
                <th className="px-4 py-4 font-medium">Billed To</th>
                <th className="px-4 py-4 font-medium">Tanggal</th>
                <th className="px-4 py-4 text-right font-medium">Modal</th>
                <th className="px-4 py-4 text-right font-medium">Profit</th>
                <th className="px-4 py-4 text-center font-medium">Total</th>
                <th className="px-4 py-4 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Memuat data invoice...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    Belum ada invoice. Silakan buat invoice baru.
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr key={row.invoice_id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.invoice_id)}
                        onChange={() => handleSelectRow(row.invoice_id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{row.invoice_number}</td>
                    <td className="px-4 py-4">{row.billed_to}</td>
                    <td className="px-4 py-4">{formatDate(row.date)}</td>
                    
                    {/* KOLOM MODAL (Warning Light) */}
                    <td className="px-4 py-4 text-right">
                      <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        {formatRupiah(row.total_modal)}
                      </span>
                    </td>

                    {/* KOLOM PROFIT (Success Light + Icon) */}
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                        Number(row.profit) >= 0 
                        ? 'bg-green-50 text-green-700 ring-green-600/20' 
                        : 'bg-red-50 text-red-700 ring-red-600/20'
                      }`}>
                        {Number(row.profit) >= 0 ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                            <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                          </svg>
                        )}
                        {formatRupiah(row.profit)}
                      </span>
                    </td>

                    {/* KOLOM TOTAL (Solid Success) */}
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center rounded-md bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                        {formatRupiah(row.total_amount)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center space-x-2">
                      <button 
                        onClick={() => router.push(`/dashboard/rasarasabyrania/invoice/${row.invoice_id}`)}
                        title="Lihat & Generate PDF"
                        className="cursor-pointer rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1.5 text-indigo-600 hover:text-indigo-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => router.push(`/dashboard/rasarasabyrania/invoice/edit/${row.invoice_id}`)}
                        title="Edit Invoice"
                        className="cursor-pointer rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-amber-600 hover:text-amber-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => openDeleteSingle(row.invoice_id)}
                        title="Hapus"
                        className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-red-600 hover:text-red-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-slate-200 p-4 sm:flex-row">
          <div className="mb-4 text-sm text-slate-500 sm:mb-0">
            Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-indigo-600 text-white border border-indigo-600"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center justify-center rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              &gt;
            </button>
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
            
            <h3 className="mb-2 text-center text-lg font-bold text-slate-800">Hapus Invoice?</h3>
            <p className="mb-6 text-center text-sm text-slate-500">
              Anda akan menghapus <strong className="text-slate-800">{selectedRows.length} invoice</strong>. Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedRows([]); }}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
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