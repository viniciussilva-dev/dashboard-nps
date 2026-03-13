# 🌞 Dashboard NPS - Canal Solar

Sistema de dashboard para visualização em tempo real de pesquisas de satisfação (NPS) dos cursos e da área de Publicidade do Canal Solar.

## 📊 Funcionalidades

- ✅ Visualização de NPS geral (velocímetro)
- ✅ NPS por curso individual
- ✅ Gráficos de distribuição de notas
- ✅ Feedbacks positivos e negativos
- ✅ Detalhamento de respostas individuais
- ✅ Dashboard separado para Publicidade e Comunicação
- ✅ Gráficos de avaliação por critério (Agilidade, Pontualidade, Qualidade, Custo-Benefício, Satisfação)
- ✅ Webhook para integração com Typebot (Cursos e Comunicação)
- ✅ Auto-atualização a cada 30 segundos
- ✅ Sistema de login com autenticação por sessão

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js 22 LTS** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional
- **Knex.js** - Query builder e migrations
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
- MySQL 8.0 ou superior
- Python 3.x (apenas para scripts de importação)

### Banco de Dados
```bash
# Cria o banco de dados no MySQL
mysql -u root -p
CREATE DATABASE canalsolar_nps CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### Backend
```bash
cd backend
npm install

# Configura as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do MySQL

# Roda as migrations (cria as tabelas automaticamente)
npx knex migrate:latest

# Inicia o servidor
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

## 🌐 Deploy em Produção (Ploi)

### Backend

1. Conectar repositório GitHub ao Ploi
2. Criar banco MySQL no painel do Ploi
3. Configurar variáveis de ambiente no Ploi:
   - `PORT` = `3001`
   - `NODE_ENV` = `production`
   - `DB_HOST` = host do banco
   - `DB_PORT` = `3306`
   - `DB_USER` = usuário do banco
   - `DB_PASSWORD` = senha do banco
   - `DB_NAME` = nome do banco
4. O comando de start já roda as migrations automaticamente:
   ```
   npx knex migrate:latest && node server.js
   ```

### Frontend (Vercel/Netlify)

1. Conectar repositório GitHub
2. Configurar:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Adicionar variável de ambiente:
   - `VITE_API_URL` = `https://npsapi.canalsolar.com.br/api`

## 🔗 Integração com Typebot

### Webhook — Cursos NPS
```
POST /api/nps/webhook/typebot
```
```json
{
  "curso": "Nome do Curso",
  "avaliacao_geral": 5,
  "nivel_professores": 5,
  "material_didatico": 4,
  "organizacao_atendimento": 5,
  "faria_outro_curso": 5,
  "indicaria_amigo": 5,
  "feedback": "Comentário do aluno..."
}
```

### Webhook — Publicidade e Comunicação
```
POST /api/comunicacao/webhook/typebot
```
```json
{
  "curso": "Comunicação",
  "nome": "Nome do respondente",
  "e-mail": "email@empresa.com",
  "empresa": "Nome da Empresa",
  "avaliacao_agilidade": "Excelente",
  "avaliacao_pontualidade": "Bom",
  "avaliacao_qualidade": "Excelente",
  "avaliacao_beneficio": "Bom",
  "avaliacao_satisfacao": "Excelente",
  "indicaria_amigo": 9,
  "feedback": "Comentário opcional..."
}
```

## 📊 Dados

- **Banco de dados:** MySQL (produção) / MySQL local (desenvolvimento)
- **Tabelas:** `respostas_nps` (cursos) e `respostas_comunicacao` (publicidade)
- **Respostas NPS cursos:** 654 respostas
- **Respostas Publicidade:** 88 respostas
- **NPS Cursos:** 69 (Zona de Qualidade 🎯)
- **NPS Publicidade:** 77 (Zona de Excelência ⭐)

## 🎨 Paleta de Cores

- **Azul escuro:** `#0a1628` (header)
- **Vermelho Canal Solar:** `#E8192C` (destaque)
- **Amarelo sol:** `#F59E0B` (logo)
- **Verde:** `#10B981` (promotores)
- **Azul:** `#3B82F6` (neutros)
- **Vermelho:** `#EF4444` (detratores)

## 📝 Estrutura do Projeto

```
canalsolar-nps/
├── backend/
│   ├── migrations/
│   │   ├── 20260310_01_create_respostas_nps.js
│   │   └── 20260310_02_create_respostas_comunicacao.js
│   ├── routes/
│   │   ├── nps.js           # Rotas API cursos
│   │   └── comunicacao.js   # Rotas API publicidade
│   ├── server.js            # Servidor Express
│   ├── database.js          # Conexão MySQL via Knex
│   ├── knexfile.js          # Configuração Knex
│   ├── package.json         # Dependências
│   └── .env.example         # Modelo de variáveis
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   └── api.js             # Cliente Axios
    │   ├── components/
    │   │   ├── NPSGauge.jsx       # Velocímetro NPS
    │   │   ├── CursoCard.jsx      # Card de curso
    │   │   ├── FeedbackCard.jsx   # Card de feedback
    │   │   └── CookieBanner.jsx   # Banner de cookies
    │   ├── pages/
    │   │   ├── Dashboard.jsx           # Dashboard principal (cursos)
    │   │   ├── DashboardPublicidade.jsx # Dashboard publicidade
    │   │   ├── CursoDetalhes.jsx       # Detalhes de um curso
    │   │   └── LoginPage.jsx           # Página de login
    │   ├── App.jsx         # App principal com rotas
    │   ├── AuthContext.jsx # Contexto de autenticação
    │   └── index.css       # Estilos globais
    ├── package.json
    └── vite.config.js
```

## 👥 Equipe

Desenvolvido por **Softeo Tecnologia** para o **Canal Solar**

## 📄 Licença

Propriedade do Canal Solar - Todos os direitos reservados

---

**Última atualização:** Março 2026