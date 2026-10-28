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
const userSavedMessagesRoutes = require("./modules/user/dashboard/user-saved-messages/user-saved-messages.routes");
const userNotificationsRoutes = require("./modules/user/dashboard/user-notifications/user-notifications.routes");
const adminAuthRoutes =require("./modules/master/auth/admin-auth.routes");
const userManagePropertiesRoutes = require("./modules/user/dashboard/manage-properties/manage-properties.routes");
const userPostPropertyRoutes = require("./modules/user/dashboard/post-property/user-post-property.routes");
const adminPostPropertyRoutes = require("./modules/master/dashboard/post-property/admin-post-property.routes");
const managePropertiesRoutes = require("./modules/master/dashboard/manage-properties/manage-properties.routes");
const propertyReviewRoutes = require("./modules/master/dashboard/property-review/property-review.routes");
const adminNotificationsRoutes = require("./modules/master/dashboard/admin-notifications/admin-notifications.routes");
const { LIMITS } = require("./modules/shared/property/constants/property.constants");
const { scheduleDraftCleanup } = require("./modules/shared/property/services/property-cleanup.service");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use("/api/property", express.json({ limit: LIMITS.maxFormDataBytes }));
app.use("/api/master/post-property", express.json({ limit: LIMITS.maxFormDataBytes }));
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
app.use("/api/user/saved-messages", userSavedMessagesRoutes);
app.use("/api/user/notifications", userNotificationsRoutes);

// Manage-properties first so its static /me is never captured by post-property's /:id
app.use("/api/property", userManagePropertiesRoutes);
app.use("/api/property", userPostPropertyRoutes);

app.use("/api/master/auth", adminAuthRoutes);
app.use("/api/master/post-property", adminPostPropertyRoutes);
app.use("/api/master/manage-properties", managePropertiesRoutes);
app.use("/api/master/property-review", propertyReviewRoutes);
app.use("/api/master/notifications", adminNotificationsRoutes);

const PORT = process.env.PORT;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    scheduleDraftCleanup();
  });
}

startServer();