import { describe, expect, it, vi } from "vitest";
import type { CheckoutDetails } from "@/services/userSubscription.service";
import { buildCheckoutOptions } from "./useRazorpayCheckout";

const details: CheckoutDetails = {
  keyId: "rzp_test_key",
  razorpayOrderId: "order_rzp_1",
  amount: 472000,
  currency: "INR",
  name: "Lokesha",
  description: "Standard package",
  prefill: { name: "Asha Rao", email: null, contact: "9876543210" },
};

describe("buildCheckoutOptions", () => {
  it("maps the order details the server returned into Razorpay options", () => {
    const handler = vi.fn();
    const onDismiss = vi.fn();

    const options = buildCheckoutOptions(details, { handler, onDismiss });

    expect(options).toMatchObject({
      key: "rzp_test_key",
      order_id: "order_rzp_1",
      amount: 472000,
      currency: "INR",
      name: "Lokesha",
      description: "Standard package",
      theme: { color: "#12192b" },
    });
    expect(options.handler).toBe(handler);
    expect(options.modal.ondismiss).toBe(onDismiss);
  });

  it("sends an empty email when the user has none", () => {
    expect(buildCheckoutOptions(details, { handler: vi.fn(), onDismiss: vi.fn() }).prefill).toEqual({
      name: "Asha Rao",
      email: "",
      contact: "9876543210",
    });
  });
});
