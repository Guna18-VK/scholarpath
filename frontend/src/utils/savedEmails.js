/**
 * Saved Emails Utility
 * Stores a list of emails the user chose to save in localStorage.
 * Max 10 emails stored. Most recently used appears first.
 */

const KEY = 'scholarpath_saved_emails';

/** Get all saved emails */
export const getSavedEmails = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
};

/** Save an email (moves to top if already exists) */
export const saveEmail = (email) => {
  if (!email || !email.includes('@')) return;
  const emails = getSavedEmails().filter((e) => e !== email);
  emails.unshift(email); // add to top
  localStorage.setItem(KEY, JSON.stringify(emails.slice(0, 10))); // max 10
};

/** Remove a specific email */
export const removeEmail = (email) => {
  const emails = getSavedEmails().filter((e) => e !== email);
  localStorage.setItem(KEY, JSON.stringify(emails));
};

/** Check if an email is already saved */
export const isEmailSaved = (email) => getSavedEmails().includes(email);
