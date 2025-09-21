// API base URL: prefer Vite env var, then legacy REACT_APP env (if used), otherwise fallback to localhost:10001
const viteUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const reactAppUrl = (process.env['REACT_APP_API_BASE_URL'] as string) || undefined;

export const API_BASE_URL = viteUrl || reactAppUrl || 'http://localhost:10001';

export default API_BASE_URL;
