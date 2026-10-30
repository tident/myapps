"use client";

import { useEffect, useState, useMemo } from "react";

type DataItem = {
  id: string;
  aktivitas: string;
  tempat: string;
  bulan: string;
  date: string;
  kategori: string;
  nama_item: string;
  harga: string;
};

export default function DataDashboardPage() {
  const [data, setData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Filter Bulan
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
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
          }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Helper Format
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);
  };

  // === LOGIKA FILTER BULAN UTAMA ===
  // 1. Filter data mentah berdasarkan bulan yang dipilih
  const filteredData = useMemo(() => {
    if (selectedMonth === "") return data;
    return data.filter((item) => item.bulan === selectedMonth);
  }, [data, selectedMonth]);

  // Daftar bulan unik untuk dropdown
  const availableMonths = useMemo(() => {
    const months = data.map((item) => item.bulan);
    return [...new Set(months)].filter(Boolean);
  }, [data]);

  // === 1. KARTU METRIK UTAMA (Berdasarkan filteredData) ===
  const metrics = useMemo(() => {
    let totalPengeluaran = 0;
    const uniqueDates = new Set<string>();

    filteredData.forEach((item) => {
      totalPengeluaran += Number(item.harga) || 0;
      if (item.date) uniqueDates.add(item.date);
    });

    const totalPertemuan = uniqueDates.size;
    const rataRataHarian = totalPertemuan > 0 ? totalPengeluaran / totalPertemuan : 0;

    return { 
      totalPengeluaran, 
      totalPertemuan, 
      rataRataHarian, 
      totalTransaksi: filteredData.length 
    };
  }, [filteredData]);

  // === 2. ANALISIS BULANAN (Grafik Batang) ===
  const analisisBulanan = useMemo(() => {
    const bulanMap: Record<string, { total: number, items: number, days: Set<string>, maxItem: DataItem | null }> = {};

    // Disini kita tetap pakai 'data' asli agar grafik perbandingan bulan selalu lengkap
    data.forEach((item) => {
      const b = item.bulan;
      if (!bulanMap[b]) {
        bulanMap[b] = { total: 0, items: 0, days: new Set(), maxItem: null };
      }
      
      const harga = Number(item.harga) || 0;
      bulanMap[b].total += harga;
      bulanMap[b].items += 1;
      if (item.date) bulanMap[b].days.add(item.date);

      if (!bulanMap[b].maxItem || harga > Number(bulanMap[b].maxItem!.harga)) {
        bulanMap[b].maxItem = item;
      }
    });

    // Menggunakan array bulan standar untuk sorting
    const monthOrder = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    
    return Object.entries(bulanMap).map(([bulan, d]) => ({
      bulan,
      total: d.total,
      items: d.items,
      days: d.days.size,
      maxItem: d.maxItem,
    })).sort((a, b) => monthOrder.indexOf(a.bulan) - monthOrder.indexOf(b.bulan));
  }, [data]);

  // === 3. LEADERBOARD TOP 5 (Berdasarkan filteredData) ===
  const getTop5 = (key: keyof DataItem) => {
    const map: Record<string, number> = {};
    filteredData.forEach((item) => {
      const val = item[key];
      const harga = Number(item.harga) || 0;
      if (val) map[val] = (map[val] || 0) + harga;
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const topKategori = getTop5("kategori");
  const topTempat = getTop5("tempat");
  const topAktivitas = getTop5("aktivitas");

  const maxKategori = topKategori[0]?.total || 1;
  const maxTempat = topTempat[0]?.total || 1;
  const maxAktivitas = topAktivitas[0]?.total || 1;

  // === 4. RASIO LIFESTYLE VS ESENSIAL ===
  const ratioAnalysis = useMemo(() => {
    let esensial = 0;
    let lifestyle = 0;
    
    // Daftar kata kunci kategori (bisa disesuaikan)
    const esensialKeywords = ["makan", "minum", "transport", "belanja", "kebutuhan", "pokok"];
    
    filteredData.forEach(item => {
      const harga = Number(item.harga) || 0;
      const kategori = item.kategori.toLowerCase();
      
      // Cek apakah masuk esensial
      const isEsensial = esensialKeywords.some(k => kategori.includes(k));
      
      if (isEsensial) {
        esensial += harga;
      } else {
        lifestyle += harga;
      }
    });

    const total = esensial + lifestyle || 1;
    return {
      esensial,
      lifestyle,
      persenEsensial: Math.round((esensial / total) * 100),
      persenLifestyle: Math.round((lifestyle / total) * 100),
    };
  }, [filteredData]);

  // === 5. BREAKDOWN WEEKEND VS WEEKDAY ===
  const timeAnalysis = useMemo(() => {
    let weekendTotal = 0;
    let weekdayTotal = 0;

    filteredData.forEach(item => {
      const harga = Number(item.harga) || 0;
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return; // Skip jika tanggal tidak valid
      
      const day = d.getDay(); // 0 = Minggu, 6 = Sabtu
      if (day === 0 || day === 6) {
        weekendTotal += harga;
      } else {
        weekdayTotal += harga;
      }
    });

    return { weekendTotal, weekdayTotal };
  }, [filteredData]);


  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-slate-500">Memuat data analitik...</div>;
  }

  if (data.length === 0) {
    return <div className="flex h-full items-center justify-center text-slate-500">Belum ada data di Data Center. Silakan Load Data terlebih dahulu.</div>;
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Executive Expense Analytics</h1>
            <p className="text-sm text-slate-500">Financial Intelligence & Breakdown Overview</p>
          </div>
        </div>

        {/* FILTER PERIODE BULAN */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <label className="text-sm font-medium text-slate-600">Periode:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Semua Bulan</option>
            {availableMonths.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. KARTU METRIK UTAMA */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Kartu 1: Total Pengeluaran */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Pengeluaran</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{formatRupiah(metrics.totalPengeluaran)}</p>
            </div>
            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Akumulasi keseluruhan</p>
        </div>

        {/* Kartu 2: Total Pertemuan (Dengan Badge Transaksi) */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Pertemuan</p>
              <div className="mt-2 flex items-baseline space-x-2">
                <p className="text-3xl font-bold text-slate-800">{metrics.totalPertemuan}</p>
                <span className="text-sm font-medium text-slate-500">Hari</span>
              </div>
              {/* Badge Total Transaksi */}
              <div className="mt-3 inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                {metrics.totalTransaksi} Total Transaksi
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Kartu 3: Rata-Rata Harian */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Rata-Rata Harian</p>
              <p className="mt-2 text-3xl font-bold text-slate-800">{formatRupiah(metrics.rataRataHarian)}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">Per tanggal aktif</p>
        </div>
      </div>

      {/* 2. BREAKDOWN LIFESTYLE & WEEKEND */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Esensial vs Lifestyle */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-800">Esensial vs Lifestyle</h2>
          <div className="space-y-5">
            {/* Esensial */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Esensial (Makan, Transport)</span>
                <span className="font-bold text-emerald-600">{ratioAnalysis.persenEsensial}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-emerald-500" style={{ width: `${ratioAnalysis.persenEsensial}%` }}></div>
              </div>
              <p className="mt-1 text-xs text-slate-400">{formatRupiah(ratioAnalysis.esensial)}</p>
            </div>

            {/* Lifestyle */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Lifestyle (Nonton, Jajan, dll)</span>
                <span className="font-bold text-rose-600">{ratioAnalysis.persenLifestyle}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full bg-rose-500" style={{ width: `${ratioAnalysis.persenLifestyle}%` }}></div>
              </div>
              <p className="mt-1 text-xs text-slate-400">{formatRupiah(ratioAnalysis.lifestyle)}</p>
            </div>
          </div>
        </div>

        {/* Weekend vs Weekday */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-800">Perilaku Belanja (Waktu)</h2>
          <div className="space-y-5">
            {/* Weekday */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Hari Kerja (Senin-Jumat)</span>
                <span className="font-bold text-blue-600">{formatRupiah(timeAnalysis.weekdayTotal)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${(timeAnalysis.weekdayTotal / (timeAnalysis.weekdayTotal + timeAnalysis.weekendTotal || 1)) * 100}%` }}>
                </div>
              </div>
            </div>

            {/* Weekend */}
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold text-slate-700">Akhir Pekan (Sabtu-Minggu)</span>
                <span className="font-bold text-orange-500">{formatRupiah(timeAnalysis.weekendTotal)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div 
                  className="h-full bg-orange-500" 
                  style={{ width: `${(timeAnalysis.weekendTotal / (timeAnalysis.weekdayTotal + timeAnalysis.weekendTotal || 1)) * 100}%` }}>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ANALISIS BULANAN */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Blok 1: Grafik Batang Sederhana */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-slate-800">Tren Pengeluaran Per Bulan</h2>
          <div className="space-y-4">
            {analisisBulanan.map((item) => {
              const maxTotal = Math.max(...analisisBulanan.map(b => b.total));
              const percentage = (item.total / maxTotal) * 100;
              return (
                <div key={item.bulan}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">{item.bulan}</span>
                    <span className="text-slate-500">{formatRupiah(item.total)}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>{item.items} Item</span>
                    <span>{item.days} Hari Aktif</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blok 2: Pengeluaran Terbesar Per Bulan */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Pengeluaran Terbesar Per Bulan</h2>
          <div className="space-y-4">
            {analisisBulanan.map((item) => (
              item.maxItem && (
                <div key={item.bulan} className="flex flex-col rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">{item.bulan}</span>
                    <span className="text-sm font-bold text-slate-800">{formatRupiah(Number(item.maxItem.harga))}</span>
                  </div>
                  <p className="font-semibold text-slate-800">{item.maxItem.nama_item}</p>
                  <p className="text-xs text-slate-500">{item.maxItem.aktivitas} • {item.maxItem.tempat}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.maxItem.date}</p>
                </div>
              )
            ))}
          </div>
        </div>
      </div>

      {/* 4. LEADERBOARD TOP 5 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Top 5 Kategori */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Top 5 Kategori</h2>
          <div className="space-y-4">
            {topKategori.map((item, idx) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{idx + 1}. {item.name}</span>
                  <span className="font-semibold text-indigo-600">{formatRupiah(item.total)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-indigo-600" style={{ width: `${(item.total / maxKategori) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Tempat */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Top 5 Tempat Terfavorit</h2>
          <div className="space-y-4">
            {topTempat.map((item, idx) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{idx + 1}. {item.name}</span>
                  <span className="font-semibold text-emerald-600">{formatRupiah(item.total)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-emerald-500" style={{ width: `${(item.total / maxTempat) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Aktivitas */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-800">Top 5 Aktivitas Termahal</h2>
          <div className="space-y-4">
            {topAktivitas.map((item, idx) => (
              <div key={item.name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{idx + 1}. {item.name}</span>
                  <span className="font-semibold text-rose-600">{formatRupiah(item.total)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full bg-rose-500" style={{ width: `${(item.total / maxAktivitas) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}