import { BadgePercent, type LucideIcon, Search, ShieldCheck, Star } from "lucide-react";

type WhyChooseFeature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const SECTION_TITLE = "Why choose Lokesha.com?";
const SECTION_SUBTITLE =
  "Discover a smarter way to buy, sell and rent properties with Lokesha.com - where every property journey begins.";

const FEATURES: WhyChooseFeature[] = [
  {
    title: "Channel Partner Network",
    description:
      "Collaborate with Lokesha, connect with property seekers and expand your business opportunities through our channel partner network.",
    icon: BadgePercent,
  },
  {
    title: "Transparency You Can Trust",
    description:
      "We focus on clear property information, transparent communication and a straightforward property discovery experience.",
    icon: ShieldCheck,
  },
  {
    title: "Simple & Smooth Experience",
    description:
      "Explore properties, compare options and connect with property owners through an easy-to-use platform designed around your needs.",
    icon: Star,
  },
  {
    title: "Everything Property, One Place",
    description:
      "From buying and renting to exploring new projects, discover a wide range of property opportunities in one convenient destination.",
    icon: Search,
  },
];

export function WhyChooseSection() {
  return (
    <section aria-label={SECTION_TITLE} className=" w-full bg-linear-to-r-navy-blue">
      <div className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(56,189,248,0.35),transparent_60%)]"
          aria-hidden
        />
        <div className="relative mx-auto w-full max-w-360 px-4 py-14 sm:px-6 lg:px-8">
          <header className="text-center">
            <h2 className="text-xl font-bold text-white sm:text-3xl">{SECTION_TITLE}</h2>
            <p className="mt-2 text-xs text-sky-100 sm:text-base">{SECTION_SUBTITLE}</p>
          </header>

          <ul className="mx-auto mt-8 grid max-w-8xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <li
                key={title}
                className="rounded-2xl bg-linear-to-br from-white via-white to-sky-100 p-5 shadow-lg shadow-slate-950/20"
              >
                <Icon className="h-7 w-7 fill-sky-500/20 text-sky-500" aria-hidden />
                <h3 className="mt-3 text-base font-semibold text-navy-blue">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
