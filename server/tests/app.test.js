const request = require("supertest");
const bcrypt = require("bcryptjs");
const fs = require("fs");

global.fetch = jest.fn();

jest.mock("pdf-lib", () => ({
  PDFDocument: {
    load: jest.fn(),
  },
}));

jest.mock("../utils/protectPdf", () => jest.fn());

jest.mock("../utils/generatePdfPassword", () =>
  jest.fn(() => "TestPassword123!")
);

jest.mock("../utils/verifyPdfProtection", () =>
  jest.fn().mockResolvedValue(true)
);

jest.mock("../utils/fileEncryption", () => ({
  encryptBuffer: jest.fn((buffer) => buffer),
  decryptFile: jest.fn(() =>
    Buffer.from("decrypted-pdf-content")
  ),
}));

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../models/Document", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../models/SecureLink", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/Payment", () => ({
  create: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../models/PaymentVerificationLog", () => ({
  create: jest.fn(),
}));

jest.mock("../models/Subscription", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
}));

jest.mock("../services/sessionService", () => ({
  createSession: jest.fn(),
}));

jest.mock("../utils/sendEmail", () => ({
  sendMail: jest.fn(),
}));

jest.mock("../middleware/authMiddleware", () => {
  return (req, res, next) => {
    req.user = {
      userId: "507f1f77bcf86cd799439011",
    };

    next();
  };
});

jest.mock("../middleware/subscriptionMiddleware", () => {
  return (req, res, next) => {
    next();
  };
});

const User = require("../models/User");
const Document = require("../models/Document");
const SecureLink = require("../models/SecureLink");
const Payment = require("../models/Payment");
const PaymentVerificationLog = require(
  "../models/PaymentVerificationLog"
);
const Subscription = require("../models/Subscription");

const { createSession } = require("../services/sessionService");

const protectPdf = require("../utils/protectPdf");
const generatePdfPassword = require(
  "../utils/generatePdfPassword"
);
const verifyPdfProtection = require(
  "../utils/verifyPdfProtection"
);

const verifyPdfProtectionActual = jest.requireActual(
  "../utils/verifyPdfProtection"
);

const { decryptFile } = require("../utils/fileEncryption");
const { PDFDocument } = require("pdf-lib");

const app = require("../app");

describe("Authentication", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects login when email and password are missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Invalid input.");
  });

  test("rejects login with an unknown email", async () => {
    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(null),
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "unknown@example.com",
        password: "Password123!",
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      "Invalid email or password."
    );
  });

  test("rejects login with an incorrect password", async () => {
    const correctPassword = "Password123!";

    const hashedPassword = await bcrypt.hash(
      correctPassword,
      12
    );

    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      accountStatus: "active",
      failedLoginAttempts: 0,
      lockUntil: null,
      sessionVersion: 0,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password: "WrongPassword123!",
      });

    expect(response.statusCode).toBe(401);

    expect(response.body.message).toBe(
      "Invalid email or password."
    );

    expect(mockUser.failedLoginAttempts).toBe(1);

    expect(mockUser.save).toHaveBeenCalled();

    expect(createSession).not.toHaveBeenCalled();
  });

  test("logs in successfully with valid credentials", async () => {
    const password = "Password123!";

    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    const mockUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      accountStatus: "active",
      failedLoginAttempts: 0,
      lockUntil: null,
      sessionVersion: 0,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    });

    createSession.mockResolvedValue(
      "test-access-token"
    );

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password,
      });

    expect(response.statusCode).toBe(200);

    expect(response.body.message).toBe(
      "Login successful."
    );

    expect(response.body.accessToken).toBe(
      "test-access-token"
    );

    expect(response.body.user.email).toBe(
      "test@example.com"
    );

    expect(createSession).toHaveBeenCalledWith(
      mockUser._id
    );
  });

  test("registers a new user successfully", async () => {
    User.findOne.mockResolvedValue(null);

    const mockUser = {
      _id: "507f1f77bcf86cd799439012",
      name: "New Test User",
      email: "newuser@example.com",
      password: "Password123!",
      isEmailVerified: false,
    };

    User.create.mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "New Test User",
        email: "newuser@example.com",
        password: "Password123!",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.message).toBe(
      "Registration successful. Please check your email to verify your account."
    );

    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Test User",
        email: "newuser@example.com",
        password: "Password123!",
        isEmailVerified: false,
      })
    );
  });
});

