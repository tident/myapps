export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* HEADER SAMBUTAN */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Selamat Datang👋</h1>
        <p className="text-indigo-100 max-w-2xl">
          Ini adalah pusat kendali Piw Project. Di sini Anda dapat mengelola data, memantau analitik, dan membuat invoice dengan mudah.
        </p>
      </div>

      {/* WHAT'S NEW SECTION */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
          <span className="flex h-3 w-3 rounded-full bg-green-500 mr-3 animate-pulse"></span>
          What's New (Version-13.50)
        </h2>
        
        {/* INFO ALERT (TAMBAHAN BARU) */}
        <div className="mb-6 flex items-start rounded-xl border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
          <div className="mr-3 flex-shrink-0 pt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5 text-indigo-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Update Fitur</h3>
            <p className="mt-1 text-sm text-indigo-700">
              {/* ANDA BISA MENGUBAH TEKS INI SESUAI KEBUTUHAN */}
              Fitur baru telah ditambahkan! Silakan cek menu Rasarasabyrania untuk melihat pembaruan pada pembuatan Invoice PDF dan pengaturan profit. Pastikan Anda sudah melakukan refresh halaman.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Kartu 1: Rasarasabyrania */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">Modul Rasarasabyrania</h3>
            <p className="text-sm text-slate-500 mb-4">
              Fitur lengkap untuk mengelola Data Item, Setting Invoice, dan pembuatan tagihan dengan export PDF otomatis.
            </p>
            <span className="inline-flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
              Cek fitur
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

          {/* Kartu 2: Dashboard Analytics */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">Analitik Data Cerdas</h3>
            <p className="text-sm text-slate-500 mb-4">
              Visualisasi data interaktif dengan filter bulan, tren pengeluaran, rasio lifestyle vs esensial, dan analisis Weekend/Weekday.
            </p>
            <span className="inline-flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
              Lihat Analitik
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

          {/* Kartu 3: Data Center */}
          <div className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-slate-800">Data Center Fleksibel</h3>
            <p className="text-sm text-slate-500 mb-4">
              Tarik data dari URL JSON eksternal, simpan ke database sementara, dan kelola dengan fitur pencarian serta filter canggih.
            </p>
            <span className="inline-flex items-center text-sm font-semibold text-amber-600 group-hover:text-amber-700">
              Buka Data Center
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </div>

        </div>
      </div>
      
      {/* FOOTER INFO */}
      <div className="mt-8 border-t border-slate-200 pt-6 text-center text-sm text-slate-400">
        Piw Project v13.0.0 &copy; 2026. Dibuat dengan menggunakan Next.js & Google Apps Script.
      </div>

    </div>
  );
}