import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/users/Users';
import UserPage from './pages/users/UserPage';
import Listings from './pages/listings/Listings';
import ListingPage from './pages/listings/ListingPage';
import Bookings from './pages/bookings/Bookings';
import BookingPage from './pages/bookings/BookingPage';
import Hosts from './pages/hosts/Hosts';
import HostPage from './pages/hosts/HostPage';
import Events from './pages/events/Events';
import EventPage from './pages/events/EventPage';
import MoveOuts from './pages/moveouts/MoveOuts';
import MoveOutPage from './pages/moveouts/MoveOutPage';
import Refunds from './pages/refunds/Refunds';
import RefundPage from './pages/refunds/RefundPage';
import Payouts from './pages/payouts/Payouts';
import PayoutBatchPage from './pages/payouts/PayoutBatchPage';
import Reports from './pages/reports/Reports';
import ReportPage from './pages/reports/ReportPage';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Configuration from './pages/Configuration';
import Notifications from './pages/Notifications';
import ComingSoon from './pages/ComingSoon';
import Login from './pages/Login';
import AcceptInvite from './pages/AcceptInvite';
import { getAccessToken, subscribeAuthChanges } from './lib/api';

function ProtectedDashboard() {
  const [token, setToken] = useState(() => getAccessToken());

  // Login.jsx/AcceptInvite.jsx set the token then navigate to "/" — since
  // that's the route we're already on, React Router won't remount this
  // component on its own. Subscribing to the auth-changed event keeps this
  // guard in sync with localStorage without requiring a full page reload.
  useEffect(() => subscribeAuthChanges(() => setToken(getAccessToken())), []);

  return token ? <MainLayout /> : <Login />;
}

// Supabase puts invite / reset tokens in the URL hash. If its redirect fell back to the site root (the
// redirect URL wasn't on the allow-list), forward the hash to the screen that can use it instead of
// showing a login form that silently ignores it.
function forwardAuthHash() {
  const { pathname, hash } = window.location;
  if (!hash.includes('access_token=') || pathname === '/accept-invite') return false;
  window.location.replace(`/accept-invite${hash}`);
  return true;
}

function App() {
  if (forwardAuthHash()) return null;
  return (
    <Router>
      <Routes>
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/" element={<ProtectedDashboard />}>
          <Route index element={<Dashboard />} />

          {/* People */}
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserPage />} />
          <Route path="hosts" element={<Hosts />} />
          <Route path="hosts/:id" element={<HostPage />} />

          {/* Accommodation */}
          <Route path="listings" element={<Listings />} />
          <Route path="listings/:id" element={<ListingPage />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="bookings/:id" element={<BookingPage />} />
          <Route path="move-outs" element={<MoveOuts />} />
          <Route path="move-outs/:id" element={<MoveOutPage />} />

          {/* Events */}
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventPage />} />

          {/* Money */}
          <Route path="refunds" element={<Refunds />} />
          <Route path="refunds/:service/:id" element={<RefundPage />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="payouts/batches/:id" element={<PayoutBatchPage />} />

          {/* Trust & insight */}
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportPage />} />
          <Route path="analytics" element={<Analytics />} />

          <Route path="notifications" element={<Notifications />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="food"
            element={<ComingSoon title="Food" description="Restaurants, vendors and food orders." />}
          />
          <Route
            path="services"
            element={<ComingSoon title="Services" description="Trusted service providers booked through Lotnis." />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
