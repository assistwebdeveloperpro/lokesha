const dotenv = require("dotenv");

dotenv.config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db");
const authRoutes = require("./modules/user/auth/auth.routes");
const userCompanyRoutes = require("./modules/user/user-company/user-company.routes");
const userOfficeRoutes = require("./modules/user/user-office/user-office.routes");
const userReraRoutes = require("./modules/user/user-rera/user-rera.routes");
const userProfileRoutes = require("./modules/user/user-profile/user-profile.routes");
const userPasswordRoutes = require("./modules/user/user-password/user-password.routes");
const userSavedMessagesRoutes = require("./modules/user/user-saved-messages/user-saved-messages.routes");

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
app.use("/api/user/company", userCompanyRoutes);
app.use("/api/user/office", userOfficeRoutes);
app.use("/api/user/rera", userReraRoutes);
app.use("/api/user/profile", userProfileRoutes);
app.use("/api/user/password", userPasswordRoutes);
app.use("/api/user/saved-messages", userSavedMessagesRoutes);

const PORT = process.env.PORT;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();