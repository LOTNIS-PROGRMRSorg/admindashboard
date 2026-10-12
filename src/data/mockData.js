export const statisticsData = {
  totalUsers: { value: '12,450', trend: 12.5, isPositive: true },
  activeListings: { value: '1,280', trend: 5.2, isPositive: true },
  totalBookings: { value: '5,630', trend: 8.4, isPositive: true },
  monthlyRevenue: { value: '$48,900', trend: -2.1, isPositive: false },
  pendingApprovals: { value: '34', trend: 15.0, isPositive: false }, // an increase in pending might be seen as negative (more work) or just informational
  activeHosts: { value: '840', trend: 4.1, isPositive: true },
};

export const chartData = {
  revenueAndBookings: [
    { name: 'Jan', revenue: 35000, bookings: 3200 },
    { name: 'Feb', revenue: 38000, bookings: 3500 },
    { name: 'Mar', revenue: 42000, bookings: 4100 },
    { name: 'Apr', revenue: 39000, bookings: 3800 },
    { name: 'May', revenue: 45000, bookings: 4600 },
    { name: 'Jun', revenue: 48900, bookings: 5100 },
  ]
};

export const recentActivities = [
  { id: 1, text: "New property listed in Accra", time: "10 mins ago", type: "listing" },
  { id: 2, text: "User Samuel completed a booking", time: "1 hour ago", type: "booking" },
  { id: 3, text: "Property approval pending review", time: "2 hours ago", type: "approval" },
  { id: 4, text: "Host account verified", time: "4 hours ago", type: "user" },
  { id: 5, text: "Booking cancelled by user", time: "5 hours ago", type: "cancellation" },
  { id: 6, text: "New property listed in Kumasi", time: "1 day ago", type: "listing" },
];

export const recentBookings = [
  { id: 'BK-1045', guest: 'Michael Osei', property: 'Luxury Villa Accra', date: 'Oct 24, 2026', amount: '$450', status: 'Confirmed' },
  { id: 'BK-1046', guest: 'Sarah Jenkins', property: 'Cozy Studio Kumasi', date: 'Oct 24, 2026', amount: '$120', status: 'Pending' },
  { id: 'BK-1047', guest: 'David Annan', property: 'Beachfront House', date: 'Oct 23, 2026', amount: '$850', status: 'Completed' },
  { id: 'BK-1048', guest: 'Emily Chen', property: 'City Center Apartment', date: 'Oct 22, 2026', amount: '$200', status: 'Cancelled' },
  { id: 'BK-1049', guest: 'Kwame Mensah', property: 'Hilltop Retreat', date: 'Oct 22, 2026', amount: '$310', status: 'Confirmed' },
];

export const userStatsData = {
  totalUsers: { value: '12,450', trend: 12.5, isPositive: true },
  activeUsers: { value: '11,200', trend: 8.2, isPositive: true },
  suspendedUsers: { value: '124', trend: -2.1, isPositive: true }, // decrease is good
  newThisMonth: { value: '845', trend: 15.3, isPositive: true },
};

