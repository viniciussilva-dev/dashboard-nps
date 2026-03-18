// === server.js ===
// Arquivo: backend/server.js
//
// O que foi alterado em relação à versão anterior:
// Adicionadas 2 linhas para registrar a rota de Engenharia:
//   - require('./routes/engenharia')       ← importa o arquivo da rota
//   - app.use('/api/engenharia', ...)      ← registra o prefixo da URL

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const npsRoutes          = require('./routes/nps');
const comunicacaoRoutes  = require('./routes/comunicacao');
const engenhariaRoutes   = require('./routes/engenharia');   // ← NOVO

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota raiz — só para testar se o servidor está online
app.get('/', (req, res) => {
  res.json({ message: '🌞 API Dashboard NPS - Canal Solar', status: 'online', version: '2.2.0' });
});

// === ROTAS DA API ===
app.use('/api/nps',          npsRoutes);
app.use('/api/comunicacao',  comunicacaoRoutes);
app.use('/api/engenharia',   engenhariaRoutes);  // ← NOVO

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;