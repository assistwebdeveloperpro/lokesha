import { PHOTO_CATEGORY_OPTIONS } from "@/components/shared/post-property/config/postPropertyForm.shared";

export type PropertyDetailsGalleryCategory = {
  id: string;
  label: string;
  images: string[];
};

const categoryLabelById = Object.fromEntries(
  PHOTO_CATEGORY_OPTIONS.map((option) => [option.id, option.label]),
) as Record<string, string>;

const categorySortIndex = Object.fromEntries(
  PHOTO_CATEGORY_OPTIONS.map((option, index) => [option.id, index]),
) as Record<string, number>;

const humanizeCategoryId = (id: string) =>
  id
    .replace(/[-_]+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const MAIN_PHOTO_CATEGORY_ID = "main-photo";

const compareGalleryCategories = (
  left: PropertyDetailsGalleryCategory,
  right: PropertyDetailsGalleryCategory,
) => {
  if (left.id === MAIN_PHOTO_CATEGORY_ID) return -1;
  if (right.id === MAIN_PHOTO_CATEGORY_ID) return 1;
  return (
    (categorySortIndex[left.id] ?? Number.MAX_SAFE_INTEGER) -
    (categorySortIndex[right.id] ?? Number.MAX_SAFE_INTEGER)
  );
};

export function normalizePropertyGalleryCategories(
  groups: { category: string; images: string[] }[] | undefined,
): PropertyDetailsGalleryCategory[] {
  if (!groups?.length) return [];

  return groups
    .filter((group) => group.images.length > 0)
    .map((group) => ({
      id: group.category,
      label: categoryLabelById[group.category] ?? humanizeCategoryId(group.category),
      images: group.images,
    }))
    .sort(compareGalleryCategories);
}

export function orderGalleryImagesForCategory(
  categories: PropertyDetailsGalleryCategory[],
  activeCategoryId: string | null,
): string[] {
  if (!categories.length) return [];
  if (!activeCategoryId) return categories.flatMap((category) => category.images);

  const active = categories.find((category) => category.id === activeCategoryId);
  const rest = categories
    .filter((category) => category.id !== activeCategoryId)
    .sort(compareGalleryCategories);
  return [...(active?.images ?? []), ...rest.flatMap((category) => category.images)];
}

export function resolveGalleryCategoryForImage(
  categories: PropertyDetailsGalleryCategory[],
  imageUrl: string,
): string | null {
  for (const category of categories) {
    if (category.images.includes(imageUrl)) return category.id;
  }
  return categories[0]?.id ?? null;
}
