
require("dotenv").config();

const express = require("express");
const connectDB = require("./db");
const errorHandler = require("./errorHandler");
const testRoutes = require("./routes/testRoutes");

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/test", testRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

