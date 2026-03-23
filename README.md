# 🌞 Dashboard NPS - Canal Solar

Sistema de dashboard para visualização em tempo real de pesquisas de satisfação (NPS) dos cursos, da área de Publicidade e da área de Engenharia do Canal Solar.

## 📊 Funcionalidades

- ✅ Visualização de NPS geral (velocímetro)
- ✅ NPS por curso individual
- ✅ Gráficos de distribuição de notas
- ✅ Feedbacks positivos e negativos
- ✅ Detalhamento de respostas individuais
- ✅ Dashboard separado para Publicidade
- ✅ Dashboard separado para Cursos do Canal Solar
- ✅ Dashboard separado para Engenharia
- ✅ Gráficos de avaliação por critério (Agilidade, Pontualidade, Qualidade, Custo-Benefício, Satisfação)
- ✅ Gráficos de avaliação por critério de Engenharia (Agilidade, Conhecimento Técnico, Qualidade, Pontualidade, Satisfação)
- ✅ Feedbacks de melhoria por critério (quando nota < 8 no Typebot de Engenharia)
- ✅ Webhook para integração com Typebot (Cursos, Comunicação e Engenharia)
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

### Webhook — Engenharia
```
POST /api/engenharia/webhook/typebot
```
```json
{
  "nome": "Nome do respondente",
  "e-mail": "email@empresa.com",
  "empresa": "Nome da Empresa",
  "avaliacao_agilidade": 8,
  "avaliacao_conhecimento_tecnico": 9,
  "avaliacao_qualidade": 7,
  "avaliacao_pontualidade": 10,
  "avaliacao_satisfacao": 8,
  "melhoria_agilidade": "Texto digitado se nota < 8, senão vazio",
  "melhoria_conhecimento_tecnico": "",
  "melhoria_qualidade": "Texto digitado se nota < 8, senão vazio",
  "melhoria_pontualidade": "",
  "melhoria_satisfacao": "",
  "indicaria_amigo": 9
}
```

> ⚠️ No Typebot de Engenharia, as avaliações de critério são notas de **1 a 10** (não texto). Quando o cliente dá nota menor que 8 em um critério, o Typebot exibe a pergunta "Pode nos contar o que poderia melhorar?" e salva a resposta na variável `melhoria_*` correspondente.

## 📊 Dados

- **Banco de dados:** MySQL (produção) / MySQL local (desenvolvimento)
- **Tabelas:** `respostas_nps` (cursos), `respostas_comunicacao` (publicidade) e `respostas_engenharia` (engenharia)
- **Respostas NPS cursos:** 654 respostas
- **Respostas Publicidade:** 88 respostas
- **Respostas Engenharia:** 10 respostas (importadas do formulário histórico)
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
│   │   ├── 20260310_02_create_respostas_comunicacao.js
│   │   ├── 20260318_03_create_respostas_engenharia.js
│   │   └── 20260320_04_add_melhorias_engenharia.js
│   ├── routes/
│   │   ├── nps.js           # Rotas API cursos
│   │   ├── comunicacao.js   # Rotas API publicidade
│   │   └── engenharia.js    # Rotas API engenharia
│   ├── server.js            # Servidor Express
│   ├── database.js          # Conexão MySQL via Knex
│   ├── knexfile.js          # Configuração Knex
│   ├── package.json         # Dependências
│   └── .env.example         # Modelo de variáveis
│
└── frontend/
    ├── src/
    │   ├── services/
    │   │   └── api.js                      # Cliente Axios
    │   ├── components/
    │   │   ├── NPSGauge.jsx                # Velocímetro NPS
    │   │   ├── CursoCard.jsx               # Card de curso
    │   │   ├── FeedbackCard.jsx            # Card de feedback
    │   │   └── CookieBanner.jsx            # Banner de cookies
    │   ├── pages/
    │   │   ├── Dashboard.jsx               # Dashboard principal (cursos)
    │   │   ├── DashboardPublicidade.jsx    # Dashboard publicidade
    │   │   ├── DashboardEngenharia.jsx     # Dashboard engenharia
    │   │   ├── CursoDetalhes.jsx           # Detalhes de um curso
    │   │   └── LoginPage.jsx               # Página de login
    │   ├── App.jsx         # App principal com rotas
    │   ├── AuthContext.jsx # Contexto de autenticação
    │   └── index.css       # Estilos globais
    ├── package.json
    └── vite.config.js
```

## 🔐 Rotas do Sistema

| Rota | Descrição |
|---|---|
| `/` | Dashboard principal — Cursos NPS |
| `/publicidade` | Dashboard de Publicidade |
| `/engenharia` | Dashboard de Engenharia |
| `/curso/:nome` | Detalhes de um curso específico |
| `/login` | Página de login |

## 👥 Equipe

Desenvolvido por **Softeo Tecnologia** para o **Canal Solar**

## 📄 Licença

Propriedade do Canal Solar - Todos os direitos reservados

---

**Última atualização:** Março 2026
