// Staff post a project on behalf of a builder, so both count as builder projects
const BUILDER_LISTED_BY = ["builder", "lokesha_staff", "admin"];

const LIMELIGHT_PROPERTY_TYPE = "residential";

const LISTED_BY_FILTERS = {
  builder: ["builder"],
  lokesha_staff: ["lokesha_staff", "admin"],
};

const POSSESSION_STATUSES = ["pre-launch", "under-construction", "ready-to-move"];

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;
const MAX_PROJECTS_PER_REQUEST = 100;

module.exports = {
  BUILDER_LISTED_BY,
  LIMELIGHT_PROPERTY_TYPE,
  LISTED_BY_FILTERS,
  POSSESSION_STATUSES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_PROJECTS_PER_REQUEST,
};
