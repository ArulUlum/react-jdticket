import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetailGuest from './pages/EventDetailGuest';
import UserProfile from './pages/UserProfil';
import EventDetailHost from './pages/EventDetailHost';
import QRScanner from './pages/QRScanner';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/event/:id" element={<EventDetailGuest />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/event-detail/:id" element={<EventDetailHost />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
