function DashboardLayout({ children }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative">
        {/* Subtle dossier-style frame */}
        <div className="pointer-events-none absolute inset-0 rounded-sm border border-black/10 opacity-60" />

        <div className="relative">
          {children}
        </div>
      </div>
    </main>
  );
}

export default DashboardLayout;