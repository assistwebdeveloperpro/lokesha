import Link from "next/link";

const footerLinks = [
  { label: "Sitemap", href: "#" },
  { label: "About Us", href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Privacy", href: "#" },
];

export default function AuthFooter() {
  return (
    <footer className="relative z-20 shrink-0">
      <div className="bg-navy-blue px-3 py-4 text-center max-[380px]:px-2.5 sm:px-4 lg:py-3">
        <p className="text-xs text-slate-400">© Lokesha</p>
        <nav
          className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm font-semibold text-white lg:mt-1 lg:text-xs"
          aria-label="Footer"
        >
          {footerLinks.map((link, index) => (
            <span key={link.label} className="flex items-center gap-2">
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
