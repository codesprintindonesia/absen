// src/helpers/date.helper.js

/**
 * Format date to YYYY-MM-DD string
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDate = (date) => {
  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }
  if (typeof date === 'string' && date.includes('T')) {
    return date.split('T')[0];
  }
  return date;
};

/**
 * Format date range to readable string
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {string} Formatted date range (YYYY-MM-DD - YYYY-MM-DD)
 */
export const formatDateRange = (startDate, endDate) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Check if date is valid
 * @param {Date|string} date - Date to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (date) => {
  if (date instanceof Date) {
    return !isNaN(date.getTime());
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }
  return false;
};