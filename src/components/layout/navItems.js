import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  LineChart,
  FileText,
  Settings,
  SlidersHorizontal,
  BadgeCheck,
  Undo2,
  LogOut,
  Ticket,
  Wallet,
  UtensilsCrossed,
  Wrench,
  Briefcase,
  Bell,
} from 'lucide-react';

// Grouped the way the work is: who, what they sell, money, and trust. Every area that exists is linked here.
// The sidebar and the navbar's "Jump to" search both read this list, so they can never disagree.
export const navGroups = [
  { label: null, items: [{ path: '/', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'People',
    items: [
      { path: '/users', label: 'Users', icon: Users, keywords: 'guests customers accounts' },
      { path: '/hosts', label: 'Hosts', icon: BadgeCheck, keywords: 'applications verification' },
    ],
  },
  {
    label: 'Accommodation',
    items: [
      { path: '/listings', label: 'Listings', icon: Building2, keywords: 'properties spaces approve' },
      { path: '/bookings', label: 'Bookings', icon: CalendarCheck, keywords: 'reservations stays' },
      { path: '/move-outs', label: 'Move-outs', icon: LogOut, keywords: 'exits deposits disputes' },
    ],
  },
  { label: 'Events', items: [{ path: '/events', label: 'Events', icon: Ticket, keywords: 'tickets votes' }] },
  {
    label: 'Services',
    items: [
      { path: '/services', label: 'Services', icon: Wrench, keywords: 'providers photographers plumbers approve' },
      { path: '/service-jobs', label: 'Service jobs', icon: Briefcase, keywords: 'requests disputes held payments' },
    ],
  },
  {
    label: 'Money',
    items: [
      { path: '/refunds', label: 'Refunds', icon: Undo2 },
      { path: '/payouts', label: 'Payouts', icon: Wallet, keywords: 'batches transfers hosts' },
    ],
  },
  {
    label: 'Trust & insight',
    items: [
      { path: '/reports', label: 'Reports', icon: FileText, keywords: 'flags abuse complaints' },
      { path: '/analytics', label: 'Analytics', icon: LineChart, keywords: 'charts revenue' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/configuration', label: 'Configuration', icon: SlidersHorizontal, keywords: 'fees commission policies' },
      { path: '/settings', label: 'Settings', icon: Settings, keywords: 'profile security' },
    ],
  },
];

// Business lines still to be built. They get real routes (a placeholder page
// today) so each one can be switched on without touching navigation again.
export const upcomingItems = [{ path: '/food', label: 'Food', icon: UtensilsCrossed }];

export const allPages = [
  ...navGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label ?? 'Overview' }))),
  { path: '/notifications', label: 'Notifications', icon: Bell, group: 'Admin' },
  ...upcomingItems.map((i) => ({ ...i, group: 'Coming soon' })),
];
