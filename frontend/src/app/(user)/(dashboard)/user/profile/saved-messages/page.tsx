"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  HardHat,
  RotateCcw,
  Save,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { useAuth } from "@/hooks/useAuth";
import {
  getSavedMessages,
  saveMessage as saveMessageRequest,
  type SavedMessageCategory,
} from "@/services/userSavedMessages.service";

const MAX_MESSAGE_LENGTH = 1000;

const SAVED_MESSAGE_TABS = [
  {
    id: "property",
    label: "For Property",
    listingLabel: "Property",
    description:
      "This section gives you easy access to contact Multiple Property Listings.",
    icon: Building2,
  },
  {
    id: "requirements",
    label: "For Requirements",
    listingLabel: "Requirement",
    description:
      "This section gives you easy access to contact Multiple Requirement Listings.",
    icon: ClipboardList,
  },
  {
    id: "agents",
    label: "For Agents",
    listingLabel: "Agent",
    description:
      "This section gives you easy access to contact Multiple Agent Listings.",
    icon: Users,
  },
  {
    id: "builders",
    label: "For Builders",
    listingLabel: "Builder",
    description:
      "This section gives you easy access to contact Multiple Builder Listings.",
    icon: HardHat,
  },
] as const;

type SavedMessageTabId = (typeof SAVED_MESSAGE_TABS)[number]["id"];

const inputClassName =
  "min-h-52 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium leading-relaxed text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20";

function createEmptyMessages(): Record<SavedMessageTabId, string> {
  return {
    property: "",
    requirements: "",
    agents: "",
    builders: "",
  };
}

function getCharacterCounterClass(charactersLeft: number) {
  if (charactersLeft <= 50) return "text-amber-600";
  return "text-slate-500";
}

function SidebarTab({
  tab,
  isActive,
  isSaved,
  hasDraftChanges,
  onSelect,
}: {
  tab: (typeof SAVED_MESSAGE_TABS)[number];
  isActive: boolean;
  isSaved: boolean;
  hasDraftChanges: boolean;
  onSelect: () => void;
}) {
  const TabIcon = tab.icon;

  return (
    <button
      type="button"
      role="tab"
      id={`saved-message-tab-${tab.id}`}
      aria-selected={isActive}
      aria-controls="saved-message-panel"
      onClick={onSelect}
      className={`group relative flex w-full cursor-pointer items-center gap-3 border-b border-slate-200 px-3 py-3 text-left transition-all last:border-b-0 ${
        isActive
          ? "bg-white text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200"
          : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
      }`}
    >
      {isActive ? (
        <span
          className="absolute inset-y-2 left-0 w-1 rounded-full bg-sky-500"
          aria-hidden
        />
      ) : null}

      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
          isActive
            ? "bg-sky-100 text-sky-700"
            : "bg-slate-100 text-slate-500 group-hover:bg-sky-50 group-hover:text-sky-600"
        }`}
      >
        <TabIcon className="h-4 w-4" aria-hidden />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-tight">{tab.label}</span>
        <span className="mt-0.5 block text-[11px] text-slate-500">
          {hasDraftChanges
            ? "Unsaved changes"
            : isSaved
              ? "Ready to use"
              : "Not configured"}
        </span>
      </span>

      {isSaved ? (
        <CheckCircle2
          className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-500" : "text-emerald-400"}`}
          aria-hidden
        />
      ) : null}
    </button>
  );
}

