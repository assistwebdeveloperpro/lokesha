import { FeaturedPropertyCard } from "./FeaturedPropertyCard";
import { FEATURED_PROPERTIES } from "./featuredProperties.dummy";

export function FeaturedPropertiesSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="font-display text-2xl font-bold text-slate-800">
        Featured Properties
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Hand-picked listings from verified owners and builders.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_PROPERTIES.map((property) => (
          <FeaturedPropertyCard key={property.id} {...property} />
        ))}
      </div>
    </section>
  );
}
