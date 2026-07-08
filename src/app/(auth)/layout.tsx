export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-2">
        <span
          className="flex h-16 w-16 rotate-[-6deg] items-center justify-center rounded-2xl border-2 border-dashed border-amber-400 bg-amber-100 text-3xl shadow-sm"
          aria-hidden="true"
        >
          🏅
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-stone-800">
          Stempelkarte
        </h1>
        <p className="text-sm text-stone-500">
          Deine Ziele, Stempel für Stempel.
        </p>
      </div>
      <div className="w-full max-w-md rounded-3xl border border-amber-100 bg-white p-8 shadow-xl shadow-amber-900/5">
        {children}
      </div>
    </div>
  );
}