export const usersData = [
  { id: 'U-001', fullName: 'Michael Osei', username: 'mike_osei', email: 'michael.o@example.com', phone: '+233 24 123 4567', joinedDate: 'Jan 12, 2024', role: 'Guest', status: 'Active', verified: true, avatar: 'M', bookingsCount: 12, listingsCount: 0 },
  { id: 'U-002', fullName: 'Sarah Jenkins', username: 'sarahj', email: 'sarah.j@example.com', phone: '+44 7911 123456', joinedDate: 'Feb 03, 2024', role: 'Host', status: 'Active', verified: true, avatar: 'S', bookingsCount: 2, listingsCount: 4 },
  { id: 'U-003', fullName: 'David Annan', username: 'd_annan', email: 'david.a@example.com', phone: '+233 20 987 6543', joinedDate: 'Mar 15, 2024', role: 'Admin', status: 'Active', verified: true, avatar: 'D', bookingsCount: 5, listingsCount: 0 },
  { id: 'U-004', fullName: 'Emily Chen', username: 'emily_c', email: 'emily.c@example.com', phone: '+1 555 123 4567', joinedDate: 'Apr 22, 2024', role: 'Guest', status: 'Pending', verified: false, avatar: 'E', bookingsCount: 0, listingsCount: 0 },
  { id: 'U-005', fullName: 'Kwame Mensah', username: 'kmensah', email: 'kwame.m@example.com', phone: '+233 27 555 1234', joinedDate: 'May 10, 2024', role: 'Host', status: 'Suspended', verified: false, avatar: 'K', bookingsCount: 8, listingsCount: 2 },
  { id: 'U-006', fullName: 'Jessica Taylor', username: 'jess_t', email: 'jessica.t@example.com', phone: '+1 415 555 8901', joinedDate: 'Jun 01, 2024', role: 'Guest', status: 'Active', verified: true, avatar: 'J', bookingsCount: 3, listingsCount: 0 },
  { id: 'U-007', fullName: 'Samuel Yeboah', username: 'sam_y', email: 'samuel.y@example.com', phone: '+233 54 321 0987', joinedDate: 'Jun 15, 2024', role: 'Guest', status: 'Active', verified: true, avatar: 'S', bookingsCount: 15, listingsCount: 0 },
  { id: 'U-008', fullName: 'Aisha Bello', username: 'aisha_b', email: 'aisha.b@example.com', phone: '+234 80 1234 5678', joinedDate: 'Jul 04, 2024', role: 'Host', status: 'Active', verified: true, avatar: 'A', bookingsCount: 1, listingsCount: 5 },
  { id: 'U-009', fullName: 'Robert Smith', username: 'rob_smith', email: 'robert.s@example.com', phone: '+44 7700 900123', joinedDate: 'Jul 20, 2024', role: 'Guest', status: 'Suspended', verified: true, avatar: 'R', bookingsCount: 4, listingsCount: 0 },
  { id: 'U-010', fullName: 'Akua Danso', username: 'akua_d', email: 'akua.d@example.com', phone: '+233 26 444 5555', joinedDate: 'Aug 12, 2024', role: 'Host', status: 'Pending', verified: false, avatar: 'A', bookingsCount: 0, listingsCount: 1 },
  { id: 'U-011', fullName: 'John Doe', username: 'j_doe', email: 'john.doe@example.com', phone: '+1 212 555 1234', joinedDate: 'Sep 05, 2024', role: 'Guest', status: 'Active', verified: true, avatar: 'J', bookingsCount: 2, listingsCount: 0 },
  { id: 'U-012', fullName: 'Jane Smith', username: 'jane_s', email: 'jane.smith@example.com', phone: '+44 7800 123456', joinedDate: 'Oct 18, 2024', role: 'Guest', status: 'Active', verified: true, avatar: 'J', bookingsCount: 7, listingsCount: 0 },
  { id: 'U-013', fullName: 'Kofi Amoah', username: 'kofi_a', email: 'kofi.a@example.com', phone: '+233 55 111 2222', joinedDate: 'Nov 02, 2024', role: 'Host', status: 'Active', verified: true, avatar: 'K', bookingsCount: 0, listingsCount: 3 },
  { id: 'U-014', fullName: 'Linda Nartey', username: 'linda_n', email: 'linda.n@example.com', phone: '+233 24 999 8888', joinedDate: 'Dec 11, 2024', role: 'Admin', status: 'Active', verified: true, avatar: 'L', bookingsCount: 1, listingsCount: 0 },
  { id: 'U-015', fullName: 'Tom Wilson', username: 'tom_w', email: 'tom.w@example.com', phone: '+1 310 555 6789', joinedDate: 'Jan 25, 2025', role: 'Guest', status: 'Pending', verified: false, avatar: 'T', bookingsCount: 0, listingsCount: 0 },
];

export const listingStatsData = {
  totalListings: { value: '1,280', trend: 5.2, isPositive: true },
  approvedListings: { value: '920', trend: 3.1, isPositive: true },
  pendingApproval: { value: '245', trend: -1.4, isPositive: true }, // less pending is good
  rejectedListings: { value: '115', trend: 0.5, isPositive: false },
};

export const listingsData = [
  { id: 'L-101', title: 'Luxury Villa with Ocean View', hostName: 'Sarah Jenkins', location: 'Accra, Ghana', pricePerNight: 250, rating: 4.9, status: 'Approved', category: 'Villa', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', bookingsCount: 45, amenities: ['Pool', 'WiFi', 'Kitchen', 'Air Conditioning'], dateListed: 'Jan 15, 2024', featured: true, verificationStatus: 'Verified' },
  { id: 'L-102', title: 'Cozy Downtown Apartment', hostName: 'Kwame Mensah', location: 'Kumasi, Ghana', pricePerNight: 85, rating: 4.7, status: 'Approved', category: 'Apartment', image: 'https://images.unsplash.com/photo-1502672260266-1c1e5250ad99?auto=format&fit=crop&w=800&q=80', bookingsCount: 112, amenities: ['WiFi', 'Kitchen', 'Gym Access'], dateListed: 'Feb 20, 2024', featured: false, verificationStatus: 'Verified' },
  { id: 'L-103', title: 'Serene Beach House Getaway', hostName: 'Aisha Bello', location: 'Cape Coast, Ghana', pricePerNight: 150, rating: 4.8, status: 'Pending', category: 'Beach House', image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80', bookingsCount: 0, amenities: ['Beachfront', 'WiFi', 'BBQ Grill', 'Patio'], dateListed: 'Oct 24, 2026', featured: false, verificationStatus: 'Pending' },
  { id: 'L-104', title: 'Modern Studio in Osu', hostName: 'Akua Danso', location: 'Accra, Ghana', pricePerNight: 110, rating: 4.5, status: 'Rejected', category: 'Apartment', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', bookingsCount: 0, amenities: ['WiFi', 'Air Conditioning', 'Workspace'], dateListed: 'Oct 20, 2026', featured: false, verificationStatus: 'Failed' },
  { id: 'L-105', title: 'Historic Guest House', hostName: 'Kofi Amoah', location: 'Elmina, Ghana', pricePerNight: 65, rating: 4.2, status: 'Approved', category: 'Guest House', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', bookingsCount: 23, amenities: ['Breakfast Included', 'WiFi', 'Garden'], dateListed: 'Mar 10, 2024', featured: false, verificationStatus: 'Verified' },
  { id: 'L-106', title: 'Skyline Penthouse Suite', hostName: 'David Annan', location: 'Accra, Ghana', pricePerNight: 400, rating: 5.0, status: 'Approved', category: 'Apartment', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', bookingsCount: 8, amenities: ['Pool', 'Gym', 'City View', 'Concierge'], dateListed: 'Aug 05, 2024', featured: true, verificationStatus: 'Verified' },
  { id: 'L-107', title: 'Rustic Cabin Retreat', hostName: 'Sarah Jenkins', location: 'Aburi, Ghana', pricePerNight: 95, rating: 4.6, status: 'Pending', category: 'Cabin', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80', bookingsCount: 0, amenities: ['Mountain View', 'Fireplace', 'Kitchen'], dateListed: 'Oct 25, 2026', featured: false, verificationStatus: 'Pending' },
  { id: 'L-108', title: 'Boutique Hotel Room 12', hostName: 'Hotel Management', location: 'Takoradi, Ghana', pricePerNight: 130, rating: 4.4, status: 'Approved', category: 'Hotel', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', bookingsCount: 67, amenities: ['Room Service', 'Pool', 'Restaurant', 'WiFi'], dateListed: 'Jan 05, 2024', featured: false, verificationStatus: 'Verified' },
  { id: 'L-109', title: 'Spacious Family Home', hostName: 'Kwame Mensah', location: 'Tema, Ghana', pricePerNight: 180, rating: 4.8, status: 'Suspended', category: 'Villa', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80', bookingsCount: 34, amenities: ['4 Bedrooms', 'Garden', 'Garage', 'WiFi'], dateListed: 'Apr 12, 2024', featured: false, verificationStatus: 'Verified' },
  { id: 'L-110', title: 'Lakefront Eco Lodge', hostName: 'Aisha Bello', location: 'Akosombo, Ghana', pricePerNight: 210, rating: 4.9, status: 'Pending', category: 'Guest House', image: 'https://images.unsplash.com/photo-1542314831-c6a4d27ce66f?auto=format&fit=crop&w=800&q=80', bookingsCount: 0, amenities: ['Lake View', 'Canoeing', 'Solar Powered', 'Breakfast Included'], dateListed: 'Oct 26, 2026', featured: false, verificationStatus: 'Pending' },
  { id: 'L-111', title: 'Minimalist City Loft', hostName: 'Akua Danso', location: 'Accra, Ghana', pricePerNight: 125, rating: 4.3, status: 'Approved', category: 'Apartment', image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', bookingsCount: 51, amenities: ['WiFi', 'Workspace', 'Air Conditioning'], dateListed: 'May 22, 2024', featured: false, verificationStatus: 'Verified' },
  { id: 'L-112', title: 'Secluded Jungle Villa', hostName: 'Kofi Amoah', location: 'Kakum, Ghana', pricePerNight: 280, rating: 4.7, status: 'Approved', category: 'Villa', image: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=800&q=80', bookingsCount: 19, amenities: ['Pool', 'Nature Trails', 'Private Chef Optional'], dateListed: 'Jul 18, 2024', featured: true, verificationStatus: 'Verified' },
];

export const bookingStatsData = {
  totalBookings: { value: '5,630', trend: 8.4, isPositive: true },
  confirmedBookings: { value: '4,120', trend: 5.2, isPositive: true },
  cancelledBookings: { value: '315', trend: -2.1, isPositive: true }, // decrease in cancellations
  monthlyRevenue: { value: '$48,900', trend: 12.5, isPositive: true },
};

export const bookingsData = [
  {
    id: 'BKG-7829',
    guestName: 'Emily Chen',
    guestAvatar: 'E',
    guestEmail: 'emily.c@example.com',
    guestPhone: '+1 555 123 4567',
    propertyName: 'Luxury Villa with Ocean View',
    hostName: 'Sarah Jenkins',
    checkInDate: '2026-11-10',
    checkOutDate: '2026-11-15',
    guestsCount: 4,
    totalAmount: 1250,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    bookingDate: '2026-10-01',
    notes: 'Guest requested early check-in if possible.',
    timeline: [
      { time: '2026-10-01 09:30 AM', event: 'Booking created by Emily Chen' },
      { time: '2026-10-01 09:35 AM', event: 'Payment of $1250 successfully processed' },
      { time: '2026-10-01 10:15 AM', event: 'Host Sarah Jenkins confirmed reservation' },
    ]
  },
  {
    id: 'BKG-7830',
    guestName: 'Kwame Mensah',
    guestAvatar: 'K',
    guestEmail: 'kwame.m@example.com',
    guestPhone: '+233 27 555 1234',
    propertyName: 'Cozy Downtown Apartment',
    hostName: 'Kwame Mensah', // Self-booking for testing
    checkInDate: '2026-10-25',
    checkOutDate: '2026-10-28',
    guestsCount: 2,
    totalAmount: 255,
    bookingStatus: 'Completed',
    paymentStatus: 'Paid',
    bookingDate: '2026-09-15',
    notes: '',
    timeline: [
      { time: '2026-09-15 14:20 PM', event: 'Booking created' },
      { time: '2026-09-15 14:25 PM', event: 'Payment of $255 successfully processed' },
      { time: '2026-10-25 15:00 PM', event: 'Guest checked in' },
      { time: '2026-10-28 11:00 AM', event: 'Guest checked out' },
      { time: '2026-10-28 12:00 PM', event: 'Booking marked as Completed' },
    ]
  },
  {
    id: 'BKG-7831',
    guestName: 'Jessica Taylor',
    guestAvatar: 'J',
    guestEmail: 'jessica.t@example.com',
    guestPhone: '+1 415 555 8901',
    propertyName: 'Serene Beach House Getaway',
    hostName: 'Aisha Bello',
    checkInDate: '2026-12-20',
    checkOutDate: '2026-12-27',
    guestsCount: 6,
    totalAmount: 1050,
    bookingStatus: 'Pending',
    paymentStatus: 'Partially Paid',
    bookingDate: '2026-10-22',
    notes: 'Awaiting host approval. 50% deposit paid.',
    timeline: [
      { time: '2026-10-22 18:45 PM', event: 'Booking requested by Jessica Taylor' },
      { time: '2026-10-22 18:50 PM', event: 'Deposit of $525 held on card' },
    ]
  },
  {
    id: 'BKG-7832',
    guestName: 'Samuel Yeboah',
    guestAvatar: 'S',
    guestEmail: 'samuel.y@example.com',
    guestPhone: '+233 54 321 0987',
    propertyName: 'Historic Guest House',
    hostName: 'Kofi Amoah',
    checkInDate: '2026-11-05',
    checkOutDate: '2026-11-07',
    guestsCount: 1,
    totalAmount: 130,
    bookingStatus: 'Cancelled',
    paymentStatus: 'Refunded',
    bookingDate: '2026-09-30',
    notes: 'Guest cancelled due to travel plan changes.',
    timeline: [
      { time: '2026-09-30 10:00 AM', event: 'Booking created' },
      { time: '2026-09-30 10:05 AM', event: 'Payment of $130 processed' },
      { time: '2026-10-15 09:00 AM', event: 'Guest requested cancellation' },
      { time: '2026-10-15 09:30 AM', event: 'Refund of $130 initiated' },
    ]
  },
  {
    id: 'BKG-7833',
    guestName: 'Robert Smith',
    guestAvatar: 'R',
    guestEmail: 'robert.s@example.com',
    guestPhone: '+44 7700 900123',
    propertyName: 'Skyline Penthouse Suite',
    hostName: 'David Annan',
    checkInDate: '2026-10-28',
    checkOutDate: '2026-11-02',
    guestsCount: 2,
    totalAmount: 2000,
    bookingStatus: 'Ongoing',
    paymentStatus: 'Paid',
    bookingDate: '2026-08-10',
    notes: 'VIP Guest. Requested champagne on arrival.',
    timeline: [
      { time: '2026-08-10 11:20 AM', event: 'Booking created' },
      { time: '2026-08-10 11:25 AM', event: 'Payment of $2000 processed' },
      { time: '2026-10-28 14:00 PM', event: 'Guest checked in' },
    ]
  },
  {
    id: 'BKG-7834',
    guestName: 'John Doe',
    guestAvatar: 'J',
    guestEmail: 'john.doe@example.com',
    guestPhone: '+1 212 555 1234',
    propertyName: 'Boutique Hotel Room 12',
    hostName: 'Hotel Management',
    checkInDate: '2026-11-20',
    checkOutDate: '2026-11-22',
    guestsCount: 2,
    totalAmount: 260,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Failed',
    bookingDate: '2026-10-24',
    notes: 'Payment failed, sent reminder to guest.',
    timeline: [
      { time: '2026-10-24 16:00 PM', event: 'Booking created' },
      { time: '2026-10-24 16:05 PM', event: 'Payment processing failed (Insufficient funds)' },
      { time: '2026-10-24 16:10 PM', event: 'Automated payment reminder sent to guest' },
    ]
  },
  {
    id: 'BKG-7835',
    guestName: 'Jane Smith',
    guestAvatar: 'J',
    guestEmail: 'jane.smith@example.com',
    guestPhone: '+44 7800 123456',
    propertyName: 'Spacious Family Home',
    hostName: 'Kwame Mensah',
    checkInDate: '2026-12-10',
    checkOutDate: '2026-12-15',
    guestsCount: 5,
    totalAmount: 900,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    bookingDate: '2026-10-05',
    notes: '',
    timeline: [
      { time: '2026-10-05 08:30 AM', event: 'Booking created' },
      { time: '2026-10-05 08:35 AM', event: 'Payment of $900 processed' },
      { time: '2026-10-05 10:00 AM', event: 'Host accepted reservation' },
    ]
  },
  {
    id: 'BKG-7836',
    guestName: 'Michael Osei',
    guestAvatar: 'M',
    guestEmail: 'michael.o@example.com',
    guestPhone: '+233 24 123 4567',
    propertyName: 'Minimalist City Loft',
    hostName: 'Akua Danso',
    checkInDate: '2026-10-15',
    checkOutDate: '2026-10-18',
    guestsCount: 1,
    totalAmount: 375,
    bookingStatus: 'Completed',
    paymentStatus: 'Paid',
    bookingDate: '2026-09-01',
    notes: '',
    timeline: [
      { time: '2026-09-01 12:00 PM', event: 'Booking created' },
      { time: '2026-09-01 12:05 PM', event: 'Payment of $375 processed' },
      { time: '2026-10-15 15:00 PM', event: 'Guest checked in' },
      { time: '2026-10-18 11:00 AM', event: 'Guest checked out' },
      { time: '2026-10-18 12:00 PM', event: 'Booking marked as Completed' },
    ]
  },
  {
    id: 'BKG-7837',
    guestName: 'Tom Wilson',
    guestAvatar: 'T',
    guestEmail: 'tom.w@example.com',
    guestPhone: '+1 310 555 6789',
    propertyName: 'Secluded Jungle Villa',
    hostName: 'Kofi Amoah',
    checkInDate: '2026-12-28',
    checkOutDate: '2027-01-02',
    guestsCount: 2,
    totalAmount: 1400,
    bookingStatus: 'Pending',
    paymentStatus: 'Paid',
    bookingDate: '2026-10-26',
    notes: 'Awaiting host confirmation.',
    timeline: [
      { time: '2026-10-26 20:15 PM', event: 'Booking requested' },
      { time: '2026-10-26 20:20 PM', event: 'Payment of $1400 held on card' },
    ]
  },
  {
    id: 'BKG-7838',
    guestName: 'Sarah Jenkins',
    guestAvatar: 'S',
    guestEmail: 'sarah.j@example.com',
    guestPhone: '+44 7911 123456',
    propertyName: 'Lakefront Eco Lodge',
    hostName: 'Aisha Bello',
    checkInDate: '2026-11-12',
    checkOutDate: '2026-11-14',
    guestsCount: 2,
    totalAmount: 420,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    bookingDate: '2026-10-10',
    notes: '',
    timeline: [
      { time: '2026-10-10 09:00 AM', event: 'Booking created' },
      { time: '2026-10-10 09:05 AM', event: 'Payment of $420 processed' },
    ]
  }
];

// --- ANALYTICS DATA ---

export const analyticsSummaryData = {
  totalRevenue: { value: '$148,900', trend: 15.2, isPositive: true },
  monthlyRevenue: { value: '$42,500', trend: 8.5, isPositive: true },
  bookingGrowth: { value: '+18.4%', trend: 4.2, isPositive: true },
  avgOccupancy: { value: '78%', trend: 2.1, isPositive: true },
  activeUsers: { value: '4,820', trend: 12.3, isPositive: true },
  avgBookingValue: { value: '$345', trend: 1.5, isPositive: true },
  conversionRate: { value: '6.4%', trend: -0.5, isPositive: false },
  returningGuests: { value: '32%', trend: 5.8, isPositive: true },
};

export const revenueAnalyticsData = [
  { month: "Nov '25", period: '2025-11', revenue: 24000, bookings: 105 },
  { month: "Dec '25", period: '2025-12', revenue: 26500, bookings: 118 },
  { month: 'Jan', period: '2026-01', revenue: 28000, bookings: 120 },
  { month: 'Feb', period: '2026-02', revenue: 32000, bookings: 145 },
  { month: 'Mar', period: '2026-03', revenue: 38000, bookings: 180 },
  { month: 'Apr', period: '2026-04', revenue: 36000, bookings: 170 },
  { month: 'May', period: '2026-05', revenue: 45000, bookings: 210 },
  { month: 'Jun', period: '2026-06', revenue: 52000, bookings: 250 },
  { month: 'Jul', period: '2026-07', revenue: 68000, bookings: 320 },
  { month: 'Aug', period: '2026-08', revenue: 75000, bookings: 350 },
  { month: 'Sep', period: '2026-09', revenue: 62000, bookings: 290 },
  { month: 'Oct', period: '2026-10', revenue: 48900, bookings: 225 },
];

// Deterministic daily demo series for the short date-range selections.
export const dailyAnalyticsData = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 9, 12 - (29 - index)));

  return {
    date: date.toISOString().slice(0, 10),
    month: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
    revenue: 1200 + ((index * 137 + (index % 6) * 91) % 1100),
    bookings: 8 + ((index * 7 + Math.floor(index / 3)) % 17),
  };
});

export const occupancyTrendsData = [
  { name: 'Villas', value: 85, fill: '#4f46e5' },
  { name: 'Apartments', value: 72, fill: '#10b981' },
  { name: 'Hotels', value: 65, fill: '#f59e0b' },
  { name: 'Guest Houses', value: 58, fill: '#6366f1' },
];

export const bookingSourcesData = [
  { name: 'Mobile App', value: 45, fill: '#4f46e5' },
  { name: 'Desktop Web', value: 35, fill: '#10b981' },
  { name: 'Referral', value: 12, fill: '#f59e0b' },
  { name: 'Direct', value: 8, fill: '#ef4444' },
];

export const popularLocationsData = [
  { id: 1, city: 'Accra', bookings: 1245, revenue: '$85,400', growth: '+15%', occupancy: '82%' },
  { id: 2, city: 'Kumasi', bookings: 820, revenue: '$42,100', growth: '+8%', occupancy: '75%' },
  { id: 3, city: 'Cape Coast', bookings: 650, revenue: '$38,500', growth: '+22%', occupancy: '88%' },
  { id: 4, city: 'Takoradi', bookings: 430, revenue: '$25,200', growth: '+5%', occupancy: '68%' },
  { id: 5, city: 'East Legon', bookings: 390, revenue: '$45,000', growth: '+18%', occupancy: '90%' },
];

export const propertyPerformanceData = [
  { id: 'L-106', title: 'Skyline Penthouse Suite', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80', revenue: '$18,500', bookings: 42, rating: 5.0, occupancy: '94%' },
  { id: 'L-101', title: 'Luxury Villa with Ocean View', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=80', revenue: '$14,200', bookings: 45, rating: 4.9, occupancy: '88%' },
  { id: 'L-112', title: 'Secluded Jungle Villa', image: 'https://images.unsplash.com/photo-1464146072230-91cabc968266?auto=format&fit=crop&w=200&q=80', revenue: '$12,800', bookings: 19, rating: 4.7, occupancy: '85%' },
  { id: 'L-102', title: 'Cozy Downtown Apartment', image: 'https://images.unsplash.com/photo-1502672260266-1c1e5250ad99?auto=format&fit=crop&w=200&q=80', revenue: '$8,400', bookings: 112, rating: 4.7, occupancy: '92%' },
];

export const liveActivityAnalyticsData = [
  { id: 1, type: 'booking', text: 'New booking for Skyline Penthouse', time: '2 mins ago' },
  { id: 2, type: 'user', text: '3 new hosts joined in the last hour', time: '15 mins ago' },
  { id: 3, type: 'listing', text: 'Luxury Villa hit 500 lifetime views', time: '45 mins ago' },
  { id: 4, type: 'review', text: '5-star review left by Kwame Mensah', time: '1 hour ago' },
  { id: 5, type: 'booking', text: 'Booking cancelled for Historic Guest House', time: '2 hours ago' },
];
