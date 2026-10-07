const path = require("path");
const fs = require("fs");
const https = require("https");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./db");
const errorHandler = require("./errorHandler");

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const emailVerificationRoutes = require("./routes/emailVerificationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const secureLinkRoutes = require("./routes/secureLinkRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const cleanupExpiredDocuments = require("./utils/cleanupExpiredDocuments");
const logToAxiom = require("./utils/axiomLogger");

require("./utils/sendEmail");

const app = express();

app.set("trust proxy", 1);

// Debug
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);

  console.log(
    "AUTH HEADER:",
    req.headers.authorization || "No Authorization Header"
  );

  res.on("finish", () => {
    void logToAxiom({
      type: "http_request",
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
    });
  });

  next();
});

// Security
app.use(helmet());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://404watch.watch",
  "https://securepdf-vault-production.up.railway.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// Body
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", emailVerificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/secure-links", secureLinkRoutes);
app.use("/api/payments", paymentRoutes);

// Error handler
app.use(errorHandler);

// Database
connectDB().then(async () => {
  try {
    const cleanedCount = await cleanupExpiredDocuments();

    console.log(
      `Expired document cleanup completed: ${cleanedCount} document(s) cleaned.`
    );

    void logToAxiom({
      type: "startup_cleanup",
      status: "completed",
      cleanedDocuments: cleanedCount,
    });
  } catch (error) {
    console.error(
      "Expired document cleanup failed:",
      error.message
    );

    void logToAxiom({
      type: "startup_cleanup",
      status: "failed",
      error: error.message,
    });
  }
});

// Payment check
console.log(
  "Payment config:",
  process.env.PAYMENT_NETWORK,
  process.env.PAYMENT_ASSET,
  process.env.PAYMENT_RECEIVING_WALLET
    ? "wallet configured"
    : "wallet missing"
);

void logToAxiom({
  type: "application_startup",
  environment: process.env.NODE_ENV || "development",
});

// Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HTTP server running on port ${PORT}`);
  });
} else {
  const certPath = path.join(__dirname, "certs");

  const httpsOptions = {
    key: fs.readFileSync(
      path.join(certPath, "localhost-key.pem")
    ),
    cert: fs.readFileSync(
      path.join(certPath, "localhost-cert.pem")
    ),
  };

  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(
      `HTTPS server running on https://localhost:${PORT}`
    );
  });
}