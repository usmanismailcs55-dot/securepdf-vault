import crypto from "crypto";

export function generatePaymentReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const randomPart = crypto.randomBytes(5).toString("hex").toUpperCase();

  return `SPV-${date}-${randomPart}`;
}