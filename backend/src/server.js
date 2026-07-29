const dotenv = require("dotenv");

dotenv.config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db");
const authRoutes = require("./modules/user/auth/auth.routes");
const userBusinessRoutes = require("./modules/user/user-business/user-business.routes");
const userOfficeRoutes = require("./modules/user/user-office/user-office.routes");
const userProfileRoutes = require("./modules/user/user-profile/user-profile.routes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user/auth", authRoutes);
app.use("/api/user/business", userBusinessRoutes);
app.use("/api/user/office", userOfficeRoutes);
app.use("/api/user/profile", userProfileRoutes);

const PORT = process.env.PORT;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();