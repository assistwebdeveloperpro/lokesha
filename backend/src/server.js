const dotenv = require("dotenv");

dotenv.config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db");
const authRoutes = require("./modules/user/auth/auth.routes");
const userCompanyRoutes = require("./modules/user/dashboard/user-company/user-company.routes");
const userOfficeRoutes = require("./modules/user/dashboard/user-office/user-office.routes");
const userReraRoutes = require("./modules/user/dashboard/user-rera/user-rera.routes");
const userProfileRoutes = require("./modules/user/dashboard/user-profile/user-profile.routes");
const userPasswordRoutes = require("./modules/user/dashboard/user-password/user-password.routes");
const userSavedMessagesRoutes = require("./modules/user/dashboard/user-saved-messages/user-saved-messages.routes");
const adminAuthRoutes = require("./modules/master/auth/admin-auth.routes");
const adminPostPropertyRoutes = require("./modules/master/dashboard/post-property/admin-post-property.routes");

const propertyRoutes = require("./modules/landing/property/property.routes");

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

app.use("/api/master/auth", adminAuthRoutes);
app.use("/api/master/post-property", adminPostPropertyRoutes);

app.use("/api/property",propertyRoutes);

const PORT = process.env.PORT;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();