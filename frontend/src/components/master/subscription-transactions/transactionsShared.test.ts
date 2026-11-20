import { describe, expect, it } from "vitest";
import {
  DEFAULT_TRANSACTION_FILTERS,
  canRefund,
  getRangeError,
  isFiltered,
  shortenReference,
  toFilterParams,
  toTransactionsQuery,
} from "./transactionsShared";

describe("toFilterParams and toTransactionsQuery", () => {
  it("sends nothing for the default filters", () => {
    expect(toFilterParams(DEFAULT_TRANSACTION_FILTERS)).toEqual({ search: undefined, status: undefined, from: undefined, to: undefined });
    expect(toTransactionsQuery(DEFAULT_TRANSACTION_FILTERS, 1)).toMatchObject({ page: 1, limit: 10, status: undefined });
  });

  it("sends the chosen filters and the page", () => {
    expect(toTransactionsQuery({ search: "ORD", status: "failed", from: "2026-11-01", to: "2026-11-30" }, 3)).toEqual({
      page: 3,
      limit: 10,
      search: "ORD",
      status: "failed",
      from: "2026-11-01",
      to: "2026-11-30",
    });
  });
});

describe("isFiltered", () => {
  it("is false for the defaults and true when any filter is set", () => {
    expect(isFiltered(DEFAULT_TRANSACTION_FILTERS)).toBe(false);
    expect(isFiltered({ ...DEFAULT_TRANSACTION_FILTERS, search: "a" })).toBe(true);
    expect(isFiltered({ ...DEFAULT_TRANSACTION_FILTERS, status: "paid" })).toBe(true);
    expect(isFiltered({ ...DEFAULT_TRANSACTION_FILTERS, from: "2026-11-01" })).toBe(true);
  });
});

describe("canRefund", () => {
  it("allows a paid order that has a gateway payment", () => {
    expect(canRefund({ status: "paid", razorpayPaymentId: "pay_1" })).toBe(true);
  });

  it.each([
    [{ status: "paid", razorpayPaymentId: null }],
    [{ status: "refunded", razorpayPaymentId: "pay_1" }],
    [{ status: "failed", razorpayPaymentId: "pay_1" }],
    [{ status: "pending", razorpayPaymentId: null }],
  ] as const)("refuses %j", (transaction) => {
    expect(canRefund(transaction)).toBe(false);
  });
});

describe("shortenReference", () => {
  it("keeps short ids, shortens long ones and shows a dash for none", () => {
    expect(shortenReference("pay_short")).toBe("pay_short");
    expect(shortenReference("order_Qx8sample1234567890")).toBe("order_Qx…567890");
    expect(shortenReference(null)).toBe("—");
  });
});

describe("getRangeError", () => {
  it("flags a range that ends before it starts", () => {
    expect(getRangeError({ from: "2026-11-30", to: "2026-11-01" })).toBe("From date cannot be after the to date");
    expect(getRangeError({ from: "2026-11-01", to: "2026-11-30" })).toBe("");
    expect(getRangeError({ from: "", to: "2026-11-01" })).toBe("");
  });
});
