import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CursoDetalhes from './pages/CursoDetalhes';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/curso/:nomeCurso" element={<CursoDetalhes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
