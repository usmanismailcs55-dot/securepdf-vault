import { render, screen } from "@testing-library/react";

function TestComponent() {
  return <h1>SecurePDF Vault</h1>;
}

test("renders SecurePDF Vault", () => {
  render(<TestComponent />);

  expect(screen.getByText("SecurePDF Vault")).toBeInTheDocument();
});