describe("PDF Upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uploads a valid PDF successfully", async () => {
    const mockDocument = {
      _id: "507f1f77bcf86cd799439099",
      originalFilename: "test.pdf",
      storedFilename: "stored-test.pdf",
      fileSize: 100,
      mimeType: "application/pdf",
      protectionStatus: "pending",
    };

    Document.create.mockResolvedValue(
      mockDocument
    );

    const pdfBuffer = Buffer.from(
      "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"
    );

    const response = await request(app)
      .post("/api/documents/upload")
      .attach("pdf", pdfBuffer, {
        filename: "test.pdf",
        contentType: "application/pdf",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "PDF uploaded successfully."
    );

    expect(response.body.document.id).toBe(
      mockDocument._id
    );

    expect(
      response.body.document.originalFilename
    ).toBe("test.pdf");

    expect(
      response.body.document.mimeType
    ).toBe("application/pdf");

    expect(Document.create).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: "507f1f77bcf86cd799439011",
        originalFilename: "test.pdf",
        mimeType: "application/pdf",
        protectionStatus: "pending",
        isPasswordProtected: false,
      })
    );
  });

  test("rejects a file with an invalid PDF signature", async () => {
    const fakePdfBuffer = Buffer.from(
      "This is not actually a PDF file."
    );

    const response = await request(app)
      .post("/api/documents/upload")
      .attach("pdf", fakePdfBuffer, {
        filename: "fake.pdf",
        contentType: "application/pdf",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid PDF file."
    );

    expect(Document.create).not.toHaveBeenCalled();
  });
});

describe("PDF Protection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("protects a pending PDF successfully", async () => {
    const mockDocument = {
      _id: "507f1f77bcf86cd799439099",
      owner: "507f1f77bcf86cd799439011",
      originalFilename: "test.pdf",
      originalPath: "C:\\test\\test.pdf",
      protectionStatus: "pending",
      processingError: null,
      protectedPath: null,
      isPasswordProtected: false,
      save: jest.fn().mockResolvedValue(true),
    };

    Document.findOne.mockResolvedValue(
      mockDocument
    );

    jest
      .spyOn(fs, "mkdirSync")
      .mockImplementation(() => {});

    jest
      .spyOn(fs, "existsSync")
      .mockReturnValue(false);

    protectPdf.mockResolvedValue(undefined);

    generatePdfPassword.mockReturnValue(
      "TestPassword123!"
    );

    decryptFile.mockReturnValue(
      Buffer.from("decrypted-pdf-content")
    );

    verifyPdfProtection.mockResolvedValue(
      true
    );

    const response = await request(app)
      .post(
        "/api/documents/507f1f77bcf86cd799439099/protect"
      )
      .send({});

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "PDF protected successfully"
    );

    expect(response.body.documentId).toBe(
      mockDocument._id
    );

    expect(Document.findOne).toHaveBeenCalledWith({
      _id: "507f1f77bcf86cd799439099",
      owner: "507f1f77bcf86cd799439011",
      isDeleted: false,
    });

    expect(
      mockDocument.protectionStatus
    ).toBe("protected");

    expect(
      mockDocument.isPasswordProtected
    ).toBe(true);

    expect(
      mockDocument.processingError
    ).toBe(null);

    expect(
      mockDocument.protectedPath
    ).toEqual(
      expect.stringContaining("protected-")
    );

    expect(decryptFile).toHaveBeenCalledWith(
      mockDocument.originalPath
    );

    expect(protectPdf).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.stringContaining("protected-"),
      "TestPassword123!"
    );

    expect(
      verifyPdfProtection
    ).toHaveBeenCalledWith(
      expect.stringContaining("protected-")
    );

    expect(
      mockDocument.save
    ).toHaveBeenCalled();
  });
});

