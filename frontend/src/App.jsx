import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CursoDetalhes from './pages/CursoDetalhes';
import DashboardPublicidade from './pages/DashboardPublicidade';  // ← NOVO
import CookieBanner from './components/CookieBanner';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login"       element={<LoginPage />} />
            <Route path="/"            element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/curso/:nomeCurso" element={<PrivateRoute><CursoDetalhes /></PrivateRoute>} />
            {/* Nova aba de Publicidade */}
            <Route path="/publicidade" element={<PrivateRoute><DashboardPublicidade /></PrivateRoute>} />
          </Routes>
          <CookieBanner />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;