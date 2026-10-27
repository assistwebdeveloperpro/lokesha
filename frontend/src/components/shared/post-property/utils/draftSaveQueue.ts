import type { SaveDraftInput } from "@/services/property.service";

export type DraftSaveStatus = "idle" | "saving" | "saved" | "error";

export type DraftPersistence = {
  create: (input: SaveDraftInput) => Promise<string>;
  update: (id: string, input: SaveDraftInput) => Promise<void>;
};

type DraftSaveCallbacks = {
  onCreated?: (id: string) => void;
  onStatusChange?: (status: DraftSaveStatus) => void;
};

// Saves one at a time and only the newest state; a failed save never rejects
export function createDraftSaveQueue(
  persistence: DraftPersistence,
  callbacks: DraftSaveCallbacks = {},
  initialId: string | null = null,
) {
  let draftId = initialId;
  let pending: SaveDraftInput | null = null;
  let running: Promise<void> | null = null;
  let lastSaveSucceeded = true;

  async function persist(input: SaveDraftInput) {
    if (draftId) {
      await persistence.update(draftId, input);
      return;
    }

    draftId = await persistence.create(input);
    callbacks.onCreated?.(draftId);
  }

  async function drain() {
    while (pending) {
      const input = pending;
      pending = null;
      callbacks.onStatusChange?.("saving");

      try {
        await persist(input);
        lastSaveSucceeded = true;
      } catch {
        lastSaveSucceeded = false;
      }
    }

    callbacks.onStatusChange?.(lastSaveSucceeded ? "saved" : "error");
  }

  // Resolves true when the newest state is stored
  async function flush(): Promise<boolean> {
    if (!running && pending) {
      running = drain().finally(() => {
        running = null;
      });
    }

    await running;
    return lastSaveSucceeded;
  }

  function save(input: SaveDraftInput): Promise<boolean> {
    pending = input;
    return flush();
  }

  // Creates the draft on first use, e.g. before a file upload
  async function ensureId(getInput: () => SaveDraftInput): Promise<string | null> {
    if (!draftId) {
      await save(getInput());
    }
    return draftId;
  }

  // An existing draft that was loaded, or null after the draft was completed
  function adopt(id: string | null) {
    draftId = id;
    pending = null;
  }

  return {
    save,
    flush,
    ensureId,
    adopt,
    getDraftId: () => draftId,
  };
}

export type DraftSaveQueue = ReturnType<typeof createDraftSaveQueue>;
