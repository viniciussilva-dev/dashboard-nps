// === App.jsx ===
// Arquivo: frontend/src/App.jsx
//
// O que foi alterado em relação à versão anterior:
// Adicionadas 2 linhas para registrar a rota de Engenharia:
//   - import DashboardEngenharia         ← importa o componente da página
//   - <Route path="/engenharia" ... />   ← registra a rota /engenharia

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import PrivateRoute from './PrivateRoute';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import CursoDetalhes from './pages/CursoDetalhes';
import DashboardPublicidade from './pages/DashboardPublicidade';
import DashboardEngenharia from './pages/DashboardEngenharia';   // ← NOVO
import CookieBanner from './components/CookieBanner';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Página de login — pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Dashboard principal de Cursos — protegida */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

            {/* Detalhes de um curso específico — protegida */}
            <Route path="/curso/:nomeCurso" element={<PrivateRoute><CursoDetalhes /></PrivateRoute>} />

            {/* Dashboard de Publicidade — protegida */}
            <Route path="/publicidade" element={<PrivateRoute><DashboardPublicidade /></PrivateRoute>} />

            {/* Dashboard de Engenharia — protegida */}
            <Route path="/engenharia" element={<PrivateRoute><DashboardEngenharia /></PrivateRoute>} />  {/* ← NOVO */}
          </Routes>
          <CookieBanner />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;