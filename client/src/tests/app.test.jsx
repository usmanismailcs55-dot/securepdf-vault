
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import App from "../App";

vi.mock("../components/Navbar", () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock("../components/ProtectedRoute", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/PdfUpload", () => ({
  default: () => <div>PDF Upload</div>,
}));

vi.mock("../layouts/DashboardLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../components/ExpirationStatus", () => ({
  default: () => <div>Expiration Status</div>,
}));

vi.mock("../components/Card", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("../services/documentService", () => ({
  getDocuments: vi.fn().mockResolvedValue([]),
  getAccessHistory: vi.fn().mockResolvedValue([]),
  downloadDocument: vi.fn(),
}));

vi.mock("../pages/Register", () => ({
  default: () => <h1>Register Page</h1>,
}));

vi.mock("../pages/Login", () => ({
  default: () => <h1>Login Page</h1>,
}));

vi.mock("../pages/ForgotPassword", () => ({
  default: () => <h1>Forgot Password Page</h1>,
}));

vi.mock("../pages/ResetPassword", () => ({
  default: () => <h1>Reset Password Page</h1>,
}));

vi.mock("../pages/CryptoPayment", () => ({
  default: () => <h1>Crypto Payment Page</h1>,
}));

vi.mock("../pages/SecureLinkAccess", () => ({
  default: () => <h1>Secure Link Access Page</h1>,
}));

afterEach(() => {
  cleanup();
});

function renderRoute(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("Frontend Routes", () => {
  test("renders home route", () => {
    renderRoute("/");

    expect(
      screen.getByText(
        "Secure your PDF documents with password protection."
      )
    ).toBeInTheDocument();
  });

  test("renders register route", () => {
    renderRoute("/register");

    expect(screen.getByText("Register Page")).toBeInTheDocument();
  });

  test("renders login route", () => {
    renderRoute("/login");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders forgot password route", () => {
    renderRoute("/forgot-password");

    expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
  });

  test("renders reset password route", () => {
    renderRoute("/reset-password/test-token");

    expect(screen.getByText("Reset Password Page")).toBeInTheDocument();
  });

  test("renders crypto payment route", () => {
    renderRoute("/crypto-payment");

    expect(screen.getByText("Crypto Payment Page")).toBeInTheDocument();
  });

  test("renders dashboard route", () => {
    renderRoute("/dashboard");

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Upload PDF")).toBeInTheDocument();
    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.getByText("Access History")).toBeInTheDocument();
  });
});
