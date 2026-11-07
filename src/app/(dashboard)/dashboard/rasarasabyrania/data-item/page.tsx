"use client";

import { useEffect, useState, useMemo } from "react";

type Item = {
  item_code: string;
  item_name: string;
  price: string;
  created_at: string;
};

export default function DataItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Pencarian & Paginasi
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk Multi-Select
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // State untuk Modal Form (Tambah / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [originalItemCode, setOriginalItemCode] = useState("");
  const [formItemCode, setFormItemCode] = useState("");
  const [formItemName, setFormItemName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Modal Konfirmasi Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null); // null = hapus multiple, string = hapus satuan

  // State Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  // Reset halaman ke 1 saat filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchItems() {
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const response = await fetch(`${backendUrl}?action=getItems`, { method: "GET" });
      const result = await response.json();

      if (result.status === "success") {
        const rows = result.data.slice(1);
        const formattedItems = rows
          .filter((row: any) => row[0])
          .map((row: any) => ({
            item_code: row[0],
            item_name: row[1],
            price: row[2],
            created_at: row[3],
          }));
        setItems(formattedItems);
      }
    } catch (error) {
      console.error("Gagal mengambil data item:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const formatRupiah = (angka: string) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(angka));
  };

  // === LOGIKA FILTER & PAGINASI ===
  const filteredData = useMemo(() => {
    return items.filter((row) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        row.item_code.toLowerCase().includes(searchLower) ||
        row.item_name.toLowerCase().includes(searchLower)
      );
    });
  }, [items, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === LOGIKA MULTI-SELECT ===
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const currentIds = currentData.map((item) => item.item_code);
      setSelectedRows((prev) => [...new Set([...prev, ...currentIds])]);
    } else {
      const currentIds = currentData.map((item) => item.item_code);
      setSelectedRows((prev) => prev.filter((id) => !currentIds.includes(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const isAllCurrentPageSelected = currentData.length > 0 && currentData.every((row) => selectedRows.includes(row.item_code));

  // === LOGIKA SIMPAN (TAMBAH / EDIT) ===
  function openAddModal() {
    setEditMode(false);
    setOriginalItemCode("");
    setFormItemCode("");
    setFormItemName("");
    setFormPrice("");
    setIsModalOpen(true);
  }

  function openEditModal(item: Item) {
    setEditMode(true);
    setOriginalItemCode(item.item_code);
    setFormItemCode(item.item_code);
    setFormItemName(item.item_name);
    setFormPrice(item.price.toString());
    setIsModalOpen(true);
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!formItemCode || !formItemName || !formPrice) {
      showToast("error", "Semua kolom wajib diisi!");
      return;
    }

    setIsSaving(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", editMode ? "updateItem" : "addItem");
      bodyData.append("item_code", formItemCode);
      bodyData.append("item_name", formItemName);
      bodyData.append("price", formPrice);
      
      if (editMode) {
        bodyData.append("original_item_code", originalItemCode);
      }

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", editMode ? "Item berhasil diperbarui!" : "Item berhasil ditambahkan!");
        setIsModalOpen(false);
        fetchItems();
      } else {
        showToast("error", data.message || "Gagal menyimpan item.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  }

  // === LOGIKA HAPUS (SATUAN / MULTIPLE) ===
  function openDeleteSingle(itemCode: string) {
    setDeleteTarget(itemCode);
    setIsDeleteModalOpen(true);
  }

  function openDeleteMultiple() {
    setDeleteTarget(null);
    setIsDeleteModalOpen(true);
  }

  async function handleDeleteConfirm() {
    const itemsToDelete = deleteTarget ? [deleteTarget] : selectedRows;
    if (itemsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "deleteItems");
      bodyData.append("item_codes", JSON.stringify(itemsToDelete));

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", `${itemsToDelete.length} item berhasil dihapus!`);
        setSelectedRows((prev) => prev.filter(id => !itemsToDelete.includes(id))); // Hapus dari selected state jika multiple
        setIsDeleteModalOpen(false);
        setDeleteTarget(null);
        fetchItems();
      } else {
        showToast("error", data.message || "Gagal menghapus item.");
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
          <h1 className="text-2xl font-bold text-slate-800">Data Item</h1>
          <p className="text-slate-500">Kelola master barang Rasarasabyrania.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 sm:mt-0"
        >
          + Tambah Item
        </button>
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
                <th className="px-4 py-4 font-medium w-12">
                  <input
                    type="checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="px-4 py-4 font-medium">Kode Item</th>
                <th className="px-4 py-4 font-medium">Nama Item</th>
                <th className="px-4 py-4 text-right font-medium">Harga</th>
                <th className="px-4 py-4 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Memuat data...
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data item.
                  </td>
                </tr>
              ) : (
                currentData.map((row) => (
                  <tr key={row.item_code} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.item_code)}
                        onChange={() => handleSelectRow(row.item_code)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">{row.item_code}</td>
                    <td className="px-4 py-4">{row.item_name}</td>
                    <td className="px-4 py-4 text-right">{formatRupiah(row.price)}</td>
                    <td className="px-4 py-4 text-center space-x-2">
                      <button 
                        onClick={() => openEditModal(row)}
                        className="cursor-pointer rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => openDeleteSingle(row.item_code)}
                        className="cursor-pointer rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-900"
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

      {/* MODAL TAMBAH / EDIT ITEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                {editMode ? "Edit Item" : "Tambah Item Baru"}
              </h3>
            </div>
            
            <form onSubmit={handleSaveItem}>
              <div className="space-y-4 p-6">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Kode Item</label>
                  <input
                    type="text"
                    value={formItemCode}
                    onChange={(e) => setFormItemCode(e.target.value)}
                    placeholder="Contoh: KLP-01"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Nama Item</label>
                  <input
                    type="text"
                    value={formItemName}
                    onChange={(e) => setFormItemName(e.target.value)}
                    placeholder="Contoh: Klepon Cadbury"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Harga (Rp)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="Contoh: 18000"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  />
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
                  className="cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS (Satuan & Multiple) */}
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
            
            <h3 className="mb-2 text-center text-lg font-bold text-slate-800">Hapus Item?</h3>
            <p className="mb-6 text-center text-sm text-slate-500">
              {deleteTarget 
                ? `Anda yakin ingin menghapus item "${deleteTarget}"? Tindakan ini tidak dapat dibatalkan.`
                : `Anda akan menghapus ${selectedRows.length} item secara permanen.`
              }
            </p>

            <div className="flex justify-center space-x-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
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