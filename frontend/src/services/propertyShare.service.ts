import { apiFetch, getAssetUrl } from "./apiClient";

export type PropertyShare = {
  id: string;
  shortCode: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string | null;
};

export async function getPropertyShare(propertyId: string): Promise<PropertyShare> {
  const { share } = await apiFetch<{ share: PropertyShare }>(
    `/property-search/share/${propertyId}`,
    { method: "GET" },
  );

  return { ...share, imageUrl: share.imageUrl ? getAssetUrl(share.imageUrl) : null };
}
