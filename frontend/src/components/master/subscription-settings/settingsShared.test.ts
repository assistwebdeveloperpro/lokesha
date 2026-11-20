import { describe, expect, it } from "vitest";
import type { InvoiceSettings } from "@/services/adminSubscription.service";
import {
  buildNumberExample,
  buildSettingsUpdate,
  getMissingDetails,
  normalizeForm,
  toFormState,
  validateSettingsForm,
} from "./settingsShared";

const settings: InvoiceSettings = {
  legalName: "Lokesha Pvt Ltd",
  address: "Surat, Gujarat",
  gstin: "24AAACL0000A1Z5",
  sacCode: "998314",
  invoicePrefix: "LOK",
  creditNotePrefix: "LOK-CN",
  updatedAt: "2026-11-20T00:00:00.000Z",
  isInvoiceReady: true,
};

describe("validateSettingsForm", () => {
  it("accepts the saved settings and allows an empty GSTIN and SAC code", () => {
    expect(validateSettingsForm(toFormState(settings))).toEqual({});
    expect(validateSettingsForm({ ...toFormState(settings), gstin: "", sacCode: "" })).toEqual({});
  });

  it("accepts a lower case GSTIN and prefix, which are stored in upper case", () => {
    expect(validateSettingsForm({ ...toFormState(settings), gstin: " 24aaacl0000a1z5 ", invoicePrefix: "lok" })).toEqual({});
  });

  it.each([
    [{ gstin: "12345" }, "gstin"],
    [{ sacCode: "99" }, "sacCode"],
    [{ sacCode: "99831A" }, "sacCode"],
    [{ invoicePrefix: "" }, "invoicePrefix"],
    [{ invoicePrefix: "LOK/2026" }, "invoicePrefix"],
    [{ creditNotePrefix: "ABCDEFGHIJKLM" }, "creditNotePrefix"],
    [{ legalName: "x".repeat(161) }, "legalName"],
    [{ address: "x".repeat(501) }, "address"],
  ])("flags %j on %s only", (change, field) => {
    expect(Object.keys(validateSettingsForm({ ...toFormState(settings), ...change }))).toEqual([field]);
  });
});

describe("buildSettingsUpdate", () => {
  it("sends nothing when nothing changed, even if only spacing or case differs", () => {
    expect(buildSettingsUpdate(settings, toFormState(settings))).toEqual({});
    expect(buildSettingsUpdate(settings, { ...toFormState(settings), legalName: "  Lokesha Pvt Ltd ", gstin: "24aaacl0000a1z5" })).toEqual({});
  });

  it("sends only the changed fields in their stored form", () => {
    expect(buildSettingsUpdate(settings, { ...toFormState(settings), gstin: "24aaacc1206d1zm", invoicePrefix: " inv " })).toEqual({
      gstin: "24AAACC1206D1ZM",
      invoicePrefix: "INV",
    });
  });

  it("can clear a GSTIN", () => {
    expect(buildSettingsUpdate(settings, { ...toFormState(settings), gstin: "" })).toEqual({ gstin: "" });
  });
});

describe("getMissingDetails", () => {
  it("lists the invoice details that are still empty", () => {
    expect(getMissingDetails(toFormState(settings))).toEqual([]);
    expect(getMissingDetails({ ...toFormState(settings), legalName: " ", gstin: "" })).toEqual(["Legal name", "GSTIN"]);
  });
});

describe("normalizeForm and buildNumberExample", () => {
  it("trims text and upper cases the GSTIN and prefixes", () => {
    expect(normalizeForm({ ...toFormState(settings), gstin: " 24aaacl0000a1z5", creditNotePrefix: "lok-cn " })).toMatchObject({
      gstin: "24AAACL0000A1Z5",
      creditNotePrefix: "LOK-CN",
    });
  });

  it("shows how a number will look", () => {
    expect(buildNumberExample("lok")).toBe("LOK/2026-27/000001");
    expect(buildNumberExample("LOK-CN", 123)).toBe("LOK-CN/2026-27/000123");
    expect(buildNumberExample("")).toBe("—/2026-27/000001");
  });
});
