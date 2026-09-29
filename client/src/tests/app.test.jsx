import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import App from "../App";

vi.mock("../components/Navbar", () => ({
  default: () => <nav>Navbar</nav>,
}));

vi.mock("../components/ProtectedRoute", () => ({
  default: () => <div>Protected Route</div>,
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

describe("Frontend Routes", () => {
  test("renders home route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Secure your PDF documents with password protection.")
    ).toBeInTheDocument();
  });

  test("renders register route", () => {
    render(
      <MemoryRouter initialEntries={["/register"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Register Page")).toBeInTheDocument();
  });

  test("renders login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  test("renders forgot password route", () => {
    render(
      <MemoryRouter initialEntries={["/forgot-password"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Forgot Password Page")).toBeInTheDocument();
  });

  test("renders reset password route", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password/test-token"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Reset Password Page")).toBeInTheDocument();
  });

  test("renders crypto payment route", () => {
    render(
      <MemoryRouter initialEntries={["/payment/crypto"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Crypto Payment Page")).toBeInTheDocument();
  });

  test("renders dashboard route", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("Protected Route")).toBeInTheDocument();
  });
});
