import { auth } from '@/react-app/firebase';
import { API_BASE_URL } from '@/react-app/config';

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  const fullUrl = `${API_BASE_URL}${url}`;
  return fetch(fullUrl, options);
};
