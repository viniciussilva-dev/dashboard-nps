import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { npsAPI } from '../services/api';
import { ArrowLeft, Users, ThumbsUp, Meh, ThumbsDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CursoDetalhes = () => {
  const { nomeCurso } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    const fetchCursoData = async () => {
      try {
        const response = await npsAPI.getCurso(nomeCurso);
        setData(response.data);
      } catch (err) {
        console.error('Erro ao carregar curso:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCursoData();
  }, [nomeCurso]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!data) return <div className="error-screen">Curso não encontrado</div>;

  const getBadgeColor = (nps) => {
    if (nps < 0) return '#EF4444';
    if (nps <= 50) return '#F59E0B';
    if (nps <= 70) return '#3B82F6';
    return '#10B981';
  };

  const getNPSZone = (nps) => {
    if (nps < 0) return 'Crítico 😞';
    if (nps <= 50) return 'Aperfeiçoamento ⚙️';
    if (nps <= 70) return 'Qualidade 🎯';
    return 'Excelência ⭐';
  };

  const distribuicao = Array.from({ length: 11 }, (_, i) => ({
    nota: i,
    count: data.respostas.filter(r => r.nota_geral === i).length
  }));

  const promotores = data.respostas.filter(r => r.nota_geral >= 9);
  const neutros = data.respostas.filter(r => r.nota_geral >= 7 && r.nota_geral <= 8);
  const detratores = data.respostas.filter(r => r.nota_geral <= 6);
  const comFeedback = data.respostas.filter(r =>
    (r.feedback_positivo && r.feedback_positivo.trim()) ||
    (r.feedback_negativo && r.feedback_negativo.trim())
  );

  const renderResposta = (r) => {
    const notaColor = r.nota_geral >= 9 ? '#10B981' : r.nota_geral >= 7 ? '#3B82F6' : '#EF4444';
    const fb = r.feedback_positivo?.trim() || r.feedback_negativo?.trim();
    return (
      <div key={r.id} className="resposta-card">
        <div className="resposta-nota" style={{ backgroundColor: notaColor }}>{r.nota_geral}</div>
        <div className="resposta-info">
          <div className="resposta-notas-detail">
            {r.nota_professores && <span className="nota-pill">👨‍🏫 Prof: {r.nota_professores}/5</span>}
            {r.nota_material && <span className="nota-pill">📚 Mat: {r.nota_material}/5</span>}
            {r.nota_organizacao && <span className="nota-pill">🗂 Org: {r.nota_organizacao}/5</span>}
          </div>
          {fb && (
            <div className={`resposta-feedback ${r.feedback_negativo ? 'neg' : ''}`}>
              {r.feedback_positivo ? '💬' : '⚠️'} {fb}
            </div>
          )}
          <div className="resposta-date">
            📅 {new Date(r.data_resposta).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="curso-detalhes">
      <header className="curso-header">
        <div className="curso-header-top">
          <img src="/logo-canalsolar.webp" alt="Canal Solar" className="header-logo" />
          <div className="header-divider"></div>
          <button onClick={() => navigate('/')} className="btn-back">
            <ArrowLeft size={18} />
            Voltar ao Dashboard
          </button>
        </div>
        <div className="curso-header-bottom">
          <div className="curso-header-badge" style={{ backgroundColor: getBadgeColor(data.nps) }}>
            {Math.round(data.nps)}
          </div>
          <div className="curso-header-info">
            <h1>{data.nome}</h1>
            <p>{getNPSZone(data.nps)} · NPS {Math.round(data.nps)}</p>
          </div>
        </div>
      </header>

      <main className="curso-main">
        <section className="mini-kpis">
          <div className="mini-kpi"><Users size={24} /><div className="mini-kpi-value">{data.total_respostas}</div><div className="mini-kpi-label">Respostas</div></div>
          <div className="mini-kpi"><ThumbsUp size={24} /><div className="mini-kpi-value">{data.promotores}</div><div className="mini-kpi-label">Promotores</div></div>
          <div className="mini-kpi"><Meh size={24} /><div className="mini-kpi-value">{data.neutros}</div><div className="mini-kpi-label">Neutros</div></div>
          <div className="mini-kpi"><ThumbsDown size={24} /><div className="mini-kpi-value">{data.detratores}</div><div className="mini-kpi-label">Detratores</div></div>
        </section>

        {data.medias.nota_professores && (
          <section className="medias-section">
            <h2 className="section-title">Médias de Notas</h2>
            <div className="rating-bars">
              {[
                { label: 'Avaliação Geral', value: data.medias.nota_geral, max: 10 },
                { label: 'Professores', value: data.medias.nota_professores, max: 5 },
                { label: 'Material Didático', value: data.medias.nota_material, max: 5 },
                { label: 'Organização', value: data.medias.nota_organizacao, max: 5 },
              ].filter(r => r.value).map(r => {
                const pct = (r.value / r.max) * 100;
                const color = pct >= 80 ? '#10B981' : pct >= 60 ? '#3B82F6' : '#F59E0B';
                return (
                  <div key={r.label} className="rating-row">
                    <span className="rating-label">{r.label}</span>
                    <div className="rating-bar-bg">
                      <div className="rating-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                    </div>
                    <span className="rating-val">{r.value.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="distribuicao-section">
          <h2 className="section-title">Distribuição de Notas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distribuicao}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nota" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#E8192C" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="respostas-section">
          <h2 className="section-title">Respostas Individuais</h2>
          <div className="tabs">
            <button className={activeTab === 'todos' ? 'active' : ''} onClick={() => setActiveTab('todos')}>📋 Todos ({data.respostas.length})</button>
            <button className={activeTab === 'promotores' ? 'active' : ''} onClick={() => setActiveTab('promotores')}>👍 Promotores ({promotores.length})</button>
            <button className={activeTab === 'neutros' ? 'active' : ''} onClick={() => setActiveTab('neutros')}>😐 Neutros ({neutros.length})</button>
            <button className={activeTab === 'detratores' ? 'active' : ''} onClick={() => setActiveTab('detratores')}>👎 Detratores ({detratores.length})</button>
            <button className={activeTab === 'feedbacks' ? 'active' : ''} onClick={() => setActiveTab('feedbacks')}>💬 Feedbacks ({comFeedback.length})</button>
          </div>
          <div className="tab-content">
            {activeTab === 'todos' && data.respostas.map(renderResposta)}
            {activeTab === 'promotores' && promotores.map(renderResposta)}
            {activeTab === 'neutros' && neutros.map(renderResposta)}
            {activeTab === 'detratores' && detratores.map(renderResposta)}
            {activeTab === 'feedbacks' && comFeedback.map(renderResposta)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CursoDetalhes;