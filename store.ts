
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, UserProfile, MandiItem, WalletTransaction, WeatherData } from './types';

export interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  ratingCount: number;
  experience: number;
  jobsCompleted: number;
  bio?: string;
  distance: string;
  price: string;
  priceValue: number;
  phone: string;
  vehicleType?: 'tractor' | 'pickup' | 'truck' | 'auto' | 'bike' | 'car' | 'tempo' | 'shared';
  workerType?: 'farm' | 'electrician' | 'plumber' | 'carpenter' | 'mason' | 'mechanic' | 'cleaner' | 'general';
  medicalType?: 'hospital' | 'clinic' | 'pharmacy' | 'doctor' | 'health_worker';
  specialization?: string;
  capacity?: string;
  capacityValue?: number;
  isAvailable: boolean;
  availabilityStatus?: string;
  verified: boolean;
  coordinates: { lat: number; lng: number };
  tags?: string[];
}

export interface Notification {
  id: string;
  type: 'mandi' | 'service' | 'emergency' | 'reward' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionPath?: string;
}

export interface EmergencyRequest {
  id: string;
  type: 'ambulance' | 'police' | 'fire';
  status: 'Pending' | 'Dispatched' | 'Arriving' | 'Resolved';
  timestamp: string;
  lat: number;
  lng: number;
  responderName?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  role: 'user' | 'ai' | 'provider' | 'member';
}

export interface ChatThread {
  id: string;
  title: string;
  type: 'community' | 'direct';
  lastMessage?: string;
  unreadCount: number;
  avatar?: string;
  participants: string[];
  messages: ChatMessage[];
}

export interface BidEntry {
  id: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  isUser: boolean;
}

export interface MandiListing {
  id: string;
  sellerId: string;
  sellerName: string;
  cropName: string;
  category: 'Grains' | 'Vegetables' | 'Fruits' | 'Pulses' | 'Others';
  price: number; 
  startingPrice?: number;
  quantity: string;
  image: string;
  location: string;
  status: 'active' | 'sold' | 'expired';
  type: 'fixed' | 'auction';
  endTime?: string;
  bidsCount?: number;
  bidHistory?: BidEntry[];
}

export interface MandiHistoryEntry {
  id: string;
  type: 'buy' | 'sell' | 'bid';
  cropName: string;
  price: number;
  quantity: string;
  date: string;
  status: string;
}

export interface ServiceBooking {
  id: string;
  providerId: string;
  providerName: string;
  category: string;
  date: string;
  status: 'Pending' | 'Accepted' | 'In Progress' | 'Completed' | 'Cancelled';
  amount: number;
  pickup?: string;
  drop?: string;
  patientName?: string;
  concern?: string;
  paymentMethod?: 'wallet' | 'cash';
  rating?: number;
  jobDescription?: string;
  durationHours?: number;
  liveLocation?: { lat: number; lng: number };
}

export interface PopupMessage {
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  setKycStatus: (status: UserProfile['kycStatus']) => void;
  
  walletBalance: number;
  transactions: WalletTransaction[];
  addTransaction: (tx: Omit<WalletTransaction, 'id' | 'date'>) => void;
  
  mandiItems: MandiItem[];
  addMandiItem: (item: MandiItem) => void;
  
  mandiListings: MandiListing[];
  addMandiListing: (listing: MandiListing) => void;
  removeMandiListing: (id: string) => void;
  placeBid: (listingId: string, amount: number, bidderName: string, isUser: boolean) => void;

  mandiHistory: MandiHistoryEntry[];
  addMandiHistoryEntry: (entry: Omit<MandiHistoryEntry, 'id' | 'date'>) => void;

  serviceBookings: ServiceBooking[];
  addServiceBooking: (booking: Omit<ServiceBooking, 'id' | 'date'>) => void;
  updateBookingStatus: (id: string, status: ServiceBooking['status']) => void;
  updateBookingLocation: (id: string, lat: number, lng: number) => void;
  cancelBooking: (id: string) => void;
  rateBooking: (id: string, rating: number) => void;

  activeEmergency: EmergencyRequest | null;
  triggerEmergency: (type: EmergencyRequest['type'], lat: number, lng: number) => void;
  cancelEmergency: () => void;
  updateEmergencyStatus: (status: EmergencyRequest['status']) => void;

  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  providers: Provider[];
  
  isOffline: boolean;
  setOffline: (status: boolean) => void;
  
  currentVillage: string;
  setVillage: (name: string) => void;

