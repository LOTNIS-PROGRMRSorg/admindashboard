export const adminProfile = {
  name: 'Sarah Smith',
  email: 'sarah.smith@lotnis.com',
  username: 'sarah_admin',
  phone: '+1 (555) 123-4567',
  role: 'Super Administrator',
  avatar: 'https://i.pravatar.cc/150?u=sarah',
  createdAt: '2024-01-15T08:30:00Z',
  lastLogin: '2026-06-15T09:15:00Z',
  status: 'Active'
};

export const defaultPreferences = {
  theme: 'system', // 'light', 'dark', 'system'
  dashboard: {
    showAnalyticsCards: true,
    compactTableMode: false,
    showRecentActivity: true,
    showBookingStats: true,
    defaultLanding: 'dashboard' // 'dashboard', 'reports', 'users'
  },
  notifications: {
    email: {
      newBookings: true,
      newRegistrations: false,
      newListings: true,
      reportsAndComplaints: true
    },
    dashboard: {
      systemAlerts: true,
      moderationAlerts: true,
      bookingAlerts: false
    }
  }
};
