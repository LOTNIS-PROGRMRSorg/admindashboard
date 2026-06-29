import { useState, useMemo } from 'react';
import ListingStats from '../components/listings/ListingStats';
import ListingFilters from '../components/listings/ListingFilters';
import ListingGrid from '../components/listings/ListingGrid';
import ListingTable from '../components/listings/ListingTable';
import PropertyDrawer from '../components/listings/PropertyDrawer';
import ConfirmModal from '../components/users/ConfirmModal'; // Reusing ConfirmModal
import Pagination from '../components/common/Pagination';
import { listingsData as initialListings, listingStatsData } from '../data/mockData';
import styles from './Listings.module.css';

export default function Listings() {
  const [listings, setListings] = useState(initialListings);
  const [viewMode, setViewMode] = useState('grid');
  
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
    if (propertyToConfirm) {
      setListings(prev => prev.map(listing => {
        if (listing.id === propertyToConfirm.id) {
          return { 
            ...listing, 
            status: confirmActionType === 'approve' ? 'Approved' : 'Rejected' 
          };
        }
        return listing;
      }));
      
      // Update selected property if it's currently open in drawer
      if (selectedProperty && selectedProperty.id === propertyToConfirm.id) {
        setSelectedProperty(prev => ({
          ...prev,
          status: confirmActionType === 'approve' ? 'Approved' : 'Rejected'
        }));
      }

      setPropertyToConfirm(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Property Listings</h1>
        <p className={styles.subtitle}>Manage and moderate all property listings on the Lotnis platform.</p>
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
