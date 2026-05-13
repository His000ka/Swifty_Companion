import type { User } from '../types/user';

const API_BASE = 'https://api.intra.42.fr/v2';

async function apiFetch<T>(endpoint: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (response.status === 404) throw new Error('NOT_FOUND');
  if (!response.ok) throw new Error(`API_ERROR_${response.status}`);

  return response.json() as Promise<T>;
}

export async function getUser(login: string, token: string): Promise<User> {
  return apiFetch<User>(`/users/${login}`, token);
}

export async function getMe(token: string): Promise<User> {
  return apiFetch<User>('/me', token);
}