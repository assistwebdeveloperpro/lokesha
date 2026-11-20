const repository = require("./subscription-users.repository");
const overview = require("../../../user/dashboard/user-subscription/user-subscription-overview.service");
const { AppError } = require("../../../shared/property/utils/property.errors");

const NOT_FOUND = 404;

function toUserRow(row) {
  return {
    id: row.id,
    name: row.name,
    mobile: row.mobile_number,
    email: row.email,
    packages: row.package_codes,
    creditsBought: row.credits_bought,
    creditsUsed: row.credits_used,
    startsAt: row.first_start,
    endsAt: row.last_end,
    amountPaid: Number(row.amount_paid ?? 0),
    paymentStatus: row.payment_status ?? null,
    hasActiveSubscription: row.has_active,
  };
}

async function listUsers(filters) {
  const [rows, total] = await Promise.all([repository.findUsers(filters), repository.countUsers(filters)]);
  return { items: rows.map(toUserRow), page: filters.page, limit: filters.limit, total };
}

async function loadUser(userId) {
  const user = await repository.findUser(userId);
  if (!user) throw new AppError("User not found", NOT_FOUND);

  return user;
}

// Same numbers the user sees on their own page
async function getUserDetail(userId) {
  const user = await loadUser(userId);

  return {
    user: { id: user.id, name: user.name, mobile: user.mobile_number, email: user.email, role: user.role, joinedAt: user.created_at },
    ...(await overview.getOverview(userId)),
  };
}

// The lists check the user first, so an unknown id answers 404 instead of an empty page
const listFor = (load) => async (userId, paging) => {
  await loadUser(userId);
  return load(userId, paging);
};

const listUserHistory = listFor((userId, paging) => overview.listHistory(userId, paging));
const listUserPayments = listFor((userId, paging) => overview.listPayments(userId, paging));
const listUserLedger = listFor((userId, paging) => overview.listLedger(userId, paging));

module.exports = { listUsers, getUserDetail, listUserHistory, listUserPayments, listUserLedger };
