import Link from "next/link";

const footerLinks = [
  { label: "Sitemap", href: "/sitemap" },
  { label: "About Us", href: "/about" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

export default function AuthFooter() {
  return (
    <footer className="relative z-20 shrink-0">
      <div className="bg-navy-blue px-4 py-4 text-center lg:py-3">
        <p className="text-xs text-slate-400">© Lokesha</p>
        <nav
          className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-white lg:mt-1 lg:text-xs"
          aria-label="Footer"
        >
          {footerLinks.map((link, index) => (
            <span key={link.href} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-sky-400/70" aria-hidden>
                  •
                </span>
              )}
              <Link
                href={link.href}
                className="transition-colors hover:text-sky-300"
              >
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
