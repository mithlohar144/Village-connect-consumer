
export type Language = 'en' | 'hi';

export type UserRole = 'user' | 'provider';

export interface UserProfile {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  village?: string;
  kycStatus: 'none' | 'pending' | 'verified';
}

export interface MandiItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  sellerName?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export interface Service {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: { day: string; temp: number; condition: string }[];
  advisory: string;
}
