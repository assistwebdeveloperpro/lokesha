"use client";

import ConfirmDeleteModal from "@/components/shared/ui/ConfirmDeleteModal";

type DeletePropertyModalProps = {
  propertyTitle: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeletePropertyModal({ propertyTitle, ...modalProps }: DeletePropertyModalProps) {
  return (
    <ConfirmDeleteModal title="Delete property?" {...modalProps}>
      <span className="font-semibold text-slate-800">{propertyTitle}</span> will be permanently deleted along with
      its photos. This cannot be undone.
    </ConfirmDeleteModal>
  );
}
