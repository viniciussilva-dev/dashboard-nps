import { useState, useEffect } from 'react';
import { npsAPI } from '../services/api';
import NPSGauge from '../components/NPSGauge';
import CursoCard from '../components/CursoCard';
import FeedbackCard from '../components/FeedbackCard';
import { RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [cursos, setCursos] = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, cursosRes, respostasRes] = await Promise.all([
        npsAPI.getStats(),
        npsAPI.getCursos(),
        npsAPI.getRespostas({ limit: 100 })
      ]);
      
      setStats(statsRes.data);
      setCursos(cursosRes.data);
      setRespostas(respostasRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const feedbacksPositivos = respostas
    .filter(r => r.feedback_positivo && r.feedback_positivo.trim())
    .slice(0, 10)
    .map(r => ({
      texto: r.feedback_positivo,
      curso: r.nome_curso,
      nota: r.nota_geral,
      data: r.data_resposta
    }));

  const feedbacksNegativos = respostas
    .filter(r => r.feedback_negativo && r.feedback_negativo.trim())
    .slice(0, 10)
    .map(r => ({
      texto: r.feedback_negativo,
      curso: r.nome_curso,
      nota: r.nota_geral,
      data: r.data_resposta
    }));

  if (loading && !stats) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <h2>❌ {error}</h2>
        <button onClick={fetchData} className="btn-retry">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">☀️</div>
          <div className="header-info">
            <h1>Dashboard NPS — Canal Solar</h1>
            <p>Pesquisa de satisfação · {stats?.total_respostas || 0} respondentes</p>
          </div>
          <button onClick={fetchData} className="btn-refresh" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Atualizar
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {/* NPS Hero */}
        <section className="nps-hero-section">
          <NPSGauge nps={stats?.nps_score || 0} />
        </section>

        {/* Métricas Gerais */}
        <section className="metrics-section">
          <h2 className="section-title">Métricas Gerais</h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Respondentes</div>
              <div className="kpi-value">{stats?.total_respostas || 0}</div>
              <div className="kpi-sub">Alunos avaliados</div>
            </div>
            <div className="kpi-card green">
              <div className="kpi-label">Promotores</div>
              <div className="kpi-value">{stats?.promotores || 0}</div>
              <div className="kpi-sub">Notas 9-10</div>
            </div>
            <div className="kpi-card blue">
              <div className="kpi-label">Neutros</div>
              <div className="kpi-value">{stats?.neutros || 0}</div>
              <div className="kpi-sub">Notas 7-8</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Detratores</div>
              <div className="kpi-value">{stats?.detratores || 0}</div>
              <div className="kpi-sub">Notas 0-6</div>
            </div>
          </div>
        </section>

        {/* NPS por Curso */}
        <section className="cursos-section">
          <h2 className="section-title">
            NPS por Curso
            <span className="hint">👆 Clique em um curso para ver detalhes</span>
          </h2>
          <div className="cursos-grid">
            {cursos.map(curso => (
              <CursoCard key={curso.nome} curso={curso} />
            ))}
          </div>
        </section>

        {/* Feedbacks */}
        <section className="feedbacks-section">
          <h2 className="section-title">Principais Comentários</h2>
          <div className="feedbacks-grid">
            <div className="feedback-column">
              <h3 className="feedback-title positivo">✅ Comentários Positivos</h3>
              {feedbacksPositivos.length > 0 ? (
                feedbacksPositivos.map((fb, idx) => (
                  <FeedbackCard key={idx} feedback={fb} tipo="positivo" />
                ))
              ) : (
                <p className="empty-state">Nenhum comentário positivo ainda.</p>
              )}
            </div>
            <div className="feedback-column">
              <h3 className="feedback-title negativo">⚠️ Pontos de Melhoria</h3>
              {feedbacksNegativos.length > 0 ? (
                feedbacksNegativos.map((fb, idx) => (
                  <FeedbackCard key={idx} feedback={fb} tipo="negativo" />
                ))
              ) : (
                <p className="empty-state">Nenhum ponto de melhoria reportado.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
