const repository = require("./subscription-reports.repository");
const { addDays, startOfIstDay } = require("../../../shared/subscription/utils/subscription-dates.util");
const { ORDER_STATUSES } = require("../../../shared/subscription/constants/subscription.constants");

const toRange = ({ from, to }) => ({
  from: from ? startOfIstDay(from) : undefined,
  to: to ? addDays(startOfIstDay(to), 1) : undefined,
});

const toAmount = (value) => Number(value ?? 0);

async function getOverview({ from, to } = {}, now = new Date()) {
  const range = toRange({ from, to });

  const [paid, refunded, failedPayments, pendingPayments, activeStandardUsers, exhaustedFreeUsers] = await Promise.all([
    repository.findPaidTotals(range),
    repository.findRefundedTotals(range),
    repository.countOrdersByStatus(ORDER_STATUSES.FAILED, range),
    repository.countOrdersByStatus(ORDER_STATUSES.PENDING, range),
    repository.countActiveStandardUsers(now),
    repository.countExhaustedFreeUsers(),
  ]);

  return {
    range: { from: from ?? null, to: to ?? null },
    revenue: {
      paidOrders: paid.orders,
      baseAmount: toAmount(paid.base_amount),
      gstCollected: toAmount(paid.gst_amount),
      totalAmount: toAmount(paid.total_amount),
      refundedOrders: refunded.orders,
      refundedAmount: toAmount(refunded.total_amount),
    },
    payments: { failed: failedPayments, pending: pendingPayments },
    users: { activeStandard: activeStandardUsers, exhaustedFree: exhaustedFreeUsers },
  };
}

module.exports = { getOverview };
