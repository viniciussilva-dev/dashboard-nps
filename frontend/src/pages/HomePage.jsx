import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { LogOut } from "lucide-react";

const HomePage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

const handleLogout = () => {
    logout();
    navigate('/login');
};

return (
    <div className="dashboard">   

<header className="dashboard-header">
        <div className="header-content">
          <img src="/logo-canalsolar.webp" alt="Canal Solar" className="header-logo" />
          <div className="header-divider"></div>
          <div className="header-info">
            <h1>Dashboard NPS</h1>
            <p>Bem-vindo, {user}!</p>
          </div>
          <div className="header-actions">
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

<main className="dashboard-main">
    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', color: '#1F2937', marginBottom: '8px'    }}>
            Selecione um módulo
        </h2>
        <p style={{ color: '#6B7280', fontSize: '16px'  }}>
            Escolha a área que deseja visualizar
        </p>
    </div>

    <div style={{
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: '0 24px'       
    }}> 
    <div
        onClick={() => navigate('/cursos')}
        style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '40px 32px',
            width: '260px',
            textAlign: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: '2px solid transparent',
            transition:'all 0.2s ease'
        }}
        onMouseEnter={e=>{
            e.currentTarget.style.borderColor= '#E8192C';
            e.currentTarget.style.transform = 'translateY(-4px)'; 
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,25,44,0.15)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)';
        }}
>
    <div style={{ fontSize: '48px', marginBottom: '16px'}}>🎓</div>
    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}
    >Cursos
    </h3>
    <p style={{ color: '#6B7280', fontSize: '14px' }}>
        NPS dos cursos e avaliações dos alunos
    </p>
</div>

<div
            onClick={() => navigate('/engenharia')}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px 32px',
              width: '260px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#E8192C';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,25,44,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔧</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
              Engenharia
            </h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              NPS e avaliações da equipe de engenharia
            </p>
          </div>

<div
            onClick={() => navigate('/publicidade')}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '40px 32px',
              width: '260px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              border: '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#E8192C';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(232,25,44,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📢</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1F2937', marginBottom: '8px' }}>
              Publicidade
            </h3>
            <p style={{ color: '#6B7280', fontSize: '14px' }}>
              NPS e avaliações da área de publicidade
            </p>
          </div>
          </div>
      </main>
    </div>
  );
};

export default HomePage;
