import { describe, expect, it, vi } from "vitest";
import type { SaveDraftInput } from "@/services/property.service";
import { createDraftSaveQueue, type DraftPersistence, type DraftSaveStatus } from "./draftSaveQueue";

const input = (step: number): SaveDraftInput => ({ currentStep: step, formData: { step } });

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

function createPersistence(overrides: Partial<DraftPersistence> = {}): DraftPersistence {
  return {
    create: vi.fn().mockResolvedValue("draft-1"),
    update: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("createDraftSaveQueue", () => {
  it("creates the draft on the first save and updates it afterwards", async () => {
    const persistence = createPersistence();
    const onCreated = vi.fn();
    const queue = createDraftSaveQueue(persistence, { onCreated });

    await expect(queue.save(input(2))).resolves.toBe(true);
    await expect(queue.save(input(3))).resolves.toBe(true);

    expect(persistence.create).toHaveBeenCalledTimes(1);
    expect(persistence.create).toHaveBeenCalledWith(input(2));
    expect(persistence.update).toHaveBeenCalledWith("draft-1", input(3));
    expect(onCreated).toHaveBeenCalledOnce();
    expect(onCreated).toHaveBeenCalledWith("draft-1");
    expect(queue.getDraftId()).toBe("draft-1");
  });

  it("updates an adopted draft without creating one", async () => {
    const persistence = createPersistence();
    const queue = createDraftSaveQueue(persistence, {}, "existing");

    await queue.save(input(4));

    expect(persistence.create).not.toHaveBeenCalled();
    expect(persistence.update).toHaveBeenCalledWith("existing", input(4));
  });

  it("never runs two saves at once and only sends the newest pending state", async () => {
    const first = deferred();
    const persistence = createPersistence({
      create: vi.fn().mockReturnValue(first.promise.then(() => "draft-1")),
    });
    const queue = createDraftSaveQueue(persistence);

    const saves = [queue.save(input(1)), queue.save(input(2)), queue.save(input(3))];
    expect(persistence.create).toHaveBeenCalledTimes(1);

    first.resolve();
    await Promise.all(saves);

    expect(persistence.create).toHaveBeenCalledWith(input(1));
    expect(persistence.update).toHaveBeenCalledTimes(1);
    expect(persistence.update).toHaveBeenCalledWith("draft-1", input(3));
  });

  it("creates only one draft for saves made while it is being created", async () => {
    const creating = deferred();
    const persistence = createPersistence({
      create: vi.fn().mockReturnValue(creating.promise.then(() => "draft-1")),
    });
    const queue = createDraftSaveQueue(persistence);

    const saves = Promise.all([queue.save(input(1)), queue.save(input(2))]);
    creating.resolve();
    await saves;

    expect(persistence.create).toHaveBeenCalledTimes(1);
  });

  it("reports false instead of throwing when a save fails, and recovers on the next save", async () => {
    const persistence = createPersistence({
      create: vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValue("draft-1"),
    });
    const queue = createDraftSaveQueue(persistence);

    await expect(queue.save(input(1))).resolves.toBe(false);
    expect(queue.getDraftId()).toBeNull();

    await expect(queue.save(input(2))).resolves.toBe(true);
    expect(queue.getDraftId()).toBe("draft-1");
  });

  it("reports the status while saving", async () => {
    const statuses: DraftSaveStatus[] = [];
    const queue = createDraftSaveQueue(createPersistence(), { onStatusChange: (s) => statuses.push(s) });

    await queue.save(input(1));

    expect(statuses).toEqual(["saving", "saved"]);
  });

  it("reports an error status when the last save failed", async () => {
    const statuses: DraftSaveStatus[] = [];
    const queue = createDraftSaveQueue(
      createPersistence({ create: vi.fn().mockRejectedValue(new Error("offline")) }),
      { onStatusChange: (s) => statuses.push(s) },
    );

    await queue.save(input(1));

    expect(statuses).toEqual(["saving", "error"]);
  });

  it("flush resolves true when nothing is pending", async () => {
    await expect(createDraftSaveQueue(createPersistence()).flush()).resolves.toBe(true);
  });

  it("flush waits for the running save", async () => {
    const running = deferred();
    const persistence = createPersistence({
      create: vi.fn().mockReturnValue(running.promise.then(() => "draft-1")),
    });
    const queue = createDraftSaveQueue(persistence);

    void queue.save(input(1));
    let flushed = false;
    const flush = queue.flush().then((ok) => {
      flushed = true;
      return ok;
    });
    await Promise.resolve();
    expect(flushed).toBe(false);

    running.resolve();
    await expect(flush).resolves.toBe(true);
  });

  it("ensureId creates the draft when there is none and reuses it otherwise", async () => {
    const persistence = createPersistence();
    const queue = createDraftSaveQueue(persistence);
    const getInput = vi.fn(() => input(1));

    await expect(queue.ensureId(getInput)).resolves.toBe("draft-1");
    await expect(queue.ensureId(getInput)).resolves.toBe("draft-1");

    expect(persistence.create).toHaveBeenCalledTimes(1);
    expect(getInput).toHaveBeenCalledTimes(1);
  });

  it("ensureId returns null when the draft cannot be created", async () => {
    const queue = createDraftSaveQueue(
      createPersistence({ create: vi.fn().mockRejectedValue(new Error("offline")) }),
    );

    await expect(queue.ensureId(() => input(1))).resolves.toBeNull();
  });

  it("adopt switches the draft and clears the id with null", async () => {
    const persistence = createPersistence();
    const queue = createDraftSaveQueue(persistence);

    queue.adopt("other");
    expect(queue.getDraftId()).toBe("other");
    await queue.save(input(2));
    expect(persistence.update).toHaveBeenCalledWith("other", input(2));

    queue.adopt(null);
    await queue.save(input(3));
    expect(persistence.create).toHaveBeenCalledWith(input(3));
  });
});
