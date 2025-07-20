import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetailGuest from './pages/EventDetailGuest';
import UserProfile from './pages/UserProfil';
import EventDetailHost from './pages/EventDetailHost';
import QRScanner from './pages/QRScanner';
import LoginPage from './pages/LoginPage' 
import UserScanPage from './pages/UserScanPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/scan" element={<QRScanner />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/:url" element={<EventDetailGuest />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/event-detail/:id" element={<EventDetailHost />} />
          <Route path="/event-user-scan/:id" element={<UserScanPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
