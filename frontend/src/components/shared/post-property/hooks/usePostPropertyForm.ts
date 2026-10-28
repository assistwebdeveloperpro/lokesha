"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  showsConstructionProgress,
  type ProjectDetailsValues,
} from "@/components/master/post-property/postPropertyProjectDetails";
import { useToast } from "@/components/shared/ui/ToastProvider";
import { ApiError } from "@/services/apiClient";
import {
  closeProperty,
  completeDraft,
  fetchDraftFilePreview,
  getDraft,
  submitProperty,
  updateProperty,
  type PropertyStatus,
  type SaveDraftInput,
} from "@/services/property.service";
import { getBhkAreaErrorSubTypes, getBhkAreaTabs } from "../builder/bhkAreaDetails";
import { getBuilderConfig, getMergedBuilderConfig } from "../builder/builderConfig";
import {
  validateAvailableSizes,
  validateBuilderPricing,
  validateBuilderProjectType,
  type BuilderFieldErrors,
} from "../builder/builderValidation";
import { mapDetailToForm } from "../utils/postPropertyEdit";
import {
  arePhotosRequired,
  getStepFromSearchParam,
  getTotalMediaCount,
  hasAddressLocationErrors,
  hasFailedMedia,
  hasUploadingMedia,
  hasAmenitiesErrors,
  hasPropertyDetailsErrors,
  isRentListing,
  validateAddressLocation,
  validateAmenities,
  validatePricingOthers,
  validatePropertyDetails,
  type AddressLocationValues,
  type AmenitiesValues,
  type ListingTypeId,
  type PhotosVideosValues,
  type PricingOthersValues,
  type PropertyDetailsValues,
  type PropertyTypeId,
} from "../config/postPropertyForm.shared";
import { createDraftFormData, hydrateFormState } from "../state/postPropertyDraftSnapshot";
import {
  createInitialDraft,
  postPropertyReducer,
  type DraftErrors,
} from "../state/postPropertyFormReducer";
import {
  revokeConstructionProgressPreviews,
  withoutConstructionProgress,
  withoutHiddenDetailsErrors,
  withoutHiddenPricingErrors,
} from "../state/postPropertyFormState";
import {
  INITIAL_AMENITIES,
  INITIAL_PRICING_OTHERS,
  INITIAL_PROPERTY_DETAILS,
} from "../state/postPropertyInitialValues";
import { loadDraftPreviews } from "../utils/draftPreviews";
import { focusFirstInvalidField } from "../utils/focusFirstInvalidField";
import { createDraftMediaUploader, createPropertyMediaUploader } from "../utils/mediaUploader";
import { buildPropertyPayload } from "../utils/postPropertyPayload";
import { getSubTypeLayout } from "../utils/postPropertyLayout";
import { getFormConfig } from "../config/postPropertySaleConfig";
import { resolveOptionalAmenities, type PostingAsId } from "../config/postingAs";
import { usePostPropertyAuth, usePostPropertyMode } from "../config/postPropertyMode";
import { resolveBackendErrors } from "../validation/postPropertyBackendErrors";
import { resolveFirstInvalidStep } from "../validation/postPropertyStepValidation";
import { getSubmitErrorMessage, isUnauthorizedError } from "../validation/postPropertySubmitError";
import { useEditProperty } from "./useEditProperty";
import { usePostPropertyDraft } from "./usePostPropertyDraft";
import { useSubTypeForms } from "./useSubTypeForms";

const SUBMIT_AFTER_EDIT_STATUSES: PropertyStatus[] = ["draft", "rejected"];
const ADMIN_SUBMIT_AFTER_EDIT_STATUSES: PropertyStatus[] = ["draft", "closed"];
const SUBMITTED_MESSAGE = "Your property has been submitted for review.";
const PUBLISHED_MESSAGE = "Your property has been published.";

const CLEARED_SIZE_ERRORS: BuilderFieldErrors = { bhkAreas: undefined, availableSizes: undefined };

