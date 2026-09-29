const crypto = require("crypto");

const {
  generateSecureToken,
  hashSecureToken,
} = require("../utils/secureToken");

describe("Secure Token Generation", () => {
  test("generates a secure token and matching SHA-256 hash", () => {
    const result = generateSecureToken();

    expect(result).toHaveProperty("token");
    expect(result).toHaveProperty("tokenHash");

    expect(typeof result.token).toBe("string");
    expect(typeof result.tokenHash).toBe("string");

    expect(result.token).toHaveLength(64);
    expect(result.tokenHash).toHaveLength(64);

    const expectedHash = crypto
      .createHash("sha256")
      .update(result.token)
      .digest("hex");

    expect(result.tokenHash).toBe(expectedHash);
  });

  test("generates a different token each time", () => {
    const first = generateSecureToken();
    const second = generateSecureToken();

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });

  test("hashSecureToken produces the same hash as the generated token hash", () => {
    const { token, tokenHash } = generateSecureToken();

    expect(hashSecureToken(token)).toBe(tokenHash);
  });
});