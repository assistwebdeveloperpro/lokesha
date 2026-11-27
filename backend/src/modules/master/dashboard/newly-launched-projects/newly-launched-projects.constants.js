// Staff post a project on behalf of a builder, so both count as builder projects
const BUILDER_LISTED_BY = ["builder", "lokesha_staff", "admin"];

const NEWLY_LAUNCHED_PROPERTY_TYPE = "residential";

const LISTED_BY_FILTERS = {
  builder: ["builder"],
  lokesha_staff: ["lokesha_staff", "admin"],
};

// Launch date of a property is the day it went live, falling back to the day it was created
const LAUNCH_DATE_SQL = "coalesce(p.published_at, p.created_at)";

const LAUNCH_PERIOD_FILTERS = {
  "1-month": `${LAUNCH_DATE_SQL} >= now() - interval '1 month'`,
  "3-months": `${LAUNCH_DATE_SQL} >= now() - interval '3 months'`,
  "6-months": `${LAUNCH_DATE_SQL} >= now() - interval '6 months'`,
  "9-months": `${LAUNCH_DATE_SQL} >= now() - interval '9 months'`,
  "1-year": `${LAUNCH_DATE_SQL} >= now() - interval '1 year'`,
  "over-1-year": `${LAUNCH_DATE_SQL} < now() - interval '1 year'`,
};

const POSSESSION_STATUSES = ["pre-launch", "under-construction", "ready-to-move"];

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;
const MAX_PROJECTS_PER_REQUEST = 100;

module.exports = {
  BUILDER_LISTED_BY,
  NEWLY_LAUNCHED_PROPERTY_TYPE,
  LISTED_BY_FILTERS,
  LAUNCH_PERIOD_FILTERS,
  POSSESSION_STATUSES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MAX_PROJECTS_PER_REQUEST,
};
