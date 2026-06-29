import React from 'react';
import styles from './Badges.module.css';

export const CategoryBadge = ({ category }) => {
  const getCategoryClass = () => {
    switch (category) {
      case 'Fraud':
      case 'Fake Listing':
        return styles.categoryRed;
      case 'Harassment':
      case 'Host Misconduct':
      case 'Guest Misconduct':
        return styles.categoryOrange;
      case 'Spam':
      case 'Inappropriate Content':
        return styles.categoryGray;
      case 'Payment Issue':
        return styles.categoryBlue;
      case 'Safety Concern':
      case 'Property Damage':
        return styles.categoryPurple;
      default:
        return styles.categoryDefault;
    }
  };

  return (
    <span className={`${styles.badge} ${getCategoryClass()}`}>
      {category}
    </span>
  );
};

export const ReportStatusBadge = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Pending':
        return styles.statusPending;
      case 'Under Review':
        return styles.statusReview;
      case 'Resolved':
      case 'Closed':
        return styles.statusResolved;
      case 'Escalated':
        return styles.statusEscalated;
      case 'Rejected':
        return styles.statusRejected;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <span className={`${styles.badge} ${getStatusClass()}`}>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority) {
      case 'Low':
        return styles.priorityLow;
      case 'Medium':
        return styles.priorityMedium;
      case 'High':
        return styles.priorityHigh;
      case 'Critical':
        return styles.priorityCritical;
      default:
        return styles.priorityDefault;
    }
  };

  return (
    <span className={`${styles.badge} ${getPriorityClass()}`}>
      {priority}
    </span>
  );
};
