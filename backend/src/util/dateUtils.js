/**
 * Returns the current local date/time as a Date object.
 * Always uses the system local timezone.
 */
function getLocalNow() {
  return new Date();
}

/**
 * Checks if the given effective/expiry dates are active
 * based on the current local time.
 *
 * @param {string|Date} effectiveDate
 * @param {string|Date} expiryDate
 * @param {Date} [now] - optional override for "current" date (useful for testing)
 * @returns {boolean} true if now is within [effectiveDate, expiryDate]
 */
function isActiveDateRange(effectiveDate, expiryDate, now = getLocalNow()) {
  const effective = new Date(effectiveDate);
  const expiry = new Date(expiryDate);
  return effective <= now && now <= expiry;
}

module.exports = {
  getLocalNow,
  isActiveDateRange,
};
