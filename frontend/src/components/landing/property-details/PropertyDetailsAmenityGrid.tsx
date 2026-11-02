type AmenityGridVariant = "amenities" | "furnishing";

const IMAGE_BASE_PATH = "/assets/images";

const AMENITY_IMAGES: Record<string, string> = {
  lift: "lift.svg",
  gym: "gym.svg",
  "swimming pool": "swimming_pool.svg",
  "club house": "club_house.svg",
  "power backup": "power_backup.svg",
  "24x7 security": "security.svg",
  security: "security.svg",
  "children play area": "kids_play_area.svg",
  parking: "reserved_parking.svg",
  garden: "garden_park.svg",
  cctv: "cctv.svg",
  "water supply": "regular_water_supply.svg",
  "maintenance staff": "maintenance-staff.svg",
};

const FURNISHING_IMAGES: Record<string, string> = {
  "modular kitchen": "stove.svg",
  wardrobes: "wardrobes.svg",
  sofa: "sofa.svg",
  "dining table": "dining_table.svg",
  ac: "ac.svg",
  geyser: "gyser.svg",
  "tv unit": "tv.svg",
  bed: "beds.svg",
};

const IMAGE_MAPS: Record<AmenityGridVariant, Record<string, string>> = {
  amenities: AMENITY_IMAGES,
  furnishing: FURNISHING_IMAGES,
};

function imageForItem(variant: AmenityGridVariant, label: string): string | null {
  const file = IMAGE_MAPS[variant][label.toLowerCase()];
  return file ? `${IMAGE_BASE_PATH}/${variant}/${file}` : null;
}

type PropertyDetailsAmenityGridProps = {
  items: string[];
  variant?: AmenityGridVariant;
};

export function PropertyDetailsAmenityGrid({
  items,
  variant = "amenities",
}: PropertyDetailsAmenityGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => {
        const image = imageForItem(variant, item);
        return (
          <li
            key={item}
            className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-9 w-9 object-contain" aria-hidden />
              ) : null}
            </span>
            <span className="text-xs font-semibold text-slate-700 sm:text-sm">{item}</span>
          </li>
        );
      })}
    </ul>
  );
}
