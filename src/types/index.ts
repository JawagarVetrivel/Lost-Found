export type UserRole = 'student' | 'admin';
export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'resolved' | 'claimed';
export type MatchStatus = 'pending' | 'accepted' | 'dismissed';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  studentId: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Item {
  id: string;
  userId: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  brand: string;
  color: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  status: ItemStatus;
  createdAt: string;
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  categoryScore: number;
  locationScore: number;
  timeScore: number;
  descriptionScore: number;
  colorScore: number;
  brandScore: number;
  finalScore: number;
  status: MatchStatus;
  reasons: string[];
  
  // Hydrated fields for UI convenience (in a real app, might come from a join or separate query)
  lostItem?: Item;
  foundItem?: Item;
}

export interface Claim {
  id: string;
  itemId: string;
  userId: string;
  message: string;
  proofImage?: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'match' | 'claim' | 'system';
  createdAt: string;
  link?: string;
}

export interface ReportStats {
  totalLost: number;
  totalFound: number;
  resolved: number;
  activeMatches: number;
}
