"use client";

import { Mail } from "lucide-react";
import type { ReactNode } from "react";
import type { ShareChannel } from "@/lib/property-share/propertyShare";

type ShareChannelButtonsProps = {
  onShare: (channel: ShareChannel) => void;
};

const iconProps = { viewBox: "0 0 24 24", className: "h-5 w-5 fill-current", "aria-hidden": true };

function WhatsAppIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.43 15.1L2 22l5.04-1.58A9.9 9.9 0 1 0 12.04 2Zm5.8 14.1c-.25.7-1.45 1.34-2 1.4-.52.06-1.17.09-1.89-.12a17 17 0 0 1-1.7-.63c-3-1.3-4.95-4.32-5.1-4.52-.15-.2-1.22-1.63-1.22-3.1 0-1.48.77-2.2 1.04-2.5.27-.3.6-.38.8-.38l.57.01c.19 0 .43-.07.68.52.25.6.85 2.07.93 2.22.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.32.38-.45.5-.15.15-.3.3-.13.6.17.3.77 1.26 1.65 2.04 1.13 1 2.09 1.31 2.39 1.46.3.15.47.12.65-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.35.07.12.07.72-.18 1.42Z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.75-1.7H17V3.7A21 21 0 0 0 14.6 3.6c-2.5 0-4.1 1.5-4.1 4.2v2.7H7.7v3.3h2.8V22h3Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 7.4A4.6 4.6 0 1 0 12 16.6 4.6 4.6 0 0 0 12 7.4Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm5.9-7.8a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21 8.2c-.05-1.1-.3-2.1-1.1-2.9-.8-.8-1.8-1.05-2.9-1.1C15.9 4.1 8.1 4.1 7 4.2c-1.1.05-2.1.3-2.9 1.1-.8.8-1.05 1.8-1.1 2.9-.1 1.2-.1 7.6 0 8.8.05 1.1.3 2.1 1.1 2.9.8.8 1.8 1.05 2.9 1.1 1.1.07 8.9.07 10 0 1.1-.05 2.1-.3 2.9-1.1.8-.8 1.05-1.8 1.1-2.9.07-1.2.07-7.6 0-8.8ZM19.2 17.9a2.3 2.3 0 0 1-1.3 1.3c-.9.35-3 .27-5.9.27s-5 .08-5.9-.27a2.3 2.3 0 0 1-1.3-1.3c-.35-.9-.27-3-.27-5.9s-.08-5 .27-5.9a2.3 2.3 0 0 1 1.3-1.3c.9-.35 3-.27 5.9-.27s5-.08 5.9.27a2.3 2.3 0 0 1 1.3 1.3c.35.9.27 3 .27 5.9s.08 5-.27 5.9Z" />
    </svg>
  );
}

const CHANNELS: { channel: ShareChannel; label: string; className: string; icon: ReactNode }[] = [
  { channel: "whatsapp", label: "WhatsApp", className: "bg-[#25D366]", icon: <WhatsAppIcon /> },
  { channel: "facebook", label: "Facebook", className: "bg-[#1877F2]", icon: <FacebookIcon /> },
  {
    channel: "instagram",
    label: "Instagram",
    className: "bg-linear-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]",
    icon: <InstagramIcon />,
  },
  { channel: "gmail", label: "Gmail", className: "bg-slate-500", icon: <Mail className="h-5 w-5" aria-hidden /> },
];

export function ShareChannelButtons({ onShare }: ShareChannelButtonsProps) {
  return (
    <ul className="grid grid-cols-4 gap-2">
      {CHANNELS.map(({ channel, label, className, icon }) => (
        <li key={channel} className="flex justify-center">
          <button
            type="button"
            onClick={() => onShare(channel)}
            className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl p-1.5 text-xs font-medium text-slate-600 transition hover:text-slate-900 sm:text-sm"
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm transition group-hover:scale-105 sm:h-12 sm:w-12 ${className}`}
            >
              {icon}
            </span>
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
