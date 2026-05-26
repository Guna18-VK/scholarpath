/**
 * Keep-Alive Service
 * Pings the Render backend every 14 minutes to prevent cold starts.
 * Render free tier spins down after 15 minutes of inactivity.
 */

const BACKEND_HEALTH_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/health`
  : 'https://scholarpath-backend-t0ar.onrender.com/api/health';

const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

let intervalId = null;

export const startKeepAlive = () => {
  if (intervalId) return;

  const ping = async () => {
    try {
      await fetch(BACKEND_HEALTH_URL, { method: 'GET', mode: 'no-cors' });
    } catch {
      // Silent fail
    }
  };

  ping(); // immediate ping on load
  intervalId = setInterval(ping, PING_INTERVAL);
};

export const stopKeepAlive = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};
