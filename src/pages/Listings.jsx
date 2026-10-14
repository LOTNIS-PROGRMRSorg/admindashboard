import { useMemo, useState } from 'react';
import ListingStats from '../components/listings/ListingStats';
import ListingFilters from '../components/listings/ListingFilters';
import ListingGrid from '../components/listings/ListingGrid';
import ListingTable from '../components/listings/ListingTable';
import PropertyDrawer from '../components/listings/PropertyDrawer';
import ConfirmModal from '../components/users/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { listingsData as initialListings } from '../data/mockData';
import styles from './Listings.module.css';

const ITEMS_PER_PAGE = 8;

export default function Listings() {
  const [listings, setListings] = useState(initialListings);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyToConfirm, setPropertyToConfirm] = useState(null);
  const [confirmActionType, setConfirmActionType] = useState('');

  const categories = useMemo(
    () => [...new Set(listings.map((listing) => listing.category).filter(Boolean))].sort(),
    [listings],
  );

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return listings.filter((listing) => {
      const searchableFields = [listing.id, listing.title, listing.hostName, listing.location];
      const matchesSearch = !query || searchableFields.some((field) =>
        String(field ?? '').toLowerCase().includes(query),
      );
      const matchesStatus = statusFilter === 'All' || listing.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || listing.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [listings, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const page = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedListings = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredListings, page]);

  const resetPage = () => setCurrentPage(1);
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setCategoryFilter('All');
    resetPage();
  };
  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== 'All' || categoryFilter !== 'All';

  const requestAction = (property, action) => {
    setPropertyToConfirm(property);
    setConfirmActionType(action);
  };

  const closeConfirmation = () => {
    setPropertyToConfirm(null);
    setConfirmActionType('');
  };

  const confirmAction = () => {
    if (!propertyToConfirm) return;
    const nextStatus = confirmActionType === 'approve' ? 'Approved' : 'Rejected';
    setListings((current) => current.map((listing) => (
      listing.id === propertyToConfirm.id ? { ...listing, status: nextStatus } : listing
    )));
    setSelectedProperty((current) => (
      current?.id === propertyToConfirm.id ? { ...current, status: nextStatus } : current
    ));
    closeConfirmation();
  };

  const listingViewProps = {
    listings: paginatedListings,
    onView: setSelectedProperty,
    onApprove: (property) => requestAction(property, 'approve'),
    onReject: (property) => requestAction(property, 'reject'),
    hasActiveFilters,
    onClearFilters: clearFilters,
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>PROPERTY OPERATIONS</p>
          <h1 className={styles.title}>Property listings</h1>
          <p className={styles.subtitle}>Review property submissions and monitor listings across the platform.</p>
        </div>
        <span className={styles.dataNote}>Sample data · local prototype changes only</span>
      </header>

      <ListingStats listings={listings} />

      <ListingFilters
        searchQuery={searchQuery}
        setSearchQuery={(value) => { setSearchQuery(value); resetPage(); }}
        statusFilter={statusFilter}
        setStatusFilter={(value) => { setStatusFilter(value); resetPage(); }}
        categoryFilter={categoryFilter}
        setCategoryFilter={(value) => { setCategoryFilter(value); resetPage(); }}
        categories={categories}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {viewMode === 'grid' ? <ListingGrid {...listingViewProps} /> : <ListingTable {...listingViewProps} />}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filteredListings.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={(nextPage) => setCurrentPage(Math.max(1, Math.min(nextPage, Math.max(totalPages, 1))))}
      />

      <PropertyDrawer
        property={selectedProperty}
        isOpen={Boolean(selectedProperty)}
        onClose={() => setSelectedProperty(null)}
        onApprove={(property) => requestAction(property, 'approve')}
        onReject={(property) => requestAction(property, 'reject')}
      />

      <ConfirmModal
        isOpen={Boolean(propertyToConfirm)}
        onClose={closeConfirmation}
        onConfirm={confirmAction}
        title={confirmActionType === 'approve' ? 'Approve listing?' : 'Reject listing?'}
        message={`Are you sure you want to ${confirmActionType} “${propertyToConfirm?.title}”?`}
        note="This updates the local prototype only. It will not be saved to a server."
        confirmText={confirmActionType === 'approve' ? 'Approve listing' : 'Reject listing'}
        isDanger={confirmActionType === 'reject'}
      />
    </div>
  );
}