describe("PDF Password Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns false when a PDF can be opened without a password", async () => {
    const pdfBuffer = Buffer.from(
      "unprotected-pdf"
    );

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(pdfBuffer);

    PDFDocument.load.mockResolvedValue({});

    const result =
      await verifyPdfProtectionActual(
        "C:\\test\\unprotected.pdf"
      );

    expect(result).toBe(false);

    expect(
      fs.readFileSync
    ).toHaveBeenCalledWith(
      "C:\\test\\unprotected.pdf"
    );

    expect(
      PDFDocument.load
    ).toHaveBeenCalledWith(
      pdfBuffer
    );
  });

  test("returns true when a PDF cannot be opened without a password", async () => {
    const pdfBuffer = Buffer.from(
      "protected-pdf"
    );

    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(pdfBuffer);

    PDFDocument.load.mockRejectedValue(
      new Error("Password required")
    );

    const result =
      await verifyPdfProtectionActual(
        "C:\\test\\protected.pdf"
      );

    expect(result).toBe(true);

    expect(
      fs.readFileSync
    ).toHaveBeenCalledWith(
      "C:\\test\\protected.pdf"
    );

    expect(
      PDFDocument.load
    ).toHaveBeenCalledWith(
      pdfBuffer
    );
  });
});

describe("Secure Link Status", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns expired status for an expired secure link", async () => {
    const documentId =
      "507f1f77bcf86cd799439099";

    const expiredDate = new Date(
      Date.now() - 60 * 1000
    );

    const mockDocument = {
      _id: documentId,
      owner: "507f1f77bcf86cd799439011",
      isDeleted: false,
    };

    const mockSecureLink = {
      document: documentId,
      owner: "507f1f77bcf86cd799439011",
      expiresAt: expiredDate,
      isActive: true,
      revokedAt: null,
      lastAccessedAt: null,
      accessCount: 3,
    };

    Document.findOne.mockResolvedValue(
      mockDocument
    );

    SecureLink.findOne.mockResolvedValue(
      mockSecureLink
    );

    const response = await request(app).get(
      `/api/secure-links/${documentId}/status`
    );

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.status).toBe(
      "expired"
    );

    expect(response.body.expiresAt).toBe(
      expiredDate.toISOString()
    );

    expect(response.body.lastAccessedAt).toBe(
      null
    );

    expect(response.body.accessCount).toBe(3);

    expect(Document.findOne).toHaveBeenCalledWith({
      _id: documentId,
      owner: "507f1f77bcf86cd799439011",
      isDeleted: false,
    });

    expect(
      SecureLink.findOne
    ).toHaveBeenCalledWith({
      document: documentId,
      owner: "507f1f77bcf86cd799439011",
    });
  });
});

describe("Secure Link Unauthorized Access", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rejects access when the document does not belong to the authenticated user", async () => {
    const documentId =
      "507f1f77bcf86cd799439099";

    Document.findOne.mockResolvedValue(null);

    const response = await request(app).get(
      `/api/secure-links/${documentId}/status`
    );

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Document not found"
    );

    expect(Document.findOne).toHaveBeenCalledWith({
      _id: documentId,
      owner: "507f1f77bcf86cd799439011",
      isDeleted: false,
    });

    expect(
      SecureLink.findOne
    ).not.toHaveBeenCalled();
  });
});

