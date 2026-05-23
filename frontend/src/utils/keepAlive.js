/**
 * Keep-Alive Service
 * Pings the Render backend every 14 minutes to prevent cold starts.
 * Render free tier spins down after 15 minutes of inactivity.
 */

const BACKEND_URL = process.env.REACT_APP_API_URL || '/api';
const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

let intervalId = null;

export const startKeepAlive = () => {
  if (intervalId) return; // already running

  const ping = async () => {
    try {
      await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
    } catch {
      // Silent fail — don't bother user
    }
  };

  // Ping immediately on start
  ping();

  // Then ping every 14 minutes
  intervalId = setInterval(ping, PING_INTERVAL);
};

export const stopKeepAlive = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
