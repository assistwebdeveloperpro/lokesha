"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import ConfirmDeleteModal from "@/components/shared/ui/ConfirmDeleteModal";
import type { LimelightEntry } from "@/services/adminLimelightProjects.service";
import LimelightCurrentGrid from "./LimelightCurrentGrid";
import LimelightFindProjects from "./LimelightFindProjects";
import { pluralizeProjects } from "./limelightShared";
import { useLimelightEntries } from "./useLimelightEntries";
import { useLimelightSearch } from "./useLimelightSearch";

export default function LimelightProjectsContent() {
  const [isAddConfirmOpen, setIsAddConfirmOpen] = useState(false);
  const [entryToRemove, setEntryToRemove] = useState<LimelightEntry | null>(null);
  const [entriesRefreshKey, setEntriesRefreshKey] = useState(0);
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);

  const entriesState = useLimelightEntries(entriesRefreshKey, () => setSearchRefreshKey((key) => key + 1));
  const search = useLimelightSearch(searchRefreshKey, () => setEntriesRefreshKey((key) => key + 1));

  const handleConfirmAdd = async () => {
    await search.addSelected();
    setIsAddConfirmOpen(false);
  };

  const handleConfirmRemove = async () => {
    if (!entryToRemove) return;

    await entriesState.removeProject(entryToRemove.projectId);
    setEntryToRemove(null);
  };

  return (
    <div className="w-full space-y-8 px-1 py-0 sm:px-6 lg:px-6">
      <header className="flex items-center gap-3">
        <span className="bg-linear-to-r-navy-blue flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-800">Limelight Projects</h1>
          <p className="text-sm text-slate-500">Choose the projects featured on the landing page</p>
        </div>
      </header>

      <LimelightFindProjects search={search} onRequestAdd={() => setIsAddConfirmOpen(true)} />

      <LimelightCurrentGrid entriesState={entriesState} onRequestRemove={setEntryToRemove} />

      {isAddConfirmOpen ? (
        <ConfirmDeleteModal
          title="Add to Limelight?"
          isDeleting={search.isAdding}
          confirmLabel="Add to Limelight"
          pendingLabel="Adding..."
          confirmClassName="bg-navy-blue hover:opacity-90"
          onCancel={() => setIsAddConfirmOpen(false)}
          onConfirm={handleConfirmAdd}
        >
          {pluralizeProjects(search.selected.size)} will go live on the landing page right away.
        </ConfirmDeleteModal>
      ) : null}

      {entryToRemove ? (
        <ConfirmDeleteModal
          title="Remove this project from Limelight?"
          isDeleting={entriesState.isRemoving}
          confirmLabel="Remove"
          pendingLabel="Removing..."
          onCancel={() => setEntryToRemove(null)}
          onConfirm={handleConfirmRemove}
        >
          {entryToRemove.projectName} will no longer appear on the landing page.
        </ConfirmDeleteModal>
      ) : null}
    </div>
  );
}
