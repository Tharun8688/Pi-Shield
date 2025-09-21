// API base URL: prefer Vite env var, otherwise fallback to localhost:10000
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';

export default API_BASE_URL;
