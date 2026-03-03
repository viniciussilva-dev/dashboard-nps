# 🌞 Dashboard NPS - Canal Solar

Sistema de dashboard para visualização em tempo real de pesquisas de satisfação (NPS) dos cursos do Canal Solar.

## 📊 Funcionalidades

- ✅ Visualização de NPS geral (velocímetro)
- ✅ NPS por curso individual
- ✅ Gráficos de distribuição de notas
- ✅ Feedbacks positivos e negativos
- ✅ Detalhamento de respostas individuais
- ✅ Webhook para integração com Typebot
- ✅ Auto-atualização a cada 30 segundos

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js 22 LTS** - Runtime JavaScript
- **Express** - Framework web
- **SQLite3** - Banco de dados
- **CORS** - Segurança de requisições

### Frontend
- **React 18** - Biblioteca de interface
- **Vite** - Build tool rápido
- **Axios** - Cliente HTTP
- **Recharts** - Gráficos interativos
- **Lucide React** - Ícones
- **React Router DOM** - Navegação

## 📦 Instalação Local

### Pré-requisitos
- Node.js 20 LTS ou superior
- npm ou yarn

### Backend
```bash
cd backend
npm install
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## 🌐 Deploy em Produção

### Backend (Railway/Render)

1. Conectar repositório GitHub
2. Configurar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Adicionar variáveis de ambiente:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`

### Frontend (Vercel/Netlify)

1. Conectar repositório GitHub
2. Configurar:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Framework Preset:** Vite
3. Adicionar variável de ambiente:
   - `VITE_API_URL` = `<URL_DO_BACKEND>/api`
   - Exemplo: `https://dashboard-nps-backend.railway.app/api`

## 🔗 Integração com Typebot

### Webhook Endpoint
```
POST /api/nps/webhook/typebot
```

### URL de Produção
```
https://<seu-backend-url>/api/nps/webhook/typebot
```

### Estrutura de Dados Esperada
```json
{
  "curso": "Nome do Curso",
  "avaliacao_geral": 4.5,
  "nivel_professores": 5,
  "material_didatico": 4,
  "organizacao_atendimento": 5,
  "feedback": "Comentário do aluno..."
}
```

## 📊 Dados

- **Banco de dados:** `backend/nps.db` (SQLite)
- **Respostas importadas:** 51 respostas reais
- **Cursos avaliados:** 10 cursos diferentes
- **NPS Geral:** 63 (Zona de Qualidade)

## 🎨 Paleta de Cores

- **Azul escuro:** `#1e3a5f` (header)
- **Amarelo sol:** `#F59E0B` (logo)
- **Verde:** `#10B981` (promotores)
- **Azul:** `#3B82F6` (neutros)
- **Vermelho:** `#EF4444` (detratores)

## 📝 Estrutura do Projeto
```
canalsolar-nps/
├── backend/
│   ├── routes/
│   │   └── nps.js          # Rotas da API
│   ├── server.js           # Servidor Express
│   ├── database.js         # Conexão SQLite
│   ├── package.json        # Dependências
│   ├── .env.example        # Modelo de variáveis
│   └── nps.db              # Banco de dados
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   └── api.js      # Cliente Axios
    │   ├── components/     # Componentes React
    │   ├── pages/          # Páginas
    │   ├── App.jsx         # App principal
    │   └── index.css       # Estilos globais
    ├── package.json        # Dependências
    └── vite.config.js      # Configuração Vite
```

## 👥 Equipe

Desenvolvido por **Softeo Tecnologia** para o **Canal Solar**

## 📄 Licença

Propriedade do Canal Solar - Todos os direitos reservados

---

**Última atualização:** Março 2026