import { useEffect, useMemo, useState } from 'react';
import HostTable from '../components/hosts/HostTable';
import HostDrawer from '../components/hosts/HostDrawer';
import Pagination from '../components/common/Pagination';
import { apiFetch } from '../lib/api';
import styles from './Users.module.css';

const STATUS_TABS = ['All', 'pending', 'under_review', 'verified', 'rejected', 'suspended'];

export default function Hosts() {
  const [hosts, setHosts] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedHost, setSelectedHost] = useState(null);

  const load = () => {
    apiFetch('/admin/hosts')
      .then((body) => setHosts(body?.data || []))
      .catch((error) => setLoadError(error.message));
  };

  useEffect(load, []);

  const filteredHosts = useMemo(() => {
    return hosts.filter((host) => {
      const matchesSearch =
        (host.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (host.legal_first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (host.legal_last_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (host.city || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || host.verification_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [hosts, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredHosts.length / itemsPerPage) || 1;
  const paginatedHosts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHosts.slice(start, start + itemsPerPage);
  }, [filteredHosts, currentPage]);

  useMemo(() => setCurrentPage(1), [searchQuery, statusFilter]);

  const counts = useMemo(() => {
    const byStatus = {};
    hosts.forEach((h) => { byStatus[h.verification_status] = (byStatus[h.verification_status] || 0) + 1; });
    return byStatus;
  }, [hosts]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Host Applications</h1>
        <p className={styles.subtitle}>Review host verification requirements and manage host status.</p>
        {loadError && <p className={styles.subtitle} style={{ color: '#dc2626' }}>{loadError}</p>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid var(--color-border)',
              fontWeight: 600,
              fontSize: '0.8125rem',
              background: statusFilter === tab ? 'var(--color-primary)' : 'var(--color-bg-surface)',
              color: statusFilter === tab ? 'var(--color-text-inverse)' : 'var(--color-text-base)',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'All' ? 'All' : tab.replace(/_/g, ' ')} {tab !== 'All' && counts[tab] ? `(${counts[tab]})` : ''}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search by name or city…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--color-border)', maxWidth: 320 }}
      />

      <HostTable hosts={paginatedHosts} onView={(host) => setSelectedHost(host)} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredHosts.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <HostDrawer
        host={selectedHost}
        isOpen={!!selectedHost}
        onClose={() => setSelectedHost(null)}
        onChanged={() => { load(); setSelectedHost(null); }}
      />
    </div>
  );
}
