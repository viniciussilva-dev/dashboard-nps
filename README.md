# 🌞 Dashboard NPS — Canal Solar

> Sistema completo de dashboard para visualização em tempo real de pesquisas de satisfação (NPS), desenvolvido para o **Canal Solar** — maior portal de energia solar do Brasil.

![Node.js](https://img.shields.io/badge/Node.js-22_LTS-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)

---

## 💡 Sobre o Projeto

O Canal Solar precisava de uma solução para centralizar e visualizar em tempo real as pesquisas de satisfação (NPS) enviadas por alunos dos cursos e clientes das áreas de Publicidade e Engenharia.

A solução integra um chatbot (Typebot) com um dashboard completo — quando o cliente termina a pesquisa no chatbot, os dados chegam automaticamente via webhook e aparecem no dashboard em até 30 segundos.

---

## ✅ Funcionalidades

### Geral
- Sistema de login com autenticação por sessão
- Tela de seleção de módulos após login
- Auto-atualização dos dados a cada 30 segundos
- Velocímetro NPS com zonas de qualidade

### Módulo Cursos
- NPS geral de todos os cursos
- NPS individual por curso com detalhamento
- Gráfico de distribuição de notas
- Feedbacks positivos e negativos separados
- Detalhamento de respostas individuais com abas (Promotores, Neutros, Detratores)

### Módulo Publicidade
- NPS geral da área de Publicidade
- Gráficos de avaliação por critério (Agilidade, Pontualidade, Qualidade, Custo-Benefício, Satisfação)
- Médias por critério com barras de progresso
- Respostas individuais filtradas por categoria

### Módulo Engenharia
- NPS geral da área de Engenharia
- Gráficos de avaliação por critério (Agilidade, Conhecimento Técnico, Qualidade, Pontualidade, Satisfação)
- Feedbacks de melhoria por critério (coletados quando nota < 8)
- Respostas individuais com aba de Melhorias

---

## 🚀 Tecnologias

### Backend
| Tecnologia | Uso |
|---|---|
| **Node.js 22 LTS** | Runtime JavaScript no servidor |
| **Express 4** | Framework web para criação da API REST |
| **MySQL 8** | Banco de dados relacional |
| **Knex.js** | Query builder e gerenciamento de migrations |
| **dotenv** | Gerenciamento de variáveis de ambiente |
| **CORS** | Controle de acesso entre domínios |

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 18** | Biblioteca de interface de usuário |
| **Vite 6** | Build tool e servidor de desenvolvimento |
| **React Router DOM 7** | Navegação entre páginas |
| **Axios** | Cliente HTTP para consumo da API |
| **Recharts** | Gráficos interativos |
| **Lucide React** | Biblioteca de ícones |

---

## 📁 Estrutura do Projeto

```
canalsolar-nps/
│
├── backend/
│   ├── migrations/
│   │   ├── 20260310_01_create_respostas_nps.js          # Tabela de cursos
│   │   ├── 20260310_02_create_respostas_comunicacao.js  # Tabela de publicidade
│   │   ├── 20260318_03_create_respostas_engenharia.js   # Tabela de engenharia
│   │   └── 20260320_04_add_melhorias_engenharia.js      # Colunas de melhoria
│   ├── routes/
│   │   ├── nps.js           # API dos cursos
│   │   ├── comunicacao.js   # API da publicidade
│   │   └── engenharia.js    # API da engenharia
│   ├── server.js            # Servidor Express principal
│   ├── database.js          # Conexão com MySQL via Knex
│   ├── knexfile.js          # Configuração de ambientes (dev/prod)
│   └── package.json
│
└── frontend/
    └── src/
        ├── components/
        │   ├── NPSGauge.jsx       # Velocímetro NPS (gráfico semicircular)
        │   ├── CursoCard.jsx      # Card clicável de curso
        │   ├── FeedbackCard.jsx   # Card de feedback positivo/negativo
        │   └── CookieBanner.jsx   # Banner de aceite de cookies
        ├── pages/
        │   ├── HomePage.jsx              # Tela de seleção de módulos
        │   ├── LoginPage.jsx             # Página de login
        │   ├── Dashboard.jsx             # Dashboard de cursos
        │   ├── DashboardPublicidade.jsx  # Dashboard de publicidade
        │   ├── DashboardEngenharia.jsx   # Dashboard de engenharia
        │   └── CursoDetalhes.jsx         # Detalhes de um curso
        ├── services/
        │   └── api.js          # Configuração Axios + funções da API
        ├── App.jsx             # Rotas da aplicação
        ├── AuthContext.jsx     # Contexto de autenticação
        └── index.css           # Estilos globais
```

---

## 🔐 Rotas do Sistema

| Rota | Descrição |
|---|---|
| `/login` | Página de login — pública |
| `/` | Seleção de módulo — protegida |
| `/cursos` | Dashboard de cursos — protegida |
| `/curso/:nome` | Detalhes de um curso — protegida |
| `/publicidade` | Dashboard de publicidade — protegida |
| `/engenharia` | Dashboard de engenharia — protegida |

---

## 🔗 API Endpoints

### Cursos
```
GET  /api/nps/stats              → Estatísticas gerais
GET  /api/nps/cursos             → Lista de cursos com NPS
GET  /api/nps/curso/:nome        → Detalhes de um curso
GET  /api/nps/respostas          → Respostas individuais
POST /api/nps/webhook/typebot    → Recebe dados do Typebot
```

### Publicidade
```
GET  /api/comunicacao/stats              → Estatísticas e gráficos
GET  /api/comunicacao/respostas          → Respostas individuais
POST /api/comunicacao/webhook/typebot    → Recebe dados do Typebot
```

### Engenharia
```
GET  /api/engenharia/stats              → Estatísticas e gráficos
GET  /api/engenharia/respostas          → Respostas individuais
POST /api/engenharia/webhook/typebot    → Recebe dados do Typebot
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos
- Node.js 20+
- MySQL 8.0+

### 1. Clone o repositório
```bash
git clone https://github.com/viniciussilva-dev/dashboard-nps.git
cd dashboard-nps
```

### 2. Configure o banco de dados
```bash
mysql -u root -p
CREATE DATABASE canalsolar_nps CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

### 3. Configure o backend
```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais do MySQL
npx knex migrate:latest
npm run dev
```
Backend rodando em `http://localhost:3001`

### 4. Configure o frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend rodando em `http://localhost:5173`

### 5. Acesse o sistema
- URL: `http://localhost:5173`
- As credenciais de acesso são configuradas diretamente no arquivo `frontend/src/AuthContext.jsx`

---

## 🌐 Deploy em Produção

- **Backend** → Ploi (servidor Node.js + MySQL)
- **Frontend** → Vercel/Netlify (build estático)
- **CI/CD** → Push no GitHub triggera deploy automático no Ploi

As migrations rodam automaticamente no deploy via comando de start:
```bash
npx knex migrate:latest && node server.js
```

---

## 🤖 Integração com Typebot

O sistema recebe respostas automaticamente via webhook. Quando o cliente finaliza a pesquisa no chatbot, os dados são enviados para a API e aparecem no dashboard em até 30 segundos.

**Exemplo de payload — Engenharia:**
```json
{
  "nome": "Nome do cliente",
  "e-mail": "email@empresa.com",
  "empresa": "Nome da Empresa",
  "avaliacao_agilidade": 9,
  "avaliacao_conhecimento_tecnico": 8,
  "avaliacao_qualidade": 10,
  "avaliacao_pontualidade": 7,
  "avaliacao_satisfacao": 9,
  "melhoria_pontualidade": "Poderia melhorar os prazos",
  "indicaria_amigo": 9
}
```

---

## 🎨 Paleta de Cores

```
#0a1628  → Azul escuro (header)
#E8192C  → Vermelho Canal Solar (destaque)
#F59E0B  → Amarelo (logo / zona aperfeiçoamento)
#10B981  → Verde (promotores / zona excelência)
#3B82F6  → Azul (neutros / zona qualidade)
#EF4444  → Vermelho (detratores / zona crítico)
```

---

## 👨‍💻 Desenvolvido por

**Vinicius Silva** — [github.com/viniciussilva-dev](https://github.com/viniciussilva-dev)

Desenvolvido para a **Softeo Tecnologia** · Cliente: **Canal Solar**

---

**Última atualização:** Março 2026
