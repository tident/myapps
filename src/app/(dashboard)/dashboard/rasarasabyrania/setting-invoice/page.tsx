"use client";

import { useEffect, useState } from "react";

type Settings = {
  bank: string;
  account_name: string;
  account_number: string;
  wa_number: string;
  ig_handle: string;
};

export default function SettingInvoicePage() {
  const [settings, setSettings] = useState<Settings>({
    bank: "",
    account_name: "",
    account_number: "",
    wa_number: "",
    ig_handle: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchSettings() {
    setIsLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const response = await fetch(`${backendUrl}?action=getInvoiceSettings`, { method: "GET" });
      const result = await response.json();

      if (result.status === "success") {
        setSettings({
          bank: result.data.bank || "",
          account_name: result.data.account_name || "",
          account_number: result.data.account_number || "",
          wa_number: result.data.wa_number || "",
          ig_handle: result.data.ig_handle || "",
        });
      }
    } catch (error) {
      console.error("Gagal mengambil setting:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL;
      if (!backendUrl) throw new Error("URL backend tidak ditemukan.");

      const bodyData = new URLSearchParams();
      bodyData.append("action", "saveInvoiceSettings");
      bodyData.append("bank", settings.bank);
      bodyData.append("account_name", settings.account_name);
      bodyData.append("account_number", settings.account_number);
      bodyData.append("wa_number", settings.wa_number);
      bodyData.append("ig_handle", settings.ig_handle);

      const response = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: bodyData.toString(),
      });

      const data = await response.json();

      if (data.status === "success") {
        showToast("success", "Pengaturan Invoice berhasil disimpan!");
      } else {
        showToast("error", data.message || "Gagal menyimpan pengaturan.");
      }
    } catch (error) {
      showToast("error", "Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-slate-500 font-medium">Memuat pengaturan...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {toast && (
        <div className={`fixed right-6 top-20 z-50 rounded-lg px-6 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-800">Setting Invoice</h1>
        <p className="text-slate-500">Atur informasi default yang akan muncul di setiap invoice.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Footer: Bank Info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-800 uppercase tracking-wide border-b pb-2">Informasi Pembayaran (Pay To)</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nama Bank</label>
                <input
                  type="text"
                  value={settings.bank}
                  onChange={(e) => setSettings({ ...settings, bank: e.target.value })}
                  placeholder="Contoh: Bank BCA"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nomor Rekening</label>
                <input
                  type="text"
                  value={settings.account_number}
                  onChange={(e) => setSettings({ ...settings, account_number: e.target.value })}
                  placeholder="Contoh: 5271385456"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-slate-700">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  value={settings.account_name}
                  onChange={(e) => setSettings({ ...settings, account_name: e.target.value })}
                  placeholder="Contoh: Rania Kemala Ayu"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          {/* Header: Kontak */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-800 uppercase tracking-wide border-b pb-2">Informasi Kontak</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={settings.wa_number}
                  onChange={(e) => setSettings({ ...settings, wa_number: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Username Instagram</label>
                <input
                  type="text"
                  value={settings.ig_handle}
                  onChange={(e) => setSettings({ ...settings, ig_handle: e.target.value })}
                  placeholder="Contoh: @rasarasabvrania"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}