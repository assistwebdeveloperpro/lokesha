const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Shifts an instant so its UTC fields read as IST wall-clock time
const toIstShifted = (date) => new Date(date.getTime() + IST_OFFSET_MS);
const fromIstShifted = (date) => new Date(date.getTime() - IST_OFFSET_MS);

const daysInMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();

// Calendar months in IST, the day is clamped (31 Jan + 1 month = 28/29 Feb)
function addMonths(startDate, months) {
  if (!Number.isInteger(months) || months < 0) throw new RangeError("months must be a non-negative integer");

  const ist = toIstShifted(startDate);
  const totalMonths = ist.getUTCMonth() + months;
  const year = ist.getUTCFullYear() + Math.floor(totalMonths / 12);
  const monthIndex = totalMonths % 12;
  const day = Math.min(ist.getUTCDate(), daysInMonth(year, monthIndex));

  const shifted = new Date(
    Date.UTC(year, monthIndex, day, ist.getUTCHours(), ist.getUTCMinutes(), ist.getUTCSeconds(), ist.getUTCMilliseconds()),
  );
  return fromIstShifted(shifted);
}

const addDays = (startDate, days) => new Date(startDate.getTime() + days * DAY_MS);

// Whole days left, rounded up, never below zero
function daysRemaining(endDate, now = new Date()) {
  return Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / DAY_MS));
}

const isExpired = (endDate, now = new Date()) => endDate.getTime() <= now.getTime();

// IST calendar date as YYYY-MM-DD
const formatIstDate = (date) => toIstShifted(date).toISOString().slice(0, 10);

// IST wall-clock time as "YYYY-MM-DD HH:mm"
const formatIstDateTime = (date) => toIstShifted(date).toISOString().slice(0, 16).replace("T", " ");

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

// True for a real calendar day, so 2026-02-31 is refused instead of rolling into March
function isValidIstDay(value) {
  if (!ISO_DAY.test(value)) return false;

  const date = new Date(`${value}T00:00:00+05:30`);
  return !Number.isNaN(date.getTime()) && formatIstDate(date) === value;
}

// The instant an IST calendar day starts
const startOfIstDay = (value) => new Date(`${value}T00:00:00+05:30`);

module.exports = {
  IST_OFFSET_MS,
  toIstShifted,
  addMonths,
  addDays,
  daysRemaining,
  isExpired,
  formatIstDate,
  formatIstDateTime,
  isValidIstDay,
  startOfIstDay,
};
