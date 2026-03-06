import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

// Send prompt to AI Firewall gateway
export const sendPrompt = async (prompt) => {
  const response = await axios.post(`${API_BASE}/prompt`, { prompt });
  return response.data;
};

// Fetch all prompt logs
export const getLogs = async () => {
  const response = await axios.get(`${API_BASE}/logs`);
  return response.data;
};

// Fetch dashboard stats
export const getStats = async () => {
  const response = await axios.get(`${API_BASE}/stats`);
  return response.data;
};

// Fetch rate limit / blocked IPs status
export const getRateLimitStatus = async () => {
  const response = await axios.get(`${API_BASE}/rate-limit-status`);
  return response.data;
};