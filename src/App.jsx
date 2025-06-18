// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AboutPage   from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TermsPage    from './pages/TermsPage';
import PrivacyPage  from './pages/PrivacyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<LandingPage />} />
        <Route path="/about"   element={<AboutPage  />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms"   element={<TermsPage   />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
    </BrowserRouter>
  );
}
