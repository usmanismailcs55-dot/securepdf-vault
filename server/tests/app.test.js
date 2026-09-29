const request = require("supertest");
const bcrypt = require("bcryptjs");

jest.mock("../models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../models/Document", () => ({
  create: jest.fn(),
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
const { createSession } = require("../services/sessionService");
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
    expect(response.body.message).toBe("Invalid email or password.");
  });

  test("rejects login with an incorrect password", async () => {
    const correctPassword = "Password123!";
    const hashedPassword = await bcrypt.hash(correctPassword, 12);

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
    expect(response.body.message).toBe("Invalid email or password.");
    expect(mockUser.failedLoginAttempts).toBe(1);
    expect(mockUser.save).toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  test("logs in successfully with valid credentials", async () => {
    const password = "Password123!";
    const hashedPassword = await bcrypt.hash(password, 12);

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

    createSession.mockResolvedValue("test-access-token");

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "test@example.com",
        password,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Login successful.");
    expect(response.body.accessToken).toBe("test-access-token");
    expect(response.body.user.email).toBe("test@example.com");
    expect(createSession).toHaveBeenCalledWith(mockUser._id);
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

    Document.create.mockResolvedValue(mockDocument);

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
    expect(response.body.message).toBe("PDF uploaded successfully.");
    expect(response.body.document.id).toBe(mockDocument._id);
    expect(response.body.document.originalFilename).toBe("test.pdf");
    expect(response.body.document.mimeType).toBe("application/pdf");

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
});