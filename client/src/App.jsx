
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import DashboardLayout from "./layouts/DashboardLayout";

function Home() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold">
          SecurePDF Vault
        </h1>

        <p className="mt-2 text-slate-600">
          Secure your PDF documents with password protection.
        </p>
      </Card>
    </main>
  );
}

function Dashboard() {
  return (
    <DashboardLayout>
      <Card>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-600">
          Your documents will appear here.
        </p>
      </Card>
    </DashboardLayout>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;

