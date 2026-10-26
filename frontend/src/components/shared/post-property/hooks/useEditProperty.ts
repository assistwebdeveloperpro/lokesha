import type { PropertyDetail } from "@/services/property.service";

type UseEditPropertyResult = {
  property: PropertyDetail | null;
  isLoading: boolean;
  error: string;
};

// Property backend is removed, so an edit target can never be loaded
export function useEditProperty(editId: string | null): UseEditPropertyResult {
  return {
    property: null,
    isLoading: false,
    error: editId ? "Editing properties is currently unavailable." : "",
  };
}
