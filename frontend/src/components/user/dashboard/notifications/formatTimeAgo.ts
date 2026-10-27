const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNITS: { seconds: number; label: string }[] = [
  { seconds: YEAR, label: "year" },
  { seconds: MONTH, label: "month" },
  { seconds: WEEK, label: "week" },
  { seconds: DAY, label: "day" },
  { seconds: HOUR, label: "hour" },
  { seconds: MINUTE, label: "minute" },
];

// "2 hours ago", "6 days ago"; now is passed in so the result can be tested
export function formatTimeAgo(isoDate: string, now: Date = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  const unit = UNITS.find(({ seconds: size }) => seconds >= size);
  if (!unit) {
    return "Just now";
  }

  const count = Math.floor(seconds / unit.seconds);
  return `${count} ${unit.label}${count === 1 ? "" : "s"} ago`;
}
