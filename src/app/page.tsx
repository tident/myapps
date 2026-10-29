export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-3xl font-bold text-slate-800">
          Dashboard App
        </h1>
        <p className="mb-6 text-slate-600">
          Tailwind CSS berfungsi. Halaman ini siap dikembangkan.
        </p>
        <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700">
          Tombol Uji Coba
        </button>
      </div>
    </main>
  );
}