import { useState, useMemo, useEffect } from 'react';
import UserStats from '../components/users/UserStats';
import UserFilters from '../components/users/UserFilters';
import UserTable from '../components/users/UserTable';
import UserDrawer from '../components/users/UserDrawer';
import ConfirmModal from '../components/users/ConfirmModal';
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import styles from './Users.module.css';

const emptyStats = {
  totalUsers: { value: 0, trend: 0, isPositive: true },
  activeUsers: { value: 0, trend: 0, isPositive: true },
  suspendedUsers: { value: 0, trend: 0, isPositive: true },
  newThisMonth: { value: 0, trend: 0, isPositive: true },
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [userStatsData, setUserStatsData] = useState(emptyStats);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer and Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch('/admin/users?limit=200'),
      apiFetch('/admin/users/stats'),
    ])
      .then(([listResult, statsResult]) => {
        if (cancelled) return;
        setUsers(listResult.users || []);
        setUserStatsData(statsResult);
      })
      .catch((error) => !cancelled && setLoadError(error.message));
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtering Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  // Actions
  const handleDeleteConfirm = () => {
    if (userToDelete) {
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users Management</h1>
        <p className={styles.subtitle}>Manage all registered users on the Lotnis platform.</p>
        {loadError && <p className={styles.subtitle} style={{ color: '#dc2626' }}>{loadError}</p>}
      </div>

      <UserStats stats={userStatsData} />

      <UserFilters 
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        roleFilter={roleFilter}
        setRoleFilter={handleRoleFilterChange}
      />

      <UserTable 
        users={paginatedUsers} 
        onView={(user) => setSelectedUser(user)}
        onDelete={(user) => setUserToDelete(user)}
      />

      <Pagination 
        currentPage={currentPage}
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
        message={`Are you sure you want to delete ${userToDelete?.fullName}? This action cannot be undone.`}
      />
    </div>
  );
}

