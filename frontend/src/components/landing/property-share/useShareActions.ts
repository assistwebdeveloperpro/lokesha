"use client";

import { useCallback } from "react";
import { useToast } from "@/components/shared/ui/ToastProvider";
import {
  FACEBOOK_HOME_URL,
  buildAllLinksText,
  buildFacebookShareUrl,
  buildTwitterShareUrl,
  buildGmailShareUrl,
  buildShortUrl,
  buildWhatsAppShareUrl,
  type ShareChannel,
  type ShareProperty,
} from "@/lib/property-share/propertyShare";
import { copyToClipboard } from "./copyToClipboard";

const COPY_ERROR ="Unable to copy. Please copy the link manually.";

const openInNewTab = (url: string) =>
  window.open(url, "_blank", "noopener,noreferrer");

export function useShareActions(properties: ShareProperty[]) {
  const { showToast } = useToast();
  const isMultiple = properties.length > 1;

  const copy = useCallback(
    async (text: string, successMessage: string) => {
      const copied = await copyToClipboard(text);
      showToast(copied ? successMessage : COPY_ERROR, copied ? "success" : "error");
      return copied;
    },
    [showToast],
  );

  const copyLink = useCallback(
    () => copy(buildShortUrl(properties[0].shortCode), "Link copied to clipboard."),
    [copy, properties],
  );

  const copyAllLinks = useCallback(
    () => copy(buildAllLinksText(properties), `${properties.length} links copied to clipboard.`),
    [copy, properties],
  );

  // Facebook takes one url only, so a list is copied and pasted by hand
  const shareViaCopy = useCallback(
    async (homeUrl: string, platform: string) => {
      openInNewTab(homeUrl);
      await copy(
        buildAllLinksText(properties),
        `${isMultiple ? "Links" : "Link"} copied. Paste ${isMultiple ? "them" : "it"} in your ${platform} post or message.`,
      );
    },
    [copy, isMultiple, properties],
  );

  const share = useCallback(
    (channel: ShareChannel) => {
      switch (channel) {
        case "whatsapp":
          openInNewTab(buildWhatsAppShareUrl(properties));
          break;
        case "gmail":
          openInNewTab(buildGmailShareUrl(properties));
          break;
        case "facebook":
          if (isMultiple) return shareViaCopy(FACEBOOK_HOME_URL, "Facebook");
          openInNewTab(buildFacebookShareUrl(properties[0].shortCode));
          break;
        case "twitter":
          openInNewTab(buildTwitterShareUrl(properties));
          break;
      }
    },
    [isMultiple, properties, shareViaCopy],
  );

  return { share, copyLink, copyAllLinks };
}
