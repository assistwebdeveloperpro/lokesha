const dotenv = require("dotenv");

dotenv.config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db");
const authRoutes = require("./modules/user/auth/auth.routes");
const userReraRoutes = require("./modules/user/dashboard/user-rera/user-rera.routes");
const userProfileRoutes = require("./modules/user/dashboard/user-profile/user-profile.routes");
const userSavedMessagesRoutes = require("./modules/user/dashboard/user-saved-messages/user-saved-messages.routes");
const userNotificationsRoutes = require("./modules/user/dashboard/user-notifications/user-notifications.routes");
const userContactedPropertiesRoutes = require("./modules/user/dashboard/user-contacted-properties/user-contacted-properties.routes");
const userLeadsRoutes = require("./modules/user/dashboard/user-leads/user-leads.routes");
const savedPropertiesRoutes = require("./modules/user/dashboard/saved-properties/saved-properties.routes");
const seenPropertiesRoutes = require("./modules/user/dashboard/seen-properties/seen-properties.routes");
const seenPropertyViewRoutes = require("./modules/user/dashboard/seen-properties/seen-properties.view.routes");
const recentSearchesRoutes = require("./modules/user/dashboard/recent-searches/recent-searches.routes");
const adminAuthRoutes =require("./modules/master/auth/admin-auth.routes");
const userManagePropertiesRoutes = require("./modules/user/dashboard/manage-properties/manage-properties.routes");
const userPostPropertyRoutes = require("./modules/user/dashboard/post-property/user-post-property.routes");
const adminPostPropertyRoutes = require("./modules/master/dashboard/post-property/admin-post-property.routes");
const managePropertiesRoutes = require("./modules/master/dashboard/manage-properties/manage-properties.routes");
const propertyReviewRoutes = require("./modules/master/dashboard/property-review/property-review.routes");
const adminNotificationsRoutes = require("./modules/master/dashboard/admin-notifications/admin-notifications.routes");
const propertySearchRoutes = require("./modules/landing/property-search/property-search.routes");
const propertyRequirementRoutes = require("./modules/landing/property-requirement/property-requirement.routes");
const leadsRoutes = require("./modules/master/dashboard/leads/leads.routes");
const subscriptionPackagesRoutes = require("./modules/master/dashboard/subscription-packages/subscription-packages.routes");
const propertyContactRoutes =require("./modules/landing/property-contact/property-contact.routes");
const userSubscriptionRoutes = require("./modules/user/dashboard/user-subscription/user-subscription.routes");
const subscriptionUsersRoutes = require("./modules/master/dashboard/subscription-users/subscription-users.routes");
const subscriptionTransactionsRoutes = require("./modules/master/dashboard/subscription-transactions/subscription-transactions.routes");
const subscriptionReportsRoutes = require("./modules/master/dashboard/subscription-reports/subscription-reports.routes");
const subscriptionActionsRoutes = require("./modules/master/dashboard/subscription-actions/subscription-actions.routes");
const subscriptionSettingsRoutes = require("./modules/master/dashboard/subscription-settings/subscription-settings.routes");
const subscriptionInvoicesRoutes = require("./modules/master/dashboard/subscription-invoices/subscription-invoices.routes");
const limelightProjectsRoutes = require("./modules/landing/limelight-projects/limelight-projects.routes");
const adminLimelightProjectsRoutes = require("./modules/master/dashboard/limelight-projects/limelight-projects.routes");
const featuredProjectsRoutes = require("./modules/landing/featured-projects/featured-projects.routes");
const adminFeaturedProjectsRoutes = require("./modules/master/dashboard/featured-projects/featured-projects.routes");
const iconicProjectsRoutes = require("./modules/landing/iconic-projects/iconic-projects.routes");
const adminIconicProjectsRoutes = require("./modules/master/dashboard/iconic-projects/iconic-projects.routes");
const popularProjectsRoutes = require("./modules/landing/popular-projects/popular-projects.routes");
const adminPopularProjectsRoutes = require("./modules/master/dashboard/popular-projects/popular-projects.routes");
const razorpayWebhookRoutes =require("./modules/landing/razorpay-webhook/razorpay-webhook.routes");
const { LIMITS } = require("./modules/shared/property/constants/property.constants");
const { scheduleDraftCleanup } = require("./modules/shared/property/services/property-cleanup.service");
const { scheduleSubscriptionJobs } = require("./modules/shared/subscription/services/subscription-jobs.service");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
// Raw body for the signature check, so this must stay before every express.json()
app.use("/api/razorpay/webhook", razorpayWebhookRoutes);
app.use("/api/property", express.json({ limit: LIMITS.maxFormDataBytes }));
app.use("/api/master/post-property", express.json({ limit: LIMITS.maxFormDataBytes }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user/auth", authRoutes);
app.use("/api/user/rera", userReraRoutes);
app.use("/api/user/profile", userProfileRoutes);
app.use("/api/user/saved-messages", userSavedMessagesRoutes);
app.use("/api/user/notifications", userNotificationsRoutes);
app.use("/api/user/subscription", userSubscriptionRoutes);

// Manage-properties first so its static /me is never captured by post-property's /:id
app.use("/api/property", userManagePropertiesRoutes);
app.use("/api/property", userPostPropertyRoutes);

app.use("/api/user/contacted-properties", userContactedPropertiesRoutes);
app.use("/api/user/leads", userLeadsRoutes);
app.use("/api/user/saved-properties", savedPropertiesRoutes);
app.use("/api/user/seen-properties", seenPropertiesRoutes);
app.use("/api/user/recent-searches", recentSearchesRoutes);

app.use("/api/property-search", seenPropertyViewRoutes);
app.use("/api/property-search", propertySearchRoutes);
app.use("/api/property-requirements", propertyRequirementRoutes);
app.use("/api/property-contact", propertyContactRoutes);
app.use("/api/limelight-projects", limelightProjectsRoutes);
app.use("/api/featured-projects", featuredProjectsRoutes);
app.use("/api/iconic-projects", iconicProjectsRoutes);
app.use("/api/popular-projects", popularProjectsRoutes);

app.use("/api/master/auth", adminAuthRoutes);
app.use("/api/master/post-property", adminPostPropertyRoutes);
app.use("/api/master/manage-properties", managePropertiesRoutes);
app.use("/api/master/property-review", propertyReviewRoutes);
app.use("/api/master/notifications", adminNotificationsRoutes);
app.use("/api/master/leads", leadsRoutes);
app.use("/api/master/limelight-projects", adminLimelightProjectsRoutes);
app.use("/api/master/featured-projects", adminFeaturedProjectsRoutes);
app.use("/api/master/iconic-projects", adminIconicProjectsRoutes);
app.use("/api/master/popular-projects", adminPopularProjectsRoutes);
app.use("/api/master/subscription/packages", subscriptionPackagesRoutes);
app.use("/api/master/subscription/users", subscriptionUsersRoutes);
app.use("/api/master/subscription/transactions", subscriptionTransactionsRoutes);
app.use("/api/master/subscription/reports", subscriptionReportsRoutes);
app.use("/api/master/subscription/actions", subscriptionActionsRoutes);
app.use("/api/master/subscription/invoices", subscriptionInvoicesRoutes);
app.use("/api/master/subscription/settings", subscriptionSettingsRoutes);

const PORT = process.env.PORT;

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    scheduleDraftCleanup();
    scheduleSubscriptionJobs();
  });
}

startServer();