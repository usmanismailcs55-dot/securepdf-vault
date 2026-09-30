require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
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

require("./utils/sendEmail");

const app = express();


// Debug
app.use((req, res, next) => {
  console.log("REQUEST:", req.method, req.originalUrl);
  console.log(
    "AUTH HEADER:",
    req.headers.authorization || "No Authorization Header"
  );
  next();
});


// Security
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);


// CORS
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
  })
);


// Body
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);


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

    const cleanedCount =
      await cleanupExpiredDocuments();

    console.log(
      `Expired document cleanup completed: ${cleanedCount} document(s) cleaned.`
    );

  } catch (error) {

    console.error(
      "Expired document cleanup failed:",
      error.message
    );

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


// TEMPORARY HTTP SERVER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `HTTP server running on http://localhost:${PORT}`
  );
});