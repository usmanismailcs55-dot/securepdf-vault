require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const https = require("https");
const fs = require("fs");

const connectDB = require("./db");
const errorHandler = require("./errorHandler");
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");
const emailVerificationRoutes = require("./routes/emailVerificationRoutes");
const documentRoutes = require("./routes/documentRoutes");
const secureLinkRoutes = require("./routes/secureLinkRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

require("./utils/sendEmail");

const app = express();

app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

connectDB();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", emailVerificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/secure-links", secureLinkRoutes);
app.use("/api/payments", paymentRoutes);

app.use(errorHandler);

// Verify payment configuration without exposing the wallet address
console.log(
  "Payment config:",
  process.env.PAYMENT_NETWORK,
  process.env.PAYMENT_ASSET,
  process.env.PAYMENT_RECEIVING_WALLET
    ? "wallet configured"
    : "wallet missing"
);

const PORT = process.env.PORT || 5000;

const httpsOptions = {
  key: fs.readFileSync("./certs/localhost-key.pem"),
  cert: fs.readFileSync("./certs/localhost-cert.pem"),
};

https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`HTTPS server running on https://localhost:${PORT}`);
});




