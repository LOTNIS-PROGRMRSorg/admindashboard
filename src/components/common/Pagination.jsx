import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Pagination.module.css';

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Showing <span style={{ fontWeight: 600 }}>{startItem}</span> to <span style={{ fontWeight: 600 }}>{endItem}</span> of <span style={{ fontWeight: 600 }}>{totalItems}</span> results
      </div>
      
      <div className={styles.controls}>
        <button 
          className={styles.btn} 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} style={{ marginRight: '4px' }} />
          Previous
        </button>
        
        <div className={styles.pageNumbers}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>

        <button 
          className={styles.btn} 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight size={16} style={{ marginLeft: '4px' }} />
        </button>
      </div>
    </div>
  );
}