describe("Document Deletion", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("soft deletes a document successfully", async () => {
    const documentId =
      "507f1f77bcf86cd799439099";

    const mockDocument = {
      _id: documentId,
      owner: "507f1f77bcf86cd799439011",
      isDeleted: false,
      deletedAt: null,
      save: jest.fn().mockResolvedValue(true),
    };

    Document.findOne.mockResolvedValue(
      mockDocument
    );

    const response = await request(app).delete(
      `/api/documents/${documentId}`
    );

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(true);

    expect(response.body.message).toBe(
      "Document deleted successfully"
    );

    expect(Document.findOne).toHaveBeenCalledWith({
      _id: documentId,
      owner: "507f1f77bcf86cd799439011",
      isDeleted: false,
    });

    expect(mockDocument.isDeleted).toBe(true);

    expect(mockDocument.deletedAt).toBeInstanceOf(
      Date
    );

    expect(
      mockDocument.save
    ).toHaveBeenCalled();
  });
});

describe("Trust Wallet Payment Verification", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("verifies a valid Trust Wallet USDT transaction successfully", async () => {
    const paymentReference =
      "SPV-test-payment";

    const transactionHash =
      "a".repeat(64);

    const recipientHex =
      "410000000000000000000000000000000000000001";

    /*
     * Base58Check address corresponding to:
     *
     * 410000000000000000000000000000000000000001
     */
    const receivingWallet =
      "T9yD14Nj9j7xAB4dbGeiX9h8unkKLxmGkn";

    const recipientBody =
      recipientHex.slice(2);

    const recipientEncoded =
      recipientBody.padStart(
        64,
        "0"
      );

    const amountRaw =
      BigInt(500 * 1_000_000);

    const amountEncoded =
      amountRaw
        .toString(16)
        .padStart(
          64,
          "0"
        );

    const transferData =
      `a9059cbb${recipientEncoded}${amountEncoded}`;

    const mockTransaction = {
      txID: transactionHash,

      raw_data: {
        contract: [
          {
            type: "TriggerSmartContract",

            parameter: {
              value: {
                contract_address:
                  "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",

                data: transferData,
              },
            },
          },
        ],
      },
    };

    const mockTransactionInfo = {
      blockNumber: 123456,

      receipt: {
        result: "SUCCESS",
      },

      log: [],
    };

    const mockPayment = {
      _id:
        "507f1f77bcf86cd799439013",

      user:
        "507f1f77bcf86cd799439011",

      paymentReference,

      amount: 500,

      currency: "USD",

      asset: "USDT",

      receivingWallet,

      status: "pending",

      transactionHash: null,

      paidAt: null,

      failureReason: null,

      save: jest
        .fn()
        .mockResolvedValue(true),
    };

    Payment.findOne
      .mockResolvedValueOnce(
        mockPayment
      )
      .mockResolvedValueOnce(
        null
      );

    User.findById.mockReturnValue({
      select: jest
        .fn()
        .mockResolvedValue(null),
    });

    PaymentVerificationLog.create.mockResolvedValue(
      {}
    );

    global.fetch
      .mockResolvedValueOnce({
        ok: true,

        json: async () =>
          mockTransaction,
      })
      .mockResolvedValueOnce({
        ok: true,

        json: async () =>
          mockTransactionInfo,
      });

    const response = await request(app)
      .post(
        "/api/payments/submit-transaction"
      )
      .send({
        paymentReference,
        transactionHash,
      });

    console.log(
      "PAYMENT TEST RESPONSE:",
      response.body
    );

    expect(response.statusCode).toBe(200);

    expect(response.body.success).toBe(
      true
    );

    expect(response.body.status).toBe(
      "paid"
    );

    expect(
      response.body.paymentReference
    ).toBe(
      paymentReference
    );

    expect(
      response.body.transactionHash
    ).toBe(
      transactionHash
    );

    expect(
      response.body.receivedAmount
    ).toBe(500);

    expect(
      response.body.requiredAmount
    ).toBe(500);

    expect(
      response.body.overpaymentAmount
    ).toBe(0);

    expect(
      mockPayment.status
    ).toBe("paid");

    expect(
      mockPayment.transactionHash
    ).toBe(
      transactionHash
    );

    expect(
      mockPayment.paidAt
    ).toBeInstanceOf(Date);

    expect(
      mockPayment.failureReason
    ).toBe(null);

    expect(
      mockPayment.save
    ).toHaveBeenCalled();

    expect(
      global.fetch
    ).toHaveBeenCalledTimes(2);

    expect(
      PaymentVerificationLog.create
    ).toHaveBeenCalled();
  });

  test("rejects an invalid transaction hash format", async () => {
    const response = await request(app)
      .post("/api/payments/submit-transaction")
      .send({
        paymentReference: "SPV-test-payment",
        transactionHash: "invalid-hash",
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(false);

    expect(response.body.message).toBe(
      "Invalid transaction hash."
    );

    expect(Payment.findOne).not.toHaveBeenCalled();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("rejects a transaction that is not yet confirmed on the blockchain", async () => {
    const paymentReference =
      "SPV-test-payment";

    const transactionHash =
      "b".repeat(64);

    const mockPayment = {
      _id:
        "507f1f77bcf86cd799439013",

      user:
        "507f1f77bcf86cd799439011",

      paymentReference,

      amount: 500,

      currency: "USD",

      asset: "USDT",

      status: "pending",

      transactionHash: null,

      save: jest
        .fn()
        .mockResolvedValue(true),
    };

    Payment.findOne.mockResolvedValue(
      mockPayment
    );

    PaymentVerificationLog.create.mockResolvedValue(
      {}
    );

    global.fetch
      .mockResolvedValueOnce({
        ok: true,

        json: async () => ({
          txID: transactionHash,

          raw_data: {
            contract: [
              {
                type: "TriggerSmartContract",

                parameter: {
                  value: {
                    contract_address:
                      "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",

                    data:
                      "a9059cbb" +
                      "0000000000000000000000000000000000000000000000000000000000000001" +
                      "0000000000000000000000000000000000000000000000000000000000000000",
                  },
                },
              },
            ],
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,

        json: async () => ({
          blockNumber: null,
        }),
      });

    const response = await request(app)
      .post(
        "/api/payments/submit-transaction"
      )
      .send({
        paymentReference,
        transactionHash,
      });

    expect(response.statusCode).toBe(202);

    expect(response.body.success).toBe(
      false
    );

    expect(response.body.status).toBe(
      "pending"
    );

    expect(
      mockPayment.status
    ).toBe("pending");

    expect(
      mockPayment.save
    ).not.toHaveBeenCalled();

    expect(
      global.fetch
    ).toHaveBeenCalledTimes(2);
  });

  test("rejects an underpayment when received amount is below required amount", async () => {
    const paymentReference =
      "SPV-underpayment-test";

    const transactionHash =
      "c".repeat(64);

    const recipientHex =
      "410000000000000000000000000000000000000001";

    const receivingWallet =
      "T9yD14Nj9j7xAB4dbGeiX9h8unkKLxmGkn";

    const recipientBody =
      recipientHex.slice(2);

    const recipientEncoded =
      recipientBody.padStart(
        64,
        "0"
      );

    const amountRaw =
      BigInt(499 * 1_000_000);

    const amountEncoded =
      amountRaw
        .toString(16)
        .padStart(
          64,
          "0"
        );

    const transferData =
      `a9059cbb${recipientEncoded}${amountEncoded}`;

    const mockTransaction = {
      txID: transactionHash,

      raw_data: {
        contract: [
          {
            type: "TriggerSmartContract",

            parameter: {
              value: {
                contract_address:
                  "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",

                data: transferData,
              },
            },
          },
        ],
      },
    };

    const mockTransactionInfo = {
      blockNumber: 123457,

      receipt: {
        result: "SUCCESS",
      },

      log: [],
    };

    const mockPayment = {
      _id:
        "507f1f77bcf86cd799439014",

      user:
        "507f1f77bcf86cd799439011",

      paymentReference,

      amount: 500,

      currency: "USD",

      asset: "USDT",

      receivingWallet,

      status: "pending",

      transactionHash: null,

      paidAt: null,

      failureReason: null,

      save: jest
        .fn()
        .mockResolvedValue(true),
    };

    Payment.findOne.mockResolvedValue(
      mockPayment
    );

    PaymentVerificationLog.create.mockResolvedValue(
      {}
    );

    global.fetch
      .mockResolvedValueOnce({
        ok: true,

        json: async () =>
          mockTransaction,
      })
      .mockResolvedValueOnce({
        ok: true,

        json: async () =>
          mockTransactionInfo,
      });

    const response = await request(app)
      .post(
        "/api/payments/submit-transaction"
      )
      .send({
        paymentReference,
        transactionHash,
      });

    expect(response.statusCode).toBe(400);

    expect(response.body.success).toBe(
      false
    );

    expect(response.body.status).toBe(
      "underpaid"
    );

    expect(response.body.receivedAmount).toBe(
      499
    );

    expect(response.body.requiredAmount).toBe(
      500
    );

    expect(mockPayment.status).toBe(
      "failed"
    );

    expect(mockPayment.failureReason).toBe(
      "Underpayment received."
    );

    expect(mockPayment.save).toHaveBeenCalled();

    expect(
      PaymentVerificationLog.create
    ).toHaveBeenCalled();
  });

  test("rejects a transaction sent to the wrong receiving wallet", async () => {
    const paymentReference =
      "SPV-wallet-mismatch-test";

    const transactionHash =
      "d".repeat(64);

    const configuredWallet =
      "T9yD14Nj9j7xAB4dbGeiX9h8unkKLxmGkn";

    const wrongRecipientHex =
      "410000000000000000000000000000000000000002";

    const recipientBody =
      wrongRecipientHex.slice(2);

    const recipientEncoded =
      recipientBody.padStart(
        64,
        "0"
      );

    const amountRaw =
      BigInt(500 * 1_000_000);

    const amountEncoded =
      amountRaw
        .toString(16)
        .padStart(
          64,
          "0"
        );

    const transferData =
      `a9059cbb${recipientEncoded}${amountEncoded}`;

    const mockTransaction = {
      txID: transactionHash,

      raw_data: {
        contract: [
          {
            type: "TriggerSmartContract",

            parameter: {
              value: {
                contract_address:
                  "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",

                data: transferData,
              },
            },
          },
        ],
      },
    };

    const mockTransactionInfo = {
      blockNumber: 123458,

      receipt: {
        result: "SUCCESS",
      },

      log: [],
    };

    const mockPayment = {
      _id:
        "507f1f77bcf86cd799439015",

      user:
        "507f1f77bcf86cd799439011",

      paymentReference,

      amount: 500,

      currency: "USD",

      asset: "USDT",

      receivingWallet:
        configuredWallet,

      status: "pending",

      transactionHash: null,

      paidAt: null,

      failureReason: null,

      save: jest
        .fn()
        .mockResolvedValue(true),
    };

    Payment.findOne.mockResolvedValue(
      mockPayment
    );

    PaymentVerificationLog.create.mockResolvedValue(
      {}
    );

    global.fetch
      .mockResolvedValueOnce({
        ok: true,

        json: async () =>
          mockTransaction,
      })
      .mockResolvedValueOnce({
        ok: true,

        json: async () =>
          mockTransactionInfo,
      });

    const response = await request(app)
      .post(
        "/api/payments/submit-transaction"
      )
      .send({
        paymentReference,
        transactionHash,
      });

    expect(response.statusCode).toBe(
      400
    );

    expect(response.body.success).toBe(
      false
    );

    expect(mockPayment.status).toBe(
      "failed"
    );

    expect(
      mockPayment.failureReason
    ).toContain(
      "Receiving wallet mismatch"
    );

    expect(
      mockPayment.save
    ).toHaveBeenCalled();

    expect(
      PaymentVerificationLog.create
    ).toHaveBeenCalled();

    expect(
      global.fetch
    ).toHaveBeenCalledTimes(2);
  });
});
