import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Credenciais fixas — edite aqui para adicionar usuarios
const CREDENTIALS = {
  'admin': 'canalsolar2026',
  'equipe': 'solar@2026',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => sessionStorage.getItem('nps_user') || null);

  const login = (username, password) => {
    if (CREDENTIALS[username] && CREDENTIALS[username] === password) {
      sessionStorage.setItem('nps_user', username);
      setUser(username);
      return { success: true };
    }
    return { success: false, error: 'Usuário ou senha incorretos.' };
  };

  const logout = () => {
    sessionStorage.removeItem('nps_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);