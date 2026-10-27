import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/property.service", () => ({
  uploadDraftFile: vi.fn(),
  deleteDraftFile: vi.fn(),
  uploadPropertyMedia: vi.fn(),
  uploadPropertyFloorPlan: vi.fn(),
  deletePropertyMedia: vi.fn(),
  deletePropertyFloorPlan: vi.fn(),
}));

import {
  deleteDraftFile,
  deletePropertyFloorPlan,
  deletePropertyMedia,
  uploadDraftFile,
  uploadPropertyFloorPlan,
  uploadPropertyMedia,
} from "@/services/property.service";
import { createDraftMediaUploader, createPropertyMediaUploader } from "./mediaUploader";

const file = new File(["x"], "a.jpg", { type: "image/jpeg" });

function createUploader(overrides: { token?: string | null; draftId?: string | null } = {}) {
  const { token = "token-1", draftId = "draft-1" } = overrides;
  return createDraftMediaUploader({
    getToken: () => token,
    ensureDraftId: async () => draftId,
  });
}

describe("createDraftMediaUploader", () => {
  beforeEach(() => {
    vi.mocked(uploadDraftFile).mockReset();
    vi.mocked(deleteDraftFile).mockReset();
  });

  it("uploads to the draft and returns the stored file reference", async () => {
    vi.mocked(uploadDraftFile).mockResolvedValue({
      file: { id: "media-1.jpg", path: "temp/drafts/draft-1/media-1.jpg" },
    } as Awaited<ReturnType<typeof uploadDraftFile>>);

    const ref = await createUploader().upload(file, "media", { category: "exterior" });

    expect(uploadDraftFile).toHaveBeenCalledWith("draft-1", file, "media", { category: "exterior" }, "token-1", "user");
    expect(ref).toEqual({ id: "media-1.jpg", path: "temp/drafts/draft-1/media-1.jpg" });
  });

  it("deletes the stored file from the draft", async () => {
    vi.mocked(deleteDraftFile).mockResolvedValue({ message: "ok" });

    await createUploader().remove({ id: "media-1.jpg", path: "temp/drafts/draft-1/media-1.jpg" });

    expect(deleteDraftFile).toHaveBeenCalledWith("draft-1", "media-1.jpg", "token-1", "user");
  });

  it("fails without touching the server when the draft cannot be created", async () => {
    await expect(createUploader({ draftId: null }).upload(file, "media", {})).rejects.toThrow(
      "Unable to start the upload",
    );
    expect(uploadDraftFile).not.toHaveBeenCalled();
  });

  it("fails without a token", async () => {
    await expect(createUploader({ token: null }).remove({ id: "a", path: "p" })).rejects.toThrow(
      "Unable to start the upload",
    );
    expect(deleteDraftFile).not.toHaveBeenCalled();
  });

  it("passes server errors on", async () => {
    vi.mocked(uploadDraftFile).mockRejectedValue(new Error("File is too large"));

    await expect(createUploader().upload(file, "brochure", {})).rejects.toThrow("File is too large");
  });
});

describe("createPropertyMediaUploader", () => {
  const propertyId = "property-1";
  const create = (token: string | null = "token-1") => createPropertyMediaUploader({ propertyId, getToken: () => token });

  beforeEach(() => {
    vi.mocked(uploadPropertyMedia).mockReset();
    vi.mocked(uploadPropertyFloorPlan).mockReset();
    vi.mocked(deletePropertyMedia).mockReset();
    vi.mocked(deletePropertyFloorPlan).mockReset();
  });

  it("adds photos and brochures to the listing and remembers their kind", async () => {
    vi.mocked(uploadPropertyMedia).mockResolvedValue({
      media: { id: "row-1", path: "/uploads/properties/property-1/a.jpg" },
    } as Awaited<ReturnType<typeof uploadPropertyMedia>>);

    const ref = await create().upload(file, "brochure", {});

    expect(uploadPropertyMedia).toHaveBeenCalledWith(propertyId, file, "brochure", {}, "token-1", "user");
    expect(ref).toEqual({ id: "row-1", path: "/uploads/properties/property-1/a.jpg", kind: "brochure" });
  });

  it("adds floor plans through their own endpoint", async () => {
    vi.mocked(uploadPropertyFloorPlan).mockResolvedValue({
      floorPlan: { id: "plan-1", path: "/uploads/properties/property-1/f.png" },
    } as Awaited<ReturnType<typeof uploadPropertyFloorPlan>>);

    const ref = await create().upload(file, "floor-plan", { planType: "3d" });

    expect(uploadPropertyFloorPlan).toHaveBeenCalledWith(propertyId, file, { planType: "3d" }, "token-1", "user");
    expect(ref).toEqual({ id: "plan-1", path: "/uploads/properties/property-1/f.png", kind: "floor-plan" });
  });

  it("removes a file with the endpoint of its kind", async () => {
    vi.mocked(deletePropertyMedia).mockResolvedValue({ message: "ok", status: "draft" });
    vi.mocked(deletePropertyFloorPlan).mockResolvedValue({ message: "ok", status: "draft" });

    await create().remove({ id: "row-1", path: "p", kind: "media" });
    await create().remove({ id: "plan-1", path: "p", kind: "floor-plan" });

    expect(deletePropertyMedia).toHaveBeenCalledWith(propertyId, "row-1", "token-1", "user");
    expect(deletePropertyFloorPlan).toHaveBeenCalledWith(propertyId, "plan-1", "token-1", "user");
  });

  it("fails without a token", async () => {
    await expect(create(null).upload(file, "media", {})).rejects.toThrow("Unable to start the upload");
    expect(uploadPropertyMedia).not.toHaveBeenCalled();
  });
});
