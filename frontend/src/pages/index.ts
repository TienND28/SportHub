// ============================================
// Re-export all pages from subdirectories
// ============================================

// Admin Pages
export { default as AdminDashboardPage } from './admin/DashboardPage';
export { default as AdminUsersPage } from './admin/UsersPage';

// Common Pages
export { default as HomePage } from './common/HomePage';
export { default as ProfilePage } from './common/ProfilePage';

// Customer Pages
export { default as BookingPage } from './customer/BookingPage';
export { default as VenuesPage } from './customer/VenuesPage';

// Owner Pages
// export { default as OwnerDashboardPage } from './owner/DashboardPage'; // TODO: Create this file
export { default as MyVenuesPage } from './owner/MyVenuesPage';