type SaveMode = "submit" | "draft";
const MISSING_PHOTOS_MESSAGE = "Please add at least one photo";
const UPLOADING_MESSAGE = "Please wait for the uploads to finish";
const FAILED_UPLOADS_MESSAGE = "Some files failed to upload. Retry or remove them to continue";

export function usePostPropertyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { scope, basePath, managePath, createdPath } = usePostPropertyMode();
  const { role, token, isAuthReady, isAdmin } = usePostPropertyAuth();
  const currentStep = getStepFromSearchParam(searchParams.get("step"));
  const editId = searchParams.get("edit");
  const draftParam = searchParams.get("draft");
  const isEditMode = Boolean(editId);
  const { detail: editDetail, isLoading: isLoadingEdit, error: editError } = useEditProperty(editId);

  const [draft, dispatch] = useReducer(postPropertyReducer, undefined, createInitialDraft);
  const [selectedPostingAs, setPostingAs] = useState<PostingAsId | "">("");
  // A posted property keeps the way it was posted; only a new one lets staff choose
  // A project marks a builder listing even when its owner is a builder user, not staff
  const postingAs: PostingAsId | "" = editDetail
    ? editDetail.payload.postingAs === "builder" || editDetail.payload.project
      ? "builder"
      : ""
    : selectedPostingAs;
  const {
    listingType,
    propertyType,
    propertySubTypes,
    addressLocation,
    propertyDetails,
    amenities,
    photosVideos,
    pricingOthers,
    projectDetails,
    existingMedia,
  } = draft;

  const propertySubType = propertySubTypes[0] ?? "";
  const isRent = isRentListing(listingType);
  // Staff and admins both choose who they are posting the listing as
  const isStaff = isAuthReady && (isAdmin || role === "lokesha_staff");
  const showBuilderFields =
    isAuthReady && (role === "builder" || (isStaff && postingAs === "builder"));
  const isBuilderPost = showBuilderFields || Boolean(editDetail?.payload.project);
  const optionalAmenities = resolveOptionalAmenities({
    role,
    isStaff,
    postingAs,
    isBuilderPost,
    isOwnerAgentListing: isEditMode && editDetail !== null && !editDetail.payload.project,
  });
  const builderConfig = getMergedBuilderConfig(propertyType, propertySubTypes);
  const addressValidationOptions = {
    projectNameOptional: showBuilderFields && !builderConfig.projectNameRequired,
  };
  const layout = getSubTypeLayout({
    propertyType,
    listingType,
    propertySubTypes,
    builder: showBuilderFields,
  });

  const subForms = useSubTypeForms({
    commonDetailsFields: layout.commonDetailsFields,
    commonAmenitiesFields: layout.commonAmenitiesFields,
    sharedPhotos: layout.sharedPhotos,
    propertyType,
    listingType,
    isRent,
    subTypes: propertySubTypes,
    builder: showBuilderFields,
    optionalAmenities,
    initials: {
      details: INITIAL_PROPERTY_DETAILS,
      amenities: INITIAL_AMENITIES,
      pricing: INITIAL_PRICING_OTHERS,
    },
    single: {
      details: propertyDetails,
      amenities,
      pricing: pricingOthers,
      photos: photosVideos,
    },
    setSingle: {
      details: (update) => dispatch({ type: "detailsSet", update }),
      amenities: (update) => dispatch({ type: "amenitiesSet", update }),
      pricing: (update) => dispatch({ type: "pricingSet", update }),
      photos: (update) => dispatch({ type: "photosSet", update }),
      project: (update) => dispatch({ type: "projectSet", update }),
    },
    project: projectDetails,
    anchors: {
      possession: draft.possessionDatePastAnchor,
      availableFrom: draft.availableFromPastAnchor,
    },
    existingMediaCount: existingMedia.length,
    filterDetailsErrors: (errors, subType) =>
      withoutHiddenDetailsErrors(
        errors,
        showBuilderFields,
        showBuilderFields && getBhkAreaTabs(projectDetails, propertyType, subType).length > 0,
      ),
    filterPricingErrors: (errors) => withoutHiddenPricingErrors(errors, showBuilderFields),
  });
  const isMultiSubType = subForms.isMulti;

  // Price Inclusion is the only per sub type block of the builder pricing step
  const pricingTabs = subForms.tabs.filter(
    (tab) => getFormConfig("sale", propertyType, tab.id, true)?.pricing.priceInclusion ?? true,
  );
  const activePricingTabId = pricingTabs.some((tab) => tab.id === subForms.activeTabId)
    ? subForms.activeTabId
    : (pricingTabs[0]?.id ?? "");

  // Prefill every step once the property being edited has loaded
  useEffect(() => {
    if (!editDetail) {
      return;
    }

    const mapped = mapDetailToForm(editDetail);
    dispatch({ type: "draftRestored", form: mapped.form });
    subForms.restore(mapped.tabs);
    if (mapped.postingAs === "builder") {
      setPostingAs("builder");
    }
    // Runs once per loaded property; restore only sets state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDetail]);

  // Read by the draft hook at save time, so it always sees the latest form values
  const getDraftInput = (): SaveDraftInput => ({
    currentStep,
    formData: createDraftFormData({
      form: {
        listingType,
        propertyType,
        propertySubTypes,
        addressLocation,
        propertyDetails,
        amenities,
        pricingOthers,
        projectDetails,
        photosVideos,
      },
      postingAs,
      tabs: subForms.getSnapshot(),
    }),
  });

  const requestedStep = useRef<number | null>(null);

  const serverDraft = usePostPropertyDraft({
    token,
    scope,
    enabled: !isEditMode,
    getInput: getDraftInput,
    // The URL can lag behind a step change, so the requested step wins
    onCreated: (draftId) => {
      const params = new URLSearchParams(window.location.search);
      params.set("draft", draftId);
      if (requestedStep.current !== null) {
        if (requestedStep.current > 1) {
          params.set("step", String(requestedStep.current));
        } else {
          params.delete("step");
        }
      }
      router.replace(`${basePath}?${params.toString()}`, { scroll: false });
    },
  });

  // Files go to the draft of a new property, or straight to the listing that is being edited
  const { ensureDraftId } = serverDraft;
  // Project wide files (brochure, floor plans) live on the first sub type of a multi sub type post
  const editListings = editDetail?.payload.listings;
  const leadPropertyId = editListings?.[0]?.propertyId ?? editId;
  const mediaUploader = useMemo(
    () =>
      leadPropertyId
        ? createPropertyMediaUploader({ propertyId: leadPropertyId, scope, getToken: () => token })
        : createDraftMediaUploader({ scope, getToken: () => token, ensureDraftId }),
    [leadPropertyId, scope, token, ensureDraftId],
  );
  // Photos of each sub type are stored on the property posted with that sub type
  const subTypeUploaders = useMemo(
    () =>
      Object.fromEntries(
        (editListings ?? []).flatMap(({ propertyId, propertySubType }) =>
          propertyId
            ? [[propertySubType, createPropertyMediaUploader({ propertyId, scope, getToken: () => token })]]
            : [],
        ),
      ),
    [editListings, scope, token],
  );
  const getMediaUploader = (subType: string) => subTypeUploaders[subType] ?? mediaUploader;

  const requestedDraftId = useRef<string | null>(null);
  const [settledDraftId, setSettledDraftId] = useState<string | null>(null);

  // A draft created in this session is already in state, so only ?draft= from a link is loaded
  const isRestoringDraft =
    Boolean(draftParam) &&
    !isEditMode &&
    !(isAuthReady && !token) &&
    settledDraftId !== draftParam &&
    serverDraft.draftId !== draftParam;

  // Resume a saved draft from ?draft=<id>
  useEffect(() => {
    if (!draftParam || isEditMode || !token) {
      return;
    }
    if (serverDraft.draftId === draftParam || requestedDraftId.current === draftParam) {
      return;
    }

    requestedDraftId.current = draftParam;
    const startFresh = (message: string) => {
      showToast(message, "error");
      router.replace(basePath, { scroll: false });
    };

    getDraft(draftParam, token, scope)
      .then(({ draft: savedDraft }) => {
        const restored = hydrateFormState(savedDraft.formData);
        if (!restored) {
          startFresh("This draft can no longer be opened. Starting a new form.");
          return;
        }

        dispatch({ type: "draftRestored", form: restored.form });
        subForms.restore(restored.tabs);
        setPostingAs(restored.postingAs);
        serverDraft.adopt(savedDraft.id);

        // Previews arrive in the background; the files themselves are already attached
        void loadDraftPreviews(
          restored,
          (fileName) => fetchDraftFilePreview(savedDraft.id, fileName, token, scope),
          {
            updatePhotos: (update) => {
              dispatch({ type: "photosSet", update });
              subForms.mapPhotos(update);
            },
            updateProject: (update) => dispatch({ type: "projectSet", update }),
          },
        );

        if (!searchParams.get("step") && savedDraft.currentStep > 1) {
          const params = new URLSearchParams({ draft: savedDraft.id, step: String(savedDraft.currentStep) });
          router.replace(`${basePath}?${params.toString()}`, { scroll: false });
        }
      })
      .catch(() => startFresh("This draft could not be found. Starting a new form."))
      .finally(() => setSettledDraftId(draftParam));
  }, [draftParam, isEditMode, token, scope, basePath, serverDraft, subForms, searchParams, router, showToast]);

  // Every step change stores the form, so leaving and coming back loses nothing
  const goToStep = (step: number, { save = true }: { save?: boolean } = {}) => {
    const params = new URLSearchParams();
    if (editId) params.set("edit", editId);
    const savedDraftId = serverDraft.draftId ?? draftParam;
    if (savedDraftId && !isEditMode) params.set("draft", savedDraftId);
    if (step > 1) params.set("step", String(step));

    requestedStep.current = step;
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath, { scroll: false });

    if (save) {
      void serverDraft.save(step);
    }
  };

  const pendingInvalidFocus = useRef(false);
  const [invalidAttempt, setInvalidAttempt] = useState(0);

  const requestInvalidFieldFocus = () => {
    pendingInvalidFocus.current = true;
    setInvalidAttempt((attempt) => attempt + 1);
  };

  // Runs after render so the errors, the tab and the step are already on screen
  useEffect(() => {
    if (pendingInvalidFocus.current && focusFirstInvalidField()) {
      pendingInvalidFocus.current = false;
    }
  }, [invalidAttempt, currentStep]);

  const replaceErrors = (errors: Partial<DraftErrors>) =>
    dispatch({ type: "errorsReplaced", errors });

  const mergeBuilderErrors = (errors: BuilderFieldErrors) =>
    dispatch({ type: "builderErrorsMerged", errors });

  const validateSingleDetails = () =>
    withoutHiddenDetailsErrors(
      validatePropertyDetails(propertyDetails, {
        listingType,
        propertyType,
        subType: propertySubType,
        possessionDatePastAnchor: draft.possessionDatePastAnchor || undefined,
        availableFromPastAnchor: draft.availableFromPastAnchor || undefined,
        builder: showBuilderFields,
      }),
      showBuilderFields,
      showBuilderFields && getBhkAreaTabs(projectDetails, propertyType, propertySubType).length > 0,
    );

  const validateBhkAreas = (): BuilderFieldErrors => ({
    ...(showBuilderFields && validateAvailableSizes(projectDetails, propertyType, propertySubTypes)),
    ...(showBuilderFields &&
    getBhkAreaErrorSubTypes(projectDetails, propertyType, propertySubTypes).length > 0
      ? { bhkAreas: "Please complete the area details of every BHK" }
      : {}),
  });

  const validateSingleAmenities = () =>
    validateAmenities(amenities, propertyType, {
      listingType,
      subType: propertySubType,
      builder: showBuilderFields,
      optionalAmenities,
    });

  // Files that are still uploading or failed would be missing from the posted property
  const getUploadBlocker = (): string => {
    const photoSets = isMultiSubType
      ? subForms.tabs.map((tab) => subForms.getPhotos(tab.id))
      : [photosVideos];

    const projectFiles = showBuilderFields
      ? [...projectDetails.brochureImages, ...projectDetails.floorPlans]
      : [];

    if (photoSets.some(hasUploadingMedia) || projectFiles.some(({ status }) => status === "uploading")) {
      return UPLOADING_MESSAGE;
    }
    if (photoSets.some(hasFailedMedia) || projectFiles.some(({ status }) => status === "error")) {
      return FAILED_UPLOADS_MESSAGE;
    }
    return "";
  };

  const getSinglePhotosError = () =>
    getUploadBlocker() ||
    (arePhotosRequired(propertyType, { listingType, subType: propertySubType }) &&
    getTotalMediaCount(photosVideos) + existingMedia.length === 0
      ? MISSING_PHOTOS_MESSAGE
      : "");

  const clearConstructionProgressPhotos = () => {
    revokeConstructionProgressPreviews(photosVideos);
    dispatch({ type: "constructionProgressCleared" });
    subForms.mapPhotos((photos) => {
      revokeConstructionProgressPreviews(photos);
      return withoutConstructionProgress(photos);
    });
  };

  const handleProjectDetailsChange = <K extends keyof ProjectDetailsValues>(
    field: K,
    value: ProjectDetailsValues[K],
  ) => {
    dispatch({ type: "projectDetailsChanged", field, value });

    // Construction Progress photos only exist for these project types
    if (field === "projectType" && !showsConstructionProgress(String(value))) {
      clearConstructionProgressPhotos();
    }
  };

  // Only the builder form differs, so the other two keep what was already filled
  const handlePostingAsChange = (next: PostingAsId) => {
    if ((next === "builder") !== (postingAs === "builder")) {
      subForms.reset();
      dispatch({ type: "draftReset" });
      goToStep(1, { save: false });
    }
    setPostingAs(next);
  };

  const handleListingTypeChange = (next: ListingTypeId) =>
    dispatch({ type: "listingTypeChanged", listingType: next });

  const handlePropertyTypeChange = (next: PropertyTypeId) => {
    if (next === propertyType) {
      return;
    }
    subForms.reset();
    dispatch({ type: "propertyTypeChanged", propertyType: next });
  };

  const handleSubTypeChange = (next: string) => {
    if (next === propertySubType) {
      return;
    }
    subForms.reset();
    dispatch({ type: "subTypeChanged", subType: next });
  };

  // Builder selects many sub types; each keeps its own details, amenities, photos and pricing
  const handleSubTypesChange = (next: string[]) => {
    if (propertySubTypes.length === 1 && next.length === 1) {
      handleSubTypeChange(next[0]);
      return;
    }

    subForms.changeSelection(next);
    dispatch({ type: "subTypesChanged", subTypes: next });
  };

  const handleAddressChange = <K extends keyof AddressLocationValues>(
    field: K,
    value: AddressLocationValues[K],
  ) => dispatch({ type: "addressChanged", field, value });

  const handleDetailsChange = <K extends keyof PropertyDetailsValues>(
    field: K,
    value: PropertyDetailsValues[K],
  ) => dispatch({ type: "detailsChanged", field, value });

  const handleAmenitiesChange = <K extends keyof AmenitiesValues>(
    field: K,
    value: AmenitiesValues[K],
  ) => dispatch({ type: "amenitiesChanged", field, value });

  const handlePricingChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => dispatch({ type: "pricingChanged", field, value });

  // Charges and assured return are project wide, so every tab gets the same value
  const handleAllPricingChange = <K extends keyof PricingOthersValues>(
    field: K,
    value: PricingOthersValues[K],
  ) => {
    if (field === "assuredReturn") {
      mergeBuilderErrors({ assuredReturn: undefined });
    }
    subForms.changePricingAll(field, value);
  };

  const handlePhotosChange = (photos: PhotosVideosValues) =>
    dispatch({ type: "photosChanged", photos });

  const handleRemoveExistingMedia = (mediaId: string) =>
    dispatch({ type: "existingMediaRemoved", mediaId });

  const handleBasicDetailsNext = () => {
    const errors = validateAddressLocation(addressLocation, addressValidationOptions);
    replaceErrors({ addressLocationErrors: errors });

    if (hasAddressLocationErrors(errors)) {
      requestInvalidFieldFocus();
      return;
    }

    goToStep(2);
  };

  const handlePropertyDetailsNext = () => {
    if (isMultiSubType) {
      const hasTabErrors = subForms.validateStep("details");
      const projectErrors = {
        ...validateBuilderProjectType(projectDetails, builderConfig),
        ...validateBhkAreas(),
      };

      if (
        hasTabErrors ||
        projectErrors.projectType ||
        projectErrors.bhkAreas ||
        projectErrors.availableSizes
      ) {
        mergeBuilderErrors({ ...CLEARED_SIZE_ERRORS, ...projectErrors });
        requestInvalidFieldFocus();
        return;
      }

      mergeBuilderErrors(CLEARED_SIZE_ERRORS);
      goToStep(3);
      return;
    }

    const errors = validateSingleDetails();
    const projectErrors: BuilderFieldErrors = showBuilderFields
      ? { ...validateBuilderProjectType(projectDetails, builderConfig), ...validateBhkAreas() }
      : {};

    if (
      hasPropertyDetailsErrors(errors) ||
      projectErrors.projectType ||
      projectErrors.bhkAreas ||
      projectErrors.availableSizes
    ) {
      replaceErrors({ propertyDetailsErrors: errors });
      mergeBuilderErrors({ ...CLEARED_SIZE_ERRORS, ...projectErrors });
      requestInvalidFieldFocus();
      return;
    }

    replaceErrors({ propertyDetailsErrors: {} });
    mergeBuilderErrors(CLEARED_SIZE_ERRORS);
    goToStep(3);
  };

  const handleAmenitiesNext = () => {
    if (isMultiSubType) {
      if (subForms.validateStep("amenities")) {
        requestInvalidFieldFocus();
        return;
      }

      goToStep(4);
      return;
    }

    const errors = validateSingleAmenities();
    replaceErrors({ amenitiesErrors: errors });

    if (hasAmenitiesErrors(errors)) {
      requestInvalidFieldFocus();
      return;
    }

    goToStep(4);
  };

  const handlePhotosNext = () => {
    if (isMultiSubType) {
      const uploadBlocker = getUploadBlocker();
      if (uploadBlocker) {
        showToast(uploadBlocker, "error");
        return;
      }

      if (subForms.validateStep("photos")) {
        requestInvalidFieldFocus();
        return;
      }

      goToStep(5);
      return;
    }

    const photosError = getSinglePhotosError();
    replaceErrors({ photosError });

    if (photosError) {
      requestInvalidFieldFocus();
      return;
    }

    goToStep(5);
  };

  // Each sub type tab has its own assured return
  const validateTabsBuilderPricing = (): BuilderFieldErrors =>
    subForms.tabs.reduce<BuilderFieldErrors>(
      (errors, tab) =>
        errors.assuredReturn
          ? errors
          : validateBuilderPricing(
              subForms.getPricing(tab.id),
              getBuilderConfig(propertyType, tab.id),
            ),
      {},
    );

  // Returns the earliest step with an error, or null when the whole form is valid
  const validateWholeForm = (): number | null => {
    const address = validateAddressLocation(addressLocation, addressValidationOptions);
    const details = isMultiSubType ? {} : validateSingleDetails();
    const builder: BuilderFieldErrors = showBuilderFields
      ? {
          ...validateBuilderProjectType(projectDetails, builderConfig),
          ...validateBhkAreas(),
          ...(isMultiSubType
            ? validateTabsBuilderPricing()
            : validateBuilderPricing(pricingOthers, builderConfig)),
        }
      : {};
    const amenitiesErrors = isMultiSubType ? {} : validateSingleAmenities();
    const pricing = isMultiSubType
      ? {}
      : withoutHiddenPricingErrors(
          validatePricingOthers(pricingOthers, listingType, propertyType, propertySubType),
          showBuilderFields,
        );
    const photos = isMultiSubType ? "" : getSinglePhotosError();

    // Later steps run first so the tab of the earliest failing step stays open
    const tabs = isMultiSubType
      ? {
          pricing: subForms.validateStep("pricing"),
          photos: subForms.validateStep("photos"),
          amenities: subForms.validateStep("amenities"),
          details: subForms.validateStep("details"),
        }
      : null;

    replaceErrors({
      addressLocationErrors: address,
      propertyDetailsErrors: details,
      amenitiesErrors,
      pricingOthersErrors: pricing,
      photosError: photos,
      builderErrors: builder,
    });

    return resolveFirstInvalidStep({
      address,
      details,
      amenities: amenitiesErrors,
      pricing,
      photos,
      builder,
      tabs,
    });
  };

  const buildPayload = () =>
    buildPropertyPayload({
      listingType,
      propertyType,
      address: addressLocation,
      builderProject: showBuilderFields ? projectDetails : undefined,
      postingAsBuilder: isStaff && postingAs === "builder",
      listings: isMultiSubType
        ? subForms.tabs.map((tab) => ({
            subType: tab.id,
            details: subForms.getDetails(tab.id),
            amenities: subForms.getAmenities(tab.id),
            pricing: subForms.getPricing(tab.id),
            photos: subForms.getPhotos(tab.id),
            project: showBuilderFields ? subForms.getProject(tab.id) : undefined,
          }))
        : [
            {
              subType: propertySubType,
              details: propertyDetails,
              amenities,
              pricing: pricingOthers,
              photos: photosVideos,
              project: showBuilderFields ? projectDetails : undefined,
            },
          ],
    });

  // The backend checks everything again; its field errors are shown where the field lives
  const handleSubmitFailure = (error: unknown) => {
    if (isUnauthorizedError(error)) {
      showToast("Your session has expired. Please log in again.", "error");
      return;
    }

    if (error instanceof ApiError && error.fields) {
      const backendErrors = resolveBackendErrors(error.fields, { isMulti: isMultiSubType });
      if (backendErrors.step !== null) {
        replaceErrors({
          addressLocationErrors: backendErrors.addressLocationErrors,
          propertyDetailsErrors: backendErrors.propertyDetailsErrors,
          amenitiesErrors: backendErrors.amenitiesErrors,
          pricingOthersErrors: backendErrors.pricingOthersErrors,
          photosError: backendErrors.photosError,
        });
        goToStep(backendErrors.step);
        showToast(backendErrors.firstMessage, "error");
        return;
      }
    }

    showToast(getSubmitErrorMessage(error), "error");
  };

  const editedStatus = editDetail?.property.status;
  // Admins can only publish or close the listings they created themselves
  const isAdminOwnedEdit = isAdmin && editDetail?.source === "admin";
  const submitAfterEditStatuses = isAdmin ? ADMIN_SUBMIT_AFTER_EDIT_STATUSES : SUBMIT_AFTER_EDIT_STATUSES;
  // A new listing, or an edited one in a status that allows it, goes live or to review when saved
  const submitsOnSave =
    !editId || ((!isAdmin || isAdminOwnedEdit) && submitAfterEditStatuses.includes(editedStatus as PropertyStatus));
  // Only a new property or one that is still a draft can be kept as a draft
  const canSaveAsDraft = !editId || editedStatus === "draft";
  const canClose = isAdminOwnedEdit && editedStatus === "published";
  const submittedMessage = isAdmin ? PUBLISHED_MESSAGE : SUBMITTED_MESSAGE;

  const handleSubmit = async (mode: SaveMode = "submit") => {
    if (draft.isSubmitting) {
      return;
    }

    const firstInvalidStep = validateWholeForm();
    if (firstInvalidStep !== null) {
      if (firstInvalidStep !== currentStep) {
        goToStep(firstInvalidStep);
      }
      requestInvalidFieldFocus();
      showToast(
        "Some required fields are still empty. Please check the highlighted fields.",
        "error",
      );
      return;
    }

    if (!token) {
      showToast("Please log in to post your property.", "error");
      return;
    }

    dispatch({ type: "submittingChanged", isSubmitting: true });
    try {
      if (editId) {
        await updateProperty(editId, buildPayload(), token, scope);
        const sendForReview = mode === "submit" && submitsOnSave;
        if (sendForReview) {
          await submitProperty(editId, token, scope);
        }
        showToast(sendForReview ? submittedMessage : "Your changes have been saved.", "success");
        router.push(managePath);
        return;
      }

      // The draft only needs to exist; the listing is built from the payload, not from the saved form
      const draftId = await serverDraft.ensureDraftId();
      if (!draftId) {
        showToast("We could not save your files. Please try again.", "error");
        return;
      }

      await completeDraft(draftId, buildPayload(), { submit: mode === "submit" }, token, scope);
      // The draft is gone now, so the ?draft= loader must not look it up again
      requestedDraftId.current = draftId;
      serverDraft.adopt(null);
      showToast(mode === "submit" ? submittedMessage : "Your property has been saved as a draft.", "success");
      router.push(createdPath);
    } catch (error) {
      handleSubmitFailure(error);
    } finally {
      dispatch({ type: "submittingChanged", isSubmitting: false });
    }
  };

  const handleClose = async () => {
    if (!editId || !token || draft.isSubmitting) {
      return;
    }

    dispatch({ type: "submittingChanged", isSubmitting: true });
    try {
      await closeProperty(editId, token, scope);
      showToast("The property has been closed.", "success");
      router.push(managePath);
    } catch (error) {
      showToast(getSubmitErrorMessage(error), "error");
    } finally {
      dispatch({ type: "submittingChanged", isSubmitting: false });
    }
  };

  return {
    currentStep,
    isEditMode,
    canSaveAsDraft,
    submitsOnSave,
    canClose,
    isAdmin,
    editStatus: {
      isBlocking:
        isRestoringDraft || (isEditMode && (isLoadingEdit || Boolean(editError) || !editDetail)),
      error: editError,
    },
    draft,
    serverDraft,
    mediaUploader,
    getMediaUploader,
    staff: {
      isStaff,
      postingAs,
      changePostingAs: handlePostingAsChange,
    },
    derived: {
      propertySubType,
      isRent,
      showBuilderFields,
      optionalAmenities,
      builderConfig,
      addressValidationOptions,
      isMultiSubType,
      activeTabId: subForms.activeTabId,
      pricingTabs,
      activePricingTabId,
    },
    layout,
    subForms,
    handlers: {
      goBack: () => goToStep(currentStep - 1),
      changeListingType: handleListingTypeChange,
      changePropertyType: handlePropertyTypeChange,
      changeSubType: handleSubTypeChange,
      changeSubTypes: handleSubTypesChange,
      changeAddress: handleAddressChange,
      changeDetails: handleDetailsChange,
      changeAmenities: handleAmenitiesChange,
      changePricing: handlePricingChange,
      changeAllPricing: handleAllPricingChange,
      changeProjectDetails: handleProjectDetailsChange,
      changePhotos: handlePhotosChange,
      removeExistingMedia: handleRemoveExistingMedia,
      submitBasicDetails: handleBasicDetailsNext,
      submitPropertyDetails: handlePropertyDetailsNext,
      submitAmenities: handleAmenitiesNext,
      submitPhotos: handlePhotosNext,
      submit: () => handleSubmit("submit"),
      saveAsDraft: () => handleSubmit("draft"),
      close: handleClose,
    },
  };
}

export type PostPropertyForm = ReturnType<typeof usePostPropertyForm>;
