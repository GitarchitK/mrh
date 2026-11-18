const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('mrh_auth_token') : null;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    if (isJson) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.error || `Request failed with status ${res.status}`);
    }
    if (res.status === 405) {
      throw new Error(
        'Server returned 405 (Method Not Allowed). Backend API server is not running or route rewrite is unconfigured.'
      );
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        'Backend API server is unreachable. Please ensure the backend server is running via "npm run dev".'
      );
    }
    throw new Error(`Request failed with status ${res.status}`);
  }

  if (!isJson) {
    throw new Error(
      `Received non-JSON response from ${cleanEndpoint}. Backend server may not be running.`
    );
  }

  return res.json();
}
