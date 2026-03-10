const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const npsRoutes          = require('./routes/nps');
const comunicacaoRoutes  = require('./routes/comunicacao');  // ← NOVA ROTA

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: '🌞 API Dashboard NPS - Canal Solar', status: 'online', version: '2.1.0' });
});

// Rotas da API
app.use('/api/nps',          npsRoutes);
app.use('/api/comunicacao',  comunicacaoRoutes);  // ← NOVA ROTA

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;