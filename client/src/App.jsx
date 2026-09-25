import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Card from "./components/Card";
import DashboardLayout from "./layouts/DashboardLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import PdfUpload from "./components/PdfUpload";

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

        <div className="mt-6">
          <PdfUpload />
        </div>
      </Card>
    </DashboardLayout>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <Routes>
        {/* Public route */}
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Authentication routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />
      </Routes>
    </div>
  );
}

export default App;