export default function SavedMessagesPage() {
  const { showToast } = useToast();
  const { token, isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<SavedMessageTabId>("property");
  const [messages, setMessages] = useState(createEmptyMessages);
  const [savedMessages, setSavedMessages] = useState(createEmptyMessages);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function loadSavedMessages() {
      try {
        const { savedMessages: fetchedMessages } = await getSavedMessages(token!);
        if (cancelled) return;
        setSavedMessages(fetchedMessages);
        setMessages(fetchedMessages);
      } catch (err) {
        if (!cancelled) {
          showToast(
            err instanceof Error ? err.message : "Failed to load saved messages",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadSavedMessages();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, token, showToast]);

  const activeTabConfig =
    SAVED_MESSAGE_TABS.find((tab) => tab.id === activeTab) ?? SAVED_MESSAGE_TABS[0];
  const currentMessage = messages[activeTab];
  const charactersLeft = MAX_MESSAGE_LENGTH - currentMessage.length;
  const hasUnsavedChanges = savedMessages[activeTab] !== currentMessage;
  const hasSavedMessage = Boolean(savedMessages[activeTab]);

  function handleMessageChange(value: string) {
    if (value.length > MAX_MESSAGE_LENGTH) return;

    setMessages((current) => ({
      ...current,
      [activeTab]: value,
    }));
  }

  function handleClearMessage() {
    setMessages((current) => ({
      ...current,
      [activeTab]: "",
    }));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      showToast("Please log in to save a message.");
      return;
    }

    setIsSaving(true);

    try {
      const { savedMessages: updatedMessages } = await saveMessageRequest(
        { category: activeTab as SavedMessageCategory, message: currentMessage },
        token,
      );
      setSavedMessages(updatedMessages);
      setMessages(updatedMessages);
      showToast(`Saved message for ${activeTabConfig.label.toLowerCase()}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save message");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section aria-labelledby="saved-messages-heading" className="w-full">
      <div className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-600">
            Quick contact
          </p>
          <h1
            id="saved-messages-heading"
            className="mt-1 font-display text-xl font-bold text-slate-900 sm:text-2xl"
          >
            Saved Messages
          </h1>
          <p className="profile-description mt-1.5">
            Create reusable messages for property, requirement, agent, and builder listings so you
            can respond quickly without retyping every time.
          </p>
        </div>
        <Link
          href="/user/profile/account-details"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to profile
        </Link>
      </div>

      <div className="grid w-full min-w-0 gap-4 md:grid-cols-[minmax(11rem,14rem)_minmax(0,1fr)] md:items-start lg:grid-cols-[minmax(12rem,15rem)_minmax(0,1fr)] xl:grid-cols-[minmax(13rem,16rem)_minmax(0,1fr)]">
        <aside className="w-full border-b border-slate-200 pb-4 md:border-b-0 md:pb-0">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 shadow-sm">
            <p className="border-b border-slate-200 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
              Message type
            </p>
            <nav
              role="tablist"
              aria-label="Saved message categories"
              className="flex flex-col"
            >
              {SAVED_MESSAGE_TABS.map((tab) => (
                <SidebarTab
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeTab}
                  isSaved={Boolean(savedMessages[tab.id])}
                  hasDraftChanges={messages[tab.id] !== savedMessages[tab.id]}
                  onSelect={() => setActiveTab(tab.id)}
                />
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <form
            onSubmit={handleSave}
            role="tabpanel"
            id="saved-message-panel"
            aria-labelledby={`saved-message-tab-${activeTab}`}
          >
            <div key={activeTab} className="border-b bg-[#F9FAFB] border-slate-100 px-4 py-5 sm:px-5 sm:py-6">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-sky-500"
                  aria-hidden
                />
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900 sm:text-lg">
                    {activeTabConfig.label}
                  </h2>
                  <p className="profile-description mt-1.5">
                    {activeTabConfig.description} In case you want to update the message, please
                    edit & save it.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 px-4 py-5 sm:px-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor="saved-message-textarea"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Your message
                  </label>
                  {currentMessage ? (
                    <button
                      type="button"
                      onClick={handleClearMessage}
                      className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-sky-700 transition hover:text-sky-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                      Clear
                    </button>
                  ) : null}
                </div>

                <textarea
                  id="saved-message-textarea"
                  value={currentMessage}
                  onChange={(event) => handleMessageChange(event.target.value)}
                  placeholder={
                    isLoading
                      ? "Loading your saved message..."
                      : `Hi, I came across your ${activeTabConfig.listingLabel.toLowerCase()} listing and would like to connect...`
                  }
                  disabled={isLoading}
                  className={`${inputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                />

                <p
                  className={`mt-2 text-right text-xs font-medium ${getCharacterCounterClass(charactersLeft)}`}
                >
                  {charactersLeft.toLocaleString()} character{charactersLeft === 1 ? "" : "s"} left
                </p>
              </div>

              {currentMessage ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Preview
                  </p>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {currentMessage}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-h-6">
                {hasUnsavedChanges ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600">
                    <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    You have unsaved changes
                  </p>
                ) : hasSavedMessage ? (
                  <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Message saved
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Draft your message above, then save it for quick reuse.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleClearMessage}
                  disabled={!currentMessage || isSaving || isLoading}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isLoading || !hasUnsavedChanges}
                  className="bg-linear-to-r-navy-blue inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md shadow-slate-900/15 transition hover:shadow-slate-900/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
