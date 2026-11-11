"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

type Item = {
  item_code: string;
  item_name: string;
  price: string;
};

type InvoiceRow = {
  item_code: string;
  item_name: string;
  price: number;
  quantity: number;
  amount: number;
};

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const [masterItems, setMasterItems] = useState<Item[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);

  const [billedTo, setBilledTo] = useState("");
  const [date, setDate] = useState("");
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>([]);
  const [shippingCost, setShippingCost] = useState(""); // State Ongkir
  
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [activeDropdownIndex, setActiveDropdownIndex] = useState<number | null>(null);
  const [searchItemText, setSearchItemText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMasterItems();
    fetchInvoiceData();
  }, [invoiceId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchMasterItems() {
    setIsLoadingItems(true);
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
            price: row[2].toString(),
          }));
        setMasterItems(formattedItems);
      }
    } catch (error) {
      console.error("Gagal mengambil master item:", error);
    } finally {
      setIsLoadingItems(false);
    }
  }

  async function fetchInvoiceData() {
    setIsLoadingInvoice(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const response = await fetch(`${backendUrl}?action=getInvoices`, { method: "GET" });
      const result = await response.json();

      if (result.status === "success") {
        const rows = result.data.slice(1);
        const found = rows.find((row: any) => row[0].toString() === invoiceId);
        
        if (found) {
          setBilledTo(found[2]);
          // Ubah format date menjadi YYYY-MM-DD agar bisa dibaca input type="date"
          const d = new Date(found[3]);
          setDate(isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0]);
          setInvoiceRows(JSON.parse(found[6]));
          setShippingCost((found[10] || "0").toString()); // Ambil Ongkir dari index 10
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);
    } finally {
      setIsLoadingInvoice(false);
    }
  }

  function addRow() {
    setInvoiceRows([
      ...invoiceRows,
      { item_code: "", item_name: "", price: 0, quantity: 1, amount: 0 },
    ]);
  }

  function removeRow(index: number) {
    const newRows = [...invoiceRows];
    newRows.splice(index, 1);
    setInvoiceRows(newRows);
  }

  function handleItemSelect(index: number, selectedItem: Item) {
    const newRows = [...invoiceRows];
    newRows[index] = {
      ...newRows[index],
      item_code: selectedItem.item_code,
      item_name: selectedItem.item_name,
      price: Number(selectedItem.price),
      amount: Number(selectedItem.price) * newRows[index].quantity,
    };
    setInvoiceRows(newRows);
    setActiveDropdownIndex(null);
    setSearchItemText("");
  }

  function handleQuantityChange(index: number, qty: number) {
    const newRows = [...invoiceRows];
    const validQty = qty < 1 ? 1 : qty;
    newRows[index] = {
      ...newRows[index],
      quantity: validQty,
      amount: newRows[index].price * validQty,
    };
    setInvoiceRows(newRows);
  }

  const filteredMasterItems = masterItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchItemText.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchItemText.toLowerCase())
  );

  // KALKULASI TOTAL (SubTotal + Ongkir)
  const subTotal = invoiceRows.reduce((sum, row) => sum + row.amount, 0);
  const parsedShippingCost = parseFloat(shippingCost) || 0;
  const totalAmount = subTotal + parsedShippingCost;

  async function handleUpdateInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!billedTo) {
      showToast("error", "Billed To wajib diisi!");
      return;
    }
    if (invoiceRows.length === 0) {
      showToast("error", "Tambahkan minimal 1 item!");
      return;
    }
    const hasEmptyRow = invoiceRows.some((row) => !row.item_code);
    if (hasEmptyRow) {
      showToast("error", "Ada baris yang belum dipilih itemnya!");
      return;
    }

    setIsSaving(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "updateInvoice");
      bodyData.append("invoice_id", invoiceId);
      bodyData.append("billed_to", billedTo);
      bodyData.append("date", date);
      bodyData.append("sub_total", subTotal.toString());
      bodyData.append("total_amount", totalAmount.toString());
      bodyData.append("items_json", JSON.stringify(invoiceRows));
      bodyData.append("shipping_cost", parsedShippingCost.toString()); // Kirim Ongkir

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", "Invoice berhasil diperbarui!");
        router.push(`/dashboard/rasarasabyrania/invoice/${invoiceId}`);
      } else {
        showToast("error", data.message || "Gagal memperbarui invoice.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  }

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  if (isLoadingInvoice) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500 font-medium">Memuat data invoice...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-6 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Edit Invoice</h1>
        <p className="text-slate-500">Perbarui detail tagihan.</p>
      </div>

      <form onSubmit={handleUpdateInvoice} className="space-y-6">
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Billed To</label>
              <input
                type="text"
                value={billedTo}
                onChange={(e) => setBilledTo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Invoice</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold text-slate-800">Detail Item</h3>
          
          <div className="space-y-3">
            {invoiceRows.map((row, index) => (
              <div key={index} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-start">
                
                <div className="flex-1 relative" ref={activeDropdownIndex === index ? dropdownRef : null}>
                  <label className="mb-1 block text-xs font-medium text-slate-500 sm:hidden">Pilih Item</label>
                  
                  <div 
                    onClick={() => {
                      setActiveDropdownIndex(activeDropdownIndex === index ? null : index);
                      setSearchItemText("");
                    }}
                    className="w-full cursor-pointer rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-indigo-500 flex justify-between items-center"
                  >
                    <span className={row.item_name ? "text-slate-800" : "text-slate-400"}>
                      {row.item_name || "-- Pilih Item --"}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  {activeDropdownIndex === index && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
                      <div className="p-2 border-b border-slate-100">
                        <input
                          type="text"
                          value={searchItemText}
                          onChange={(e) => setSearchItemText(e.target.value)}
                          placeholder="Cari item..."
                          className="w-full rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500"
                          autoFocus
                        />
                      </div>
                      <ul className="max-h-48 overflow-y-auto text-sm">
                        {filteredMasterItems.length === 0 ? (
                          <li className="px-3 py-2 text-slate-500">Item tidak ditemukan</li>
                        ) : (
                          filteredMasterItems.map((item) => (
                            <li 
                              key={item.item_code}
                              onClick={() => handleItemSelect(index, item)}
                              className="cursor-pointer px-3 py-2 hover:bg-indigo-50 hover:text-indigo-700"
                            >
                              {item.item_name}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-32">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Harga</label>
                  <input
                    type="text"
                    value={formatRupiah(row.price)}
                    disabled
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm text-slate-500"
                  />
                </div>

                <div className="w-full sm:w-24">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                    className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="w-full sm:w-32">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Amount</label>
                  <input
                    type="text"
                    value={formatRupiah(row.amount)}
                    disabled
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="mt-4 sm:mt-5 cursor-pointer rounded-md p-2 text-red-500 hover:bg-red-50"
                  title="Hapus Baris"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addRow}
            className="mt-4 flex w-full items-center justify-center rounded-lg border border-dashed border-indigo-300 bg-indigo-50 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 cursor-pointer"
          >
            + Tambah Item
          </button>
        </div>

        {/* SECTION TOTAL & ONGKIR */}
        <div className="flex flex-col items-end space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          
          {/* INPUT ONGKIR */}
          <div className="flex w-full items-center justify-between border-b border-slate-200 pb-2 sm:w-64">
            <span className="text-sm text-slate-500">Ongkir (Rp)</span>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(e.target.value)}
              placeholder="0"
              className="w-32 rounded-md border border-slate-300 px-2 py-1 text-right text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex w-full items-center justify-between border-b border-slate-200 pb-2 sm:w-64">
            <span className="text-sm text-slate-500">Sub-Total</span>
            <span className="font-semibold text-slate-800">{formatRupiah(subTotal)}</span>
          </div>
          <div className="flex w-full items-center justify-between pt-2 sm:w-64">
            <span className="text-lg font-bold text-slate-800">TOTAL</span>
            <span className="text-xl font-bold text-indigo-600">{formatRupiah(totalAmount)}</span>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSaving}
            className="cursor-pointer rounded-lg border border-slate-300 px-6 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSaving || isLoadingItems}
            className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </form>
    </div>
  );
}