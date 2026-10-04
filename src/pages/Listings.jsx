import { useState, useMemo, useEffect } from 'react';
import ListingStats from '../components/listings/ListingStats';
import ListingFilters from '../components/listings/ListingFilters';
import ListingGrid from '../components/listings/ListingGrid';
import ListingTable from '../components/listings/ListingTable';
import PropertyDrawer from '../components/listings/PropertyDrawer';
import ConfirmModal from '../components/users/ConfirmModal'; // Reusing ConfirmModal
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import styles from './Listings.module.css';

const STATUS_LABELS = {
  approved: 'Approved',
  pending: 'Pending',
  under_review: 'Pending',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

const VERIFICATION_LABELS = {
  approved: 'Verified',
  pending: 'Pending',
  under_review: 'Pending',
  rejected: 'Failed',
  suspended: 'Failed',
};

function mapListing(p) {
  return {
    id: p.id,
    title: p.name,
    hostName: p.owner_name || 'Unknown host',
    location: [p.city, p.country].filter(Boolean).join(', '),
    pricePerNight: p.price ?? 0,
    rating: p.rating ?? 0,
    status: STATUS_LABELS[p.approval_status] || p.approval_status,
    approvalStatus: p.approval_status,
    category: p.sub_type ? p.sub_type.charAt(0).toUpperCase() + p.sub_type.slice(1) : p.category,
    image: p.property_images?.[0]?.public_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    amenities: p.selected_amenities || [],
    dateListed: p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '',
    featured: p.featured,
    verificationStatus: VERIFICATION_LABELS[p.approval_status] || 'Pending',
    bookingsCount: p.bookingsCount ?? 0,
  };
}

const emptyStats = {
  totalListings: { value: 0, trend: 0, isPositive: true },
  approvedListings: { value: 0, trend: 0, isPositive: true },
  pendingApproval: { value: 0, trend: 0, isPositive: true },
  rejectedListings: { value: 0, trend: 0, isPositive: false },
};

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [statsCounts, setStatsCounts] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [loadError, setLoadError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Adjust based on grid size

  // Modals/Drawers
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyToConfirm, setPropertyToConfirm] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState(''); // 'approve' or 'reject'

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch('/admin/properties?limit=100'),
      apiFetch('/admin/properties/stats'),
    ])
      .then(([listResult, statsResult]) => {
        if (cancelled) return;
        setListings((listResult.properties || []).map(mapListing));
        setStatsCounts(statsResult);
      })
      .catch((error) => !cancelled && setLoadError(error.message));
    return () => {
      cancelled = true;
    };
  }, []);

  const listingStatsData = useMemo(() => {
    if (!statsCounts) return emptyStats;
    const total = Object.values(statsCounts).reduce((sum, n) => sum + n, 0);
    return {
      totalListings: { value: total, trend: 0, isPositive: true },
      approvedListings: { value: statsCounts.approved ?? 0, trend: 0, isPositive: true },
      pendingApproval: { value: (statsCounts.pending ?? 0) + (statsCounts.under_review ?? 0), trend: 0, isPositive: true },
      rejectedListings: { value: statsCounts.rejected ?? 0, trend: 0, isPositive: false },
    };
  }, [statsCounts]);

  // Filtering Logic
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.hostName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || listing.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || listing.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [listings, searchQuery, statusFilter, categoryFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredListings.slice(start, start + itemsPerPage);
  }, [filteredListings, currentPage, itemsPerPage]);

  useMemo(() => setCurrentPage(1), [searchQuery, statusFilter, categoryFilter]);

  // Actions
  const handleApproveClick = (property) => {
    setPropertyToConfirm(property);
    setConfirmActionType('approve');
  };

  const handleRejectClick = (property) => {
    setPropertyToConfirm(property);
    setConfirmActionType('reject');
  };

  const handleConfirmAction = () => {
    if (!propertyToConfirm) return;
    const nextApprovalStatus = confirmActionType === 'approve' ? 'approved' : 'rejected';
    apiFetch(`/admin/properties/${propertyToConfirm.id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextApprovalStatus }),
    })
      .then(() => {
        const nextStatus = confirmActionType === 'approve' ? 'Approved' : 'Rejected';
        setListings(prev => prev.map(listing => {
          if (listing.id === propertyToConfirm.id) {
            return { ...listing, status: nextStatus, approvalStatus: nextApprovalStatus };
          }
          return listing;
        }));
        if (selectedProperty && selectedProperty.id === propertyToConfirm.id) {
          setSelectedProperty(prev => ({ ...prev, status: confirmActionType === 'approve' ? 'Approved' : 'Rejected' }));
        }
      })
      .catch((error) => setLoadError(error.message))
      .finally(() => setPropertyToConfirm(null));
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Property Listings</h1>
        <p className={styles.subtitle}>Manage and moderate all property listings on the Lotnis platform.</p>
        {loadError && <p className={styles.subtitle} style={{ color: '#dc2626' }}>{loadError}</p>}
      </div>

      <ListingStats stats={listingStatsData} />

      <ListingFilters 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter}
        viewMode={viewMode} setViewMode={setViewMode}
      />

      {viewMode === 'grid' ? (
        <ListingGrid 
          listings={paginatedListings} 
          onView={(p) => setSelectedProperty(p)} 
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
        />
      ) : (
        <ListingTable 
          listings={paginatedListings} 
          onView={(p) => setSelectedProperty(p)}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
        />
      )}

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredListings.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <PropertyDrawer 
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
      />

      <ConfirmModal 
        isOpen={!!propertyToConfirm}
        onClose={() => setPropertyToConfirm(null)}
        onConfirm={handleConfirmAction}
        title={confirmActionType === 'approve' ? 'Approve Listing' : 'Reject Listing'}
        message={`Are you sure you want to ${confirmActionType} "${propertyToConfirm?.title}"?`}
        confirmText={confirmActionType === 'approve' ? 'Approve' : 'Reject'}
        isDanger={confirmActionType === 'reject'}
      />
    </div>
  );
}

