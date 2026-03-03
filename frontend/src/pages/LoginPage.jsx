import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(username.trim(), password);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-orb orb1"></div>
        <div className="login-bg-orb orb2"></div>
        <div className="login-bg-orb orb3"></div>
      </div>
      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-logo">☀️</div>
          <div className="login-logo-ring"></div>
        </div>
        <h1 className="login-title">Canal Solar</h1>
        <p className="login-subtitle">Dashboard NPS — Acesso restrito</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Usuário</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">👤</span>
              <input
                type="text"
                placeholder="seu usuário"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>
          <div className="login-field">
            <label>Senha</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="sua senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button type="button" className="login-toggle-pass"
                onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          {error && <div className="login-error">⚠️ {error}</div>}
          <button type="submit" className={"login-btn" + (loading ? " loading" : "")} disabled={loading}>
            {loading ? <span className="login-spinner"></span> : 'Entrar →'}
          </button>
        </form>
        <p className="login-footer">Acesso exclusivo para colaboradores Canal Solar</p>
      </div>
    </div>
  );
};

export default LoginPage;