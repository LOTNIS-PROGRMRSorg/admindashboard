export const reportsData = [
  {
    id: 'REP-1042',
    category: 'Fake Listing',
    reporterName: 'Alice Johnson',
    reportedEntity: 'Sunset Villa',
    submittedDate: '2026-06-14T09:23:00Z',
    priority: 'High',
    status: 'Pending',
    assignedModerator: 'Sarah Smith',
    notes: 'Reporter claims the images are from a stock photo site. Needs immediate verification.',
    reportReason: 'The photos look fake, and the host asked for payment outside the platform.'
  },
  {
    id: 'REP-1043',
    category: 'Property Damage',
    reporterName: 'John Doe (Host)',
    reportedEntity: 'Mike Williams',
    submittedDate: '2026-06-13T14:45:00Z',
    priority: 'Critical',
    status: 'Under Review',
    assignedModerator: 'David Chen',
    notes: 'Host provided photos of broken furniture. Guest denies the claim.',
    reportReason: 'Guest completely destroyed the living room sofa and broke a window.'
  },
  {
    id: 'REP-1044',
    category: 'Spam',
    reporterName: 'System Monitor',
    reportedEntity: 'User12994',
    submittedDate: '2026-06-12T11:10:00Z',
    priority: 'Low',
    status: 'Resolved',
    assignedModerator: 'Auto-Mod',
    notes: 'Account flagged for sending 50 messages to hosts in 1 hour. Account suspended.',
    reportReason: 'Automated spam detection.'
  },
  {
    id: 'REP-1045',
    category: 'Host Misconduct',
    reporterName: 'Emma Watson',
    reportedEntity: 'Downtown Loft (Host: Greg)',
    submittedDate: '2026-06-15T08:05:00Z',
    priority: 'Medium',
    status: 'Pending',
    assignedModerator: 'Unassigned',
    notes: '',
    reportReason: 'Host was rude and refused to provide the correct WiFi password.'
  },
  {
    id: 'REP-1046',
    category: 'Payment Issue',
    reporterName: 'Robert King',
    reportedEntity: 'Lotnis Payments',
    submittedDate: '2026-06-10T16:20:00Z',
    priority: 'Medium',
    status: 'Closed',
    assignedModerator: 'Finance Team',
    notes: 'Refund processed manually.',
    reportReason: 'Double charged for my booking at Oceanview Condo.'
  },
  {
    id: 'REP-1047',
    category: 'Fraud',
    reporterName: 'Lisa Ray',
    reportedEntity: 'Mountain Retreat',
    submittedDate: '2026-06-14T19:30:00Z',
    priority: 'Critical',
    status: 'Escalated',
    assignedModerator: 'Sarah Smith',
    notes: 'Host requesting wire transfer. Escalated to Trust & Safety leads.',
    reportReason: 'Host sent me a link to pay via Western Union.'
  }
];

export const flaggedListings = [
  {
    id: 'LIST-882',
    image: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=400&q=80',
    title: 'Luxury Beverly Hills Mansion',
    hostName: 'Scammy Sammy',
    reportsCount: 12,
    reason: 'Multiple reports of fake photos and off-platform payment requests.',
    status: 'Suspended',
    lastAction: 'Suspended by Auto-Mod on 2026-06-14'
  },
  {
    id: 'LIST-405',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
    title: 'Cozy City Center Apartment',
    hostName: 'Elena V.',
    reportsCount: 3,
    reason: 'Guests reporting place is much dirtier than photos.',
    status: 'Under Review',
    lastAction: 'Warning issued to host on 2026-06-12'
  },
  {
    id: 'LIST-910',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1c24240938?auto=format&fit=crop&w=400&q=80',
    title: 'Cheap Room near Airport',
    hostName: 'Airport Stays',
    reportsCount: 8,
    reason: 'Host frequently cancels last minute and relists at higher price.',
    status: 'Pending',
    lastAction: 'Reported to Trust & Safety'
  }
];

export const moderationTimeline = {
  'REP-1042': [
    { date: '2026-06-14T09:23:00Z', action: 'Report submitted by Alice Johnson', type: 'user' },
    { date: '2026-06-14T09:25:00Z', action: 'Listing flagged automatically', type: 'system' },
    { date: '2026-06-14T10:00:00Z', action: 'Moderator Sarah Smith assigned', type: 'system' },
    { date: '2026-06-14T10:15:00Z', action: 'Investigation started', type: 'admin' },
    { date: '2026-06-14T10:30:00Z', action: 'Requested additional evidence from reporter', type: 'admin' }
  ],
  'REP-1043': [
    { date: '2026-06-13T14:45:00Z', action: 'Report submitted by John Doe', type: 'user' },
    { date: '2026-06-13T15:00:00Z', action: 'David Chen assigned', type: 'system' },
    { date: '2026-06-13T16:20:00Z', action: 'Evidence photos reviewed', type: 'admin' },
    { date: '2026-06-14T09:00:00Z', action: 'Guest contacted for statement', type: 'admin' }
  ]
};

export const statsData = {
  totalReports: 128,
  pendingInvestigations: 42,
  resolvedComplaints: 856,
  flaggedListings: 46,
  suspendedAccounts: 12,
  highPriorityCases: 14
};
