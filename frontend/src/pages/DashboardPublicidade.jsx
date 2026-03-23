// === PÁGINA: DashboardPublicidade.jsx ===
// Arquivo: frontend/src/pages/DashboardPublicidade.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';
import NPSGauge from '../components/NPSGauge';

const COR_RESPOSTA = {
  'Excelente': '#10B981',
  'Bom':       '#3B82F6',
  'Regular':   '#F59E0B',
  'Ruim':      '#F97316',
  'Péssimo':   '#EF4444',
};

const corNPS = (nps) => {
  if (nps < 0)   return '#EF4444';
  if (nps <= 50) return '#F59E0B';
  if (nps <= 70) return '#3B82F6';
  return '#10B981';
};

const zonaLabel = (nps) => {
  if (nps < 0)   return 'Crítico 😞';
  if (nps <= 50) return 'Aperfeiçoamento ⚙️';
  if (nps <= 70) return 'Qualidade 🎯';
  return 'Excelência ⭐';
};

const notaTexto = (n) => {
  const m = { 5:'Excelente', 4:'Bom', 3:'Regular', 2:'Ruim', 1:'Péssimo' };
  return m[Math.round(n)] || '-';
};

const GraficoCriterio = ({ titulo, dados }) => (
  <div className="criterio-card">
    <h3 className="criterio-titulo">{titulo}</h3>
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={dados} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v} respostas`, '']} labelStyle={{ fontWeight: 700 }} />
        <Bar dataKey="count" radius={[6,6,0,0]}>
          {dados.map((d) => (
            <Cell key={d.label} fill={COR_RESPOSTA[d.label] || '#94a3b8'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const RespostaCard = ({ r }) => {
  const cor = r.indicaria_amigo >= 9 ? '#10B981' : r.indicaria_amigo >= 7 ? '#3B82F6' : '#EF4444';
  const mapa = { 5:'Excelente', 4:'Bom', 3:'Regular', 2:'Ruim', 1:'Péssimo' };
  return (
    <div className="resposta-card">
      <div className="resposta-nota" style={{ backgroundColor: cor }}>{r.indicaria_amigo}</div>
      <div className="resposta-info">
        <div className="resposta-notas-detail">
          {r.empresa && <span className="nota-pill">🏢 {r.empresa}</span>}
          {r.avaliacao_agilidade    && <span className="nota-pill">⚡ Agilidade: {mapa[r.avaliacao_agilidade]}</span>}
          {r.avaliacao_pontualidade && <span className="nota-pill">⏱ Pontualidade: {mapa[r.avaliacao_pontualidade]}</span>}
          {r.avaliacao_qualidade    && <span className="nota-pill">✨ Qualidade: {mapa[r.avaliacao_qualidade]}</span>}
          {r.avaliacao_beneficio    && <span className="nota-pill">💰 Custo-benef.: {mapa[r.avaliacao_beneficio]}</span>}
          {r.avaliacao_satisfacao   && <span className="nota-pill">😊 Satisfação: {mapa[r.avaliacao_satisfacao]}</span>}
        </div>
        {r.feedback && (
          <div className={`resposta-feedback ${r.indicaria_amigo < 7 ? 'neg' : ''}`}>
            {r.indicaria_amigo >= 7 ? '💬' : '⚠️'} {r.feedback}
          </div>
        )}
        <div className="resposta-date">
          📅 {new Date(r.data_resposta).toLocaleDateString('pt-BR')}
          {r.nome && <span style={{ marginLeft: 8 }}>👤 {r.nome}</span>}
        </div>
      </div>
    </div>
  );
};

const DashboardPublicidade = () => {
  const [stats, setStats]         = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState(null);
  const [aba, setAba]             = useState('todos');
  const { logout }                = useAuth();
  const navigate                  = useNavigate();

  const carregar = async () => {
    try {
      setLoading(true);
      setErro(null);
      const [sRes, rRes] = await Promise.all([
        api.get('/comunicacao/stats'),
        api.get('/comunicacao/respostas'),
      ]);
      setStats(sRes.data);
      setRespostas(rRes.data);
    } catch (e) {
      setErro('Erro ao carregar dados. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading && !stats) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Carregando dados de Publicidade...</p>
    </div>
  );

  if (erro) return (
    <div className="error-screen">
      <h2>{erro}</h2>
      <button onClick={carregar} className="btn-retry">Tentar Novamente</button>
    </div>
  );

  const nps         = stats?.nps_score || 0;
  const corAtual    = corNPS(nps);
  const promotores  = respostas.filter(r => r.indicaria_amigo >= 9);
  const neutros     = respostas.filter(r => r.indicaria_amigo >= 7 && r.indicaria_amigo <= 8);
  const detratores  = respostas.filter(r => r.indicaria_amigo <= 6);
  const comFeedback = respostas.filter(r => r.feedback?.trim());

  const abaAtiva = {
    todos: respostas, promotores, neutros, detratores, feedbacks: comFeedback,
  }[aba] || respostas;

  const criterios = [
    { key: 'agilidade',    titulo: '⚡ Agilidade no Atendimento' },
    { key: 'pontualidade', titulo: '⏱ Pontualidade das Entregas' },
    { key: 'qualidade',    titulo: '✨ Qualidade do Trabalho' },
    { key: 'beneficio',    titulo: '💰 Custo-Benefício' },
    { key: 'satisfacao',   titulo: '😊 Satisfação Geral' },
  ];

  // Comprimento do arco semicircular para dasharray
  const arcLen = 251;
  const filled = (Math.min(Math.max(nps, 0), 100) / 100) * arcLen;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <img src="/logo-canalsolar.webp" alt="Canal Solar" className="header-logo" />
          <div className="header-divider"></div>
          <div className="header-info">
            <h1>Dashboard NPS — Publicidade</h1>
            <p>Pesquisa de satisfação · {stats?.total_respostas || 0} respondentes</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/')} className="btn-refresh">
              <ArrowLeft size={16} /> Inicio
            </button>
            <button onClick={carregar} className="btn-refresh" disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spinning' : ''} /> Atualizar
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="btn-logout">
              <LogOut size={16} /> Sair
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">

        {/* === NPS HERO === */}
        <section className="nps-hero-section">
          <NPSGauge nps={nps} />
        </section>

        {/* === KPIs === */}
        <section className="metrics-section">
          <h2 className="section-title">Métricas Gerais</h2>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Respondentes</div>
              <div className="kpi-value">{stats?.total_respostas || 0}</div>
              <div className="kpi-sub">Empresas avaliadas</div>
            </div>
            <div className="kpi-card green">
              <div className="kpi-label">Promotores</div>
              <div className="kpi-value">{stats?.promotores || 0}</div>
              <div className="kpi-sub">Notas 9–10</div>
            </div>
            <div className="kpi-card blue">
              <div className="kpi-label">Neutros</div>
              <div className="kpi-value">{stats?.neutros || 0}</div>
              <div className="kpi-sub">Notas 7–8</div>
            </div>
            <div className="kpi-card red">
              <div className="kpi-label">Detratores</div>
              <div className="kpi-value">{stats?.detratores || 0}</div>
              <div className="kpi-sub">Notas 0–6</div>
            </div>
          </div>
        </section>

        {/* === GRÁFICOS DE CRITÉRIOS === */}
        <section className="metrics-section">
          <h2 className="section-title">Avaliação por Critério</h2>
          <div className="criterios-grid">
            {criterios.map(c => (
              stats?.graficos?.[c.key] && (
                <GraficoCriterio key={c.key} titulo={c.titulo} dados={stats.graficos[c.key]} />
              )
            ))}
          </div>
        </section>

        {/* === MÉDIAS === */}
        {stats?.medias && (
          <section className="metrics-section">
            <h2 className="section-title">Médias por Critério</h2>
            <div style={{ background:'#fff', borderRadius:14, padding:24, boxShadow:'0 1px 6px rgba(0,0,0,.07)' }}>
              <div className="rating-bars">
                {criterios.map(c => {
                  const val = stats.medias[c.key];
                  if (!val) return null;
                  const pct = (val / 5) * 100;
                  const cor = pct >= 80 ? '#10B981' : pct >= 60 ? '#3B82F6' : '#F59E0B';
                  return (
                    <div key={c.key} className="rating-row">
                      <span className="rating-label">{c.titulo}</span>
                      <div className="rating-bar-bg">
                        <div className="rating-bar-fill" style={{ width:`${pct}%`, backgroundColor: cor }}></div>
                      </div>
                      <span className="rating-val">{notaTexto(val)} ({val})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* === DISTRIBUIÇÃO NPS === */}
        {stats?.distribuicao && (
          <section className="metrics-section">
            <h2 className="section-title">Distribuição de Notas NPS</h2>
            <div style={{ background:'#fff', borderRadius:14, padding:24, boxShadow:'0 1px 6px rgba(0,0,0,.07)' }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.distribuicao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nota" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`${v} respostas`, 'Quantidade']} />
                  <Bar dataKey="count" fill="#E8192C" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* === RESPOSTAS INDIVIDUAIS === */}
        <section className="metrics-section">
          <h2 className="section-title">Respostas Individuais</h2>
          <div className="tabs">
            {[
              { key:'todos',      label:`📋 Todos (${respostas.length})` },
              { key:'promotores', label:`👍 Promotores (${promotores.length})` },
              { key:'neutros',    label:`😐 Neutros (${neutros.length})` },
              { key:'detratores', label:`👎 Detratores (${detratores.length})` },
              { key:'feedbacks',  label:`💬 Feedbacks (${comFeedback.length})` },
            ].map(t => (
              <button key={t.key} className={aba === t.key ? 'active' : ''} onClick={() => setAba(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="tab-content">
            {abaAtiva.map(r => <RespostaCard key={r.id} r={r} />)}
            {abaAtiva.length === 0 && <p className="empty-state">Nenhuma resposta nesta categoria.</p>}
          </div>
        </section>

      </main>
    </div>
  );
};

export default DashboardPublicidade;