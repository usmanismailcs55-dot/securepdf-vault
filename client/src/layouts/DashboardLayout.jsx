function DashboardLayout({ children }) {
  return (
    <main className="mx-auto w-full max-w-7xl bg-white px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="relative">
        {/* Dossier-style frame */}
        <div className="pointer-events-none absolute inset-0 rounded-sm border border-black" />

        <div className="relative">
          {children}
        </div>
      </div>
    </main>
  );
}

export default DashboardLayout;