  threads: ChatThread[];
  addMessage: (threadId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  createDirectThread: (providerId: string, providerName: string) => void;

  weather: WeatherData | null;
  setWeather: (weather: WeatherData) => void;

  popup: PopupMessage | null;
  showPopup: (popup: PopupMessage | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      
      user: null,
      setUser: (user) => set({ user }),
      updateUserProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
        currentVillage: updates.village || state.currentVillage
      })),
      setKycStatus: (kycStatus) => set((state) => ({
        user: state.user ? { ...state.user, kycStatus } : null
      })),
      
      walletBalance: 250,
      transactions: [{ id: '1', type: 'credit', amount: 250, description: 'Signup Bonus', date: new Date().toISOString() }],
      addTransaction: (tx) => set((state) => {
        const newTx = { ...tx, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() };
        const newBalance = tx.type === 'credit' ? state.walletBalance + tx.amount : state.walletBalance - tx.amount;
        return { transactions: [newTx, ...state.transactions], walletBalance: newBalance };
      }),
      
      mandiItems: [
        { id: '1', name: 'Wheat (कनक)', price: 2125, unit: 'Quintal', trend: 'up', lastUpdated: new Date().toISOString() },
        { id: '2', name: 'Mustard (सरसों)', price: 5450, unit: 'Quintal', trend: 'down', lastUpdated: new Date().toISOString() },
        { id: '3', name: 'Cotton (कपास)', price: 7200, unit: 'Quintal', trend: 'stable', lastUpdated: new Date().toISOString() },
      ],
      addMandiItem: (item) => set((state) => ({ mandiItems: [item, ...state.mandiItems] })),
      
      mandiListings: [
        { id: 'l1', sellerId: 'u1', sellerName: 'Ramesh Kumar', cropName: 'Organic Wheat', category: 'Grains', price: 2350, quantity: '40 Qtls', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400', location: 'Near Station', status: 'active', type: 'fixed' },
        { 
          id: 'l2', 
          sellerId: 'u2', 
          sellerName: 'Suresh Farmer', 
          cropName: 'Premium Basmati', 
          category: 'Grains', 
          price: 4200, 
          startingPrice: 3800, 
          quantity: '15 Qtls', 
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400', 
          location: 'Sector 4', 
          status: 'active', 
          type: 'auction', 
          endTime: new Date(Date.now() + 1800000).toISOString(), 
          bidsCount: 2,
          bidHistory: [
            { id: 'b1', bidderName: 'Harish', amount: 3900, timestamp: new Date(Date.now() - 600000).toISOString(), isUser: false },
            { id: 'b2', bidderName: 'Amit', amount: 4200, timestamp: new Date(Date.now() - 300000).toISOString(), isUser: false },
          ]
        },
        { id: 'l3', sellerId: 'u3', sellerName: 'Kishan Singh', cropName: 'Local Tomatoes', category: 'Vegetables', price: 800, quantity: '100 Kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400', location: 'Main Mandi', status: 'active', type: 'fixed' },
      ],
      addMandiListing: (listing) => set((state) => ({ mandiListings: [listing, ...state.mandiListings] })),
      removeMandiListing: (id) => set((state) => ({ mandiListings: state.mandiListings.filter(l => l.id !== id) })),
      placeBid: (listingId, amount, bidderName, isUser) => set((state) => ({
        mandiListings: state.mandiListings.map(l => l.id === listingId ? {
          ...l,
          price: amount,
          bidsCount: (l.bidsCount || 0) + 1,
          bidHistory: [
            { id: Math.random().toString(36).substr(2, 9), bidderName, amount, timestamp: new Date().toISOString(), isUser },
            ...(l.bidHistory || [])
          ]
        } : l)
      })),

      mandiHistory: [],
      addMandiHistoryEntry: (entry) => set((state) => ({
        mandiHistory: [{ ...entry, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() }, ...state.mandiHistory]
      })),

      serviceBookings: [],
      addServiceBooking: (booking) => set((state) => ({
        serviceBookings: [{ ...booking, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString() }, ...state.serviceBookings]
      })),
      updateBookingStatus: (id, status) => set((state) => ({
        serviceBookings: state.serviceBookings.map(b => b.id === id ? { ...b, status } : b)
      })),
      updateBookingLocation: (id, lat, lng) => set((state) => ({
        serviceBookings: state.serviceBookings.map(b => b.id === id ? { ...b, liveLocation: { lat, lng } } : b)
      })),
      cancelBooking: (id) => set((state) => {
        const booking = state.serviceBookings.find(b => b.id === id);
        if (!booking || booking.status === 'Cancelled' || booking.status === 'Completed') return state;

        const updatedBookings = state.serviceBookings.map(b => b.id === id ? { ...b, status: 'Cancelled' as const } : b);

        if (booking.paymentMethod === 'wallet') {
          const refundTx: WalletTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'credit',
            amount: booking.amount,
            description: `Refund: Cancelled ${booking.category} booking`,
            date: new Date().toISOString()
          };
          return {
            serviceBookings: updatedBookings,
            transactions: [refundTx, ...state.transactions],
            walletBalance: state.walletBalance + booking.amount
          };
        }

        return { serviceBookings: updatedBookings };
      }),
      rateBooking: (id, rating) => set((state) => ({
        serviceBookings: state.serviceBookings.map(b => b.id === id ? { ...b, rating } : b)
      })),

      activeEmergency: null,
      triggerEmergency: (type, lat, lng) => set({
        activeEmergency: {
          id: Math.random().toString(36).substr(2, 9),
          type,
          status: 'Pending',
          timestamp: new Date().toISOString(),
          lat,
          lng,
          responderName: type === 'ambulance' ? 'District Hospital' : type === 'police' ? 'Local Thana' : 'Fire Unit A'
        }
      }),
      cancelEmergency: () => set({ activeEmergency: null }),
      updateEmergencyStatus: (status) => set((state) => ({
        activeEmergency: state.activeEmergency ? { ...state.activeEmergency, status } : null
      })),

      notifications: [],
      addNotification: (n) => set((state) => ({
        notifications: [{ ...n, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), isRead: false }, ...state.notifications]
      })),
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
      })),
      clearAllNotifications: () => set({ notifications: [] }),
      
      providers: [
        { 
          id: 'p1', 
          name: 'Ram Singh', 
          category: 'transport', 
          rating: 4.8, 
          ratingCount: 124,
          experience: 12,
          jobsCompleted: 850,
          bio: 'Specialist in heavy load farm transport. Available 24/7 for urgent grain transport to local mandis.',
          distance: '1.2 km', 
          price: '₹500/hr', 
          priceValue: 500, 
          phone: '9876543210', 
          vehicleType: 'tractor', 
          capacity: 'Heavy Load (55 HP)', 
          capacityValue: 3, 
          isAvailable: true, 
          availabilityStatus: 'Available Now', 
          verified: true, 
          coordinates: { lat: 40, lng: 30 },
          tags: ['Heavy Load', 'Punctual', 'Mandi Pro']
        },
        { 
          id: 'p2', 
          name: 'Harish Pickup', 
          category: 'transport', 
          rating: 4.5, 
          ratingCount: 56,
          experience: 5,
          jobsCompleted: 320,
          bio: 'Medium transport for vegetables and fruits. Clean and safe handling guaranteed.',
          distance: '2.5 km', 
          price: '₹15/km', 
          priceValue: 15, 
          phone: '9876543211', 
          vehicleType: 'pickup', 
          capacity: 'Medium Load (1.5 Ton)', 
          capacityValue: 2, 
          isAvailable: true, 
          availabilityStatus: 'Available Now', 
          verified: true, 
          coordinates: { lat: 60, lng: 70 },
          tags: ['Safe Driving', 'Clean Vehicle']
        },
        { 
          id: 'p3', 
          name: 'Arun Auto', 
          category: 'transport', 
          rating: 4.7, 
          ratingCount: 210,
          experience: 8,
          jobsCompleted: 1500,
          bio: 'Quick local transport for passengers and small goods. Very reliable.',
          distance: '0.8 km', 
          price: '₹10/km', 
          priceValue: 10, 
          phone: '9876543212', 
          vehicleType: 'auto', 
          isAvailable: true, 
          availabilityStatus: 'Available Now', 
          verified: true, 
          coordinates: { lat: 30, lng: 50 } 
        },
        { 
          id: 'w1', 
          name: 'Sunil Kumar', 
          category: 'workers', 
          rating: 4.9, 
          ratingCount: 88,
          experience: 15,
          jobsCompleted: 450,
          bio: 'Master Electrician with 15 years experience in village grid and house wiring.',
          distance: '0.6 km', 
          price: '₹200/hr', 
          priceValue: 200, 
          phone: '9876543215', 
          workerType: 'electrician', 
          isAvailable: true, 
          availabilityStatus: 'Available Now', 
          verified: true, 
          coordinates: { lat: 45, lng: 45 },
          tags: ['Master Artisan', 'Full Tools']
        },
        { 
          id: 'w2', 
          name: 'Rajendra Mason', 
          category: 'workers', 
          rating: 4.6, 
          ratingCount: 34,
          experience: 20,
          jobsCompleted: 120,
          bio: 'Experienced in house construction and repair. Specialize in brickwork.',
          distance: '1.4 km', 
          price: '₹600/day', 
          priceValue: 600, 
          phone: '9876543216', 
          workerType: 'mason', 
          isAvailable: true, 
          availabilityStatus: 'Available Now', 
          verified: true, 
          coordinates: { lat: 55, lng: 35 } 
        },
      ],
      
      isOffline: !navigator.onLine,
      setOffline: (isOffline) => set({ isOffline }),
      
      currentVillage: 'Khedi Kalan',
      setVillage: (currentVillage) => set({ currentVillage }),

      threads: [],
      addMessage: (threadId, message) => set((state) => ({
        threads: state.threads.map(t => t.id === threadId ? {
          ...t,
          messages: [...t.messages, { ...message, id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString() }],
          lastMessage: message.text
        } : t)
      })),
      createDirectThread: (providerId, providerName) => set((state) => {
        const threadId = `direct-${providerId}`;
        const existing = state.threads.find(t => t.id === threadId);
        if (existing) return state;
        const newThread: ChatThread = {
          id: threadId,
          title: providerName,
          type: 'direct',
          unreadCount: 0,
          participants: [providerId],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${providerId}`,
          messages: [
            { id: 'm-init', senderId: providerId, senderName: providerName, text: 'Hello! Thanks for booking. How can I help you?', timestamp: new Date().toISOString(), role: 'provider' }
          ]
        };
        return { threads: [newThread, ...state.threads] };
      }),

      weather: null,
      setWeather: (weather) => set({ weather }),

      popup: null,
      showPopup: (popup) => set({ popup }),
    }),
    { name: 'village-connect-storage' }
  )
);
