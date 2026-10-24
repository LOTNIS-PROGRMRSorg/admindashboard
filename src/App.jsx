import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Listings from './pages/Listings';
import Bookings from './pages/Bookings';
import Hosts from './pages/Hosts';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Configuration from './pages/Configuration';
import Refunds from './pages/Refunds';
import MoveOuts from './pages/MoveOuts';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/" element={<ProtectedDashboard />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="listings" element={<Listings />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="hosts" element={<Hosts />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="configuration" element={<Configuration />} />
          <Route path="refunds" element={<Refunds />} />
          <Route path="move-outs" element={<MoveOuts />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="events" element={<ComingSoon title="Events" description="Ticketed events and venues hosted on Lotnis." />} />
          <Route path="food" element={<ComingSoon title="Food" description="Restaurants, vendors and food orders." />} />
          <Route path="services" element={<ComingSoon title="Services" description="Trusted service providers booked through Lotnis." />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
