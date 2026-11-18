const NEW_ACTIVITY_WINDOW_MS = 48 * 60 * 60 * 1000;

// Activity stays flagged as new for 48 hours; now is passed in so a list shares one clock
function isNewActivity(timestamp, now = Date.now()) {
  return now - new Date(timestamp).getTime() < NEW_ACTIVITY_WINDOW_MS;
}

module.exports = { NEW_ACTIVITY_WINDOW_MS, isNewActivity };
