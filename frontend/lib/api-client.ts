import { AuthService } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, ...rest } = options;
  const hasBody = body !== undefined;
  const requestHeaders = new Headers(headers);

  // Firebase Auth owns sign-in; backend requests reuse the active ID token.
  const token = await AuthService.getIdToken();

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (
    hasBody &&
    !requestHeaders.has('Content-Type') &&
    !(typeof FormData !== 'undefined' && body instanceof FormData)
  ) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: requestHeaders,
    body:
      hasBody && !(typeof FormData !== 'undefined' && body instanceof FormData)
        ? JSON.stringify(body)
        : (body as BodyInit | null | undefined),
  });

  if (!response.ok) {
    let message = 'Something went wrong';

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {}

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');

  if (!contentType?.includes('application/json')) {
    return null as T;
  }

  return response.json();
}
