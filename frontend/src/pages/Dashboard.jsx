// === PÁGINA: Dashboard.jsx ===
// Arquivo: frontend/src/pages/Dashboard.jsx
//
// O que foi alterado em relação à versão anterior:
//   1. CORRIGIDO: o botão "📢 Publicidade" estava DENTRO do botão "Atualizar"
//      (HTML inválido — botão dentro de botão não funciona corretamente)
//   2. ADICIONADO: botão "🔧 Engenharia" no header, igual ao de Publicidade

import { useState, useEffect } from 'react';
import { npsAPI } from '../services/api';
import NPSGauge from '../components/NPSGauge';
import CursoCard from '../components/CursoCard';
import FeedbackCard from '../components/FeedbackCard';
import { RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [cursos, setCursos]     = useState([]);
  const [respostas, setRespostas] = useState([]);
  const [error, setError]       = useState(null);

  const { logout } = useAuth();
  const navigate   = useNavigate();

  // === FUNÇÃO: Busca todos os dados da API de Cursos ===
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Faz as 3 requisições ao mesmo tempo para ser mais rápido
      const [statsRes, cursosRes, respostasRes] = await Promise.all([
        npsAPI.getStats(),                    // Estatísticas gerais (NPS, promotores...)
        npsAPI.getCursos(),                   // Lista de cursos com NPS individual
        npsAPI.getRespostas({ limit: 100 })   // Últimas 100 respostas (para feedbacks)
      ]);

      setStats(statsRes.data);
      setCursos(cursosRes.data);
      setRespostas(respostasRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Verifique se o servidor esta rodando.');
    } finally {
      setLoading(false);
    }
  };

  // === EFEITO: Carrega ao abrir e atualiza a cada 30 segundos ===
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // === PREPARA OS FEEDBACKS PARA EXIBIÇÃO ===
  // Pega os 10 feedbacks positivos mais recentes
  const feedbacksPositivos = respostas
    .filter(r => r.feedback_positivo && r.feedback_positivo.trim())
    .slice(0, 10)
    .map(r => ({ texto: r.feedback_positivo, curso: r.nome_curso, nota: r.nota_geral, data: r.data_resposta }));

  // Pega os 10 feedbacks negativos mais recentes
  const feedbacksNegativos = respostas
    .filter(r => r.feedback_negativo && r.feedback_negativo.trim())
    .slice(0, 10)
    .map(r => ({ texto: r.feedback_negativo, curso: r.nome_curso, nota: r.nota_geral, data: r.data_resposta }));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // === TELA DE CARREGAMENTO ===
  if (loading && !stats) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  // === TELA DE ERRO ===
  if (error) {
    return (
      <div className="error-screen">
        <h2>Erro ao carregar dados</h2>
        <button onClick={fetchData} className="btn-retry">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* === CABEÇALHO === */}
      <header className="dashboard-header">
        <div className="header-content">     
          <img src="/logo-canalsolar.webp" alt="Canal Solar" className="header-logo" />
          <div className="header-divider"></div>
          <div className="header-info">
            <h1>Dashboard NPS</h1>
            <p>Pesquisa de satisfação · {stats?.total_respostas || 0} respondentes</p>
          </div>

          {/* === BOTÕES DO HEADER ===
              CORREÇÃO: anteriormente o botão Publicidade estava DENTRO
              do botão Atualizar (HTML inválido). Agora todos estão separados
              corretamente como irmãos dentro de header-actions. */}
          
         <div className="header-actions">  

  <button onClick={() => navigate('/')} className="btn-refresh">
    <ArrowLeft size={16} /> Início
  </button>

  <button onClick={fetchData} className="btn-refresh" disabled={loading}>
    <RefreshCw size={16} className={loading ? 'spinning' : ''} />
    Atualizar
  </button>

  <button onClick={handleLogout} className="btn-logout">
    <LogOut size={16} />
    Sair
  </button>
  </div>
</div>  
      </header>

      <main className="dashboard-main">

        {/* === VELOCÍMETRO NPS GERAL === */}
        <section className="nps-hero-section">
          <NPSGauge nps={stats?.nps_score || 0} />
        </section>

        {/* === KPIs GERAIS === */}
        <section className="metrics-section">
          <h2 className="section-title">Metricas Gerais</h2>
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
            <div className="kpi-card red">
              <div className="kpi-label">Detratores</div>
              <div className="kpi-value">{stats?.detratores || 0}</div>
              <div className="kpi-sub">Notas 0-6</div>
            </div>
          </div>
        </section>

        {/* === CARDS DE CURSOS === */}
        <section className="cursos-section">
          <h2 className="section-title">
            NPS por Curso
            <span className="hint">Clique em um curso para ver detalhes</span>
          </h2>
          <div className="cursos-grid">
            {cursos.map(curso => (
              <CursoCard key={curso.nome} curso={curso} />
            ))}
          </div>
        </section>

        {/* === FEEDBACKS === */}
        <section className="feedbacks-section">
          <h2 className="section-title">Principais Comentarios</h2>
          <div className="feedbacks-grid">
            <div className="feedback-column">
              <h3 className="feedback-title positivo">Comentarios Positivos</h3>
              {feedbacksPositivos.length > 0 ? (
                feedbacksPositivos.map((fb, idx) => (
                  <FeedbackCard key={idx} feedback={fb} tipo="positivo" />
                ))
              ) : (
                <p className="empty-state">Nenhum comentario positivo ainda.</p>
              )}
            </div>
            <div className="feedback-column">
              <h3 className="feedback-title negativo">Pontos de Melhoria</h3>
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