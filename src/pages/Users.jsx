import { useState, useMemo } from 'react';
import UserStats from '../components/users/UserStats';
import UserFilters from '../components/users/UserFilters';
import UserTable from '../components/users/UserTable';
import UserDrawer from '../components/users/UserDrawer';
import ConfirmModal from '../components/users/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { usersData as initialUsers, userStatsData } from '../data/mockData';
import styles from './Users.module.css';

export default function Users() {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer and Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const hasActiveFilters = Boolean(searchQuery.trim()) || statusFilter !== 'All' || roleFilter !== 'All';

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const query = searchQuery.trim().toLowerCase();
      const searchableFields = [user.id, user.fullName, user.username, user.email, user.phone];
      const matchesSearch = searchableFields.some((field) => field?.toLowerCase().includes(query));
      
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedUsers = useMemo(() => {
    const start = (visiblePage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, visiblePage, itemsPerPage]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setRoleFilter('All');
    setCurrentPage(1);
  };

  // Actions
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      const deletedUserId = userToDelete.id;
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      if (selectedUser?.id === deletedUserId) {
        setSelectedUser(null);
      }
      const remainingVisibleUsers = filteredUsers.filter((user) => user.id !== deletedUserId).length;
      setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil(remainingVisibleUsers / itemsPerPage))));
      setUserToDelete(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>WORKSPACE / USERS</span>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>Review member accounts, roles, and activity across the Lotnis platform.</p>
        </div>
        <span className={styles.prototypeTag}>Sample data</span>
      </div>

      <UserStats stats={userStatsData} />
      <p className={styles.summaryNote}>Summary cards show sample platform-level figures. The directory below contains a smaller local sample list.</p>

      <UserFilters 
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusChange}
        roleFilter={roleFilter}
        setRoleFilter={handleRoleChange}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <div className={styles.resultsHeading}>
        <div>
          <h2 className={styles.sectionTitle}>User directory</h2>
          <p className={styles.resultsSummary}>
            {filteredUsers.length === 0
              ? 'No users to display'
              : `Showing ${Math.min((visiblePage - 1) * itemsPerPage + 1, filteredUsers.length)}–${Math.min(visiblePage * itemsPerPage, filteredUsers.length)} of ${filteredUsers.length} matching users`}
          </p>
        </div>
        <span className={styles.totalCount}>{users.length} in sample list</span>
      </div>

      <UserTable 
        users={paginatedUsers} 
        onView={(user) => setSelectedUser(user)}
        onDelete={(user) => setUserToDelete(user)}
        isFiltered={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />

      <Pagination 
        currentPage={visiblePage}
        totalPages={totalPages}
        totalItems={filteredUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <UserDrawer 
        user={selectedUser} 
        isOpen={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />

      <ConfirmModal 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={`Remove ${userToDelete?.fullName} from the current sample user list?`}
        note="This only changes the local prototype state for this page session. It is not saved to a server."
        confirmText="Remove user"
      />
    </div>
  );
}
