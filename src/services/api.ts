import { Claim, Item, Match, Notification, ReportStats, User } from '../types';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

/**
 * HTTP helper for standard REST requests
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    const errorMsg = json.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return json.data as T;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data.user;
  },

  register: async (userData: { name: string; studentId: string; email: string; password: string }): Promise<User> => {
    const data = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    }
    return data.user;
  },

  getMe: async (): Promise<User> => {
    return request<User>('/auth/me');
  },

  logout: async (): Promise<void> => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Clean up even if network error
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  },
};

export const itemsApi = {
  getItems: async (filters?: {
    type?: string;
    category?: string;
    location?: string;
    status?: string;
    userId?: string;
    search?: string;
  }): Promise<Item[]> => {
    const params = new URLSearchParams();
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters?.location && filters.location !== 'all') params.append('location', filters.location);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Item[]>(`/items${query}`);
  },

  getItemById: async (id: string): Promise<Item | undefined> => {
    return request<Item>(`/items/${id}`);
  },

  createLostItem: async (itemData: Partial<Item>): Promise<Item> => {
    return request<Item>('/items/lost', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  createFoundItem: async (itemData: Partial<Item>): Promise<Item> => {
    return request<Item>('/items/found', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  },

  updateItem: async (id: string, updates: Partial<Item>): Promise<Item> => {
    return request<Item>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteItem: async (id: string): Promise<void> => {
    await request<void>(`/items/${id}`, {
      method: 'DELETE',
    });
  },

  updateStatus: async (id: string, status: string): Promise<Item> => {
    return request<Item>(`/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const matchesApi = {
  getMatches: async (): Promise<Match[]> => {
    return request<Match[]>('/matches');
  },

  getMatchById: async (id: string): Promise<Match | undefined> => {
    return request<Match>(`/matches/${id}`);
  },

  dismissMatch: async (id: string): Promise<void> => {
    await request<void>(`/matches/${id}/dismiss`, {
      method: 'PATCH',
    });
  },
};

export const claimsApi = {
  getClaims: async (): Promise<Claim[]> => {
    return request<Claim[]>('/claims/my');
  },

  createClaim: async (claimData: { itemId: string; message: string; proofImageUrl?: string }): Promise<Claim> => {
    return request<Claim>('/claims', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  },

  updateClaimStatus: async (id: string, status: 'approved' | 'rejected'): Promise<Claim> => {
    return request<Claim>(`/claims/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

export const notificationsApi = {
  getNotifications: async (): Promise<Notification[]> => {
    return request<Notification[]>('/notifications');
  },

  markAsRead: async (id: string): Promise<Notification> => {
    return request<Notification>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllAsRead: async (): Promise<void> => {
    await request<void>('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

export const adminApi = {
  getStats: async (): Promise<ReportStats> => {
    return request<ReportStats>('/admin/stats');
  },

  getUsers: async (): Promise<User[]> => {
    return request<User[]>('/admin/users');
  },

  updateUserRole: async (id: string, role: string): Promise<User> => {
    return request<User>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },
};

export const uploadApi = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const token = localStorage.getItem('auth_token');
    const formData = new FormData();
    formData.append('image', file);

    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error?.message || 'Failed to upload image');
    }

    return json.data as { url: string };
  },
};
