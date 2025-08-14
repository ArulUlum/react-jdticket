import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'
import Home from './pages/Home';
import CreateEvent from './pages/CreateEvent';
import EventPage from './pages/EventPage';
import UserProfile from './pages/UserProfil';
import Dashboard from './pages/Dashboard';
import QRScanner from './pages/QRScanner';
import LoginPage from './pages/LoginPage' 
import UserScanPage from './pages/UserScanPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutUs from './pages/AboutUs';
import Settings from './pages/Settings';
import WalletPage from './pages/WalletPage';
import MyEventPage from './pages/MyEventPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/scan" element={<QRScanner />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/my-event" element={<MyEventPage />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/:url" element={<EventPage />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/event-user-scan/:id" element={<UserScanPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
