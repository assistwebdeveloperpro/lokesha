"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { getToken } from "@/services/session";
import { downloadInvoicePdf } from "@/services/userSubscription.service";
import { getInvoiceFileName } from "./subscriptionShared";

const DOWNLOAD_ERROR = "We could not download the invoice. Please try again.";

type InvoiceDownloadButtonProps = {
  invoiceId: string;
  invoiceNumber: string;
};

export default function InvoiceDownloadButton({ invoiceId, invoiceNumber }: InvoiceDownloadButtonProps) {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const token = getToken();
    if (!token) return;

    setIsDownloading(true);
    try {
      const url = URL.createObjectURL(await downloadInvoicePdf(invoiceId, token));
      const link = document.createElement("a");
      link.href = url;
      link.download = getInvoiceFileName(invoiceNumber);
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      showToast(DOWNLOAD_ERROR, "error");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={isDownloading}
      onClick={handleDownload}
      aria-label={`Download invoice ${invoiceNumber}`}
      className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDownloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Download className="h-3.5 w-3.5" aria-hidden />}
      Invoice
    </button>
  );
}
