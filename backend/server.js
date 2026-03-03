const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const npsRoutes = require('./routes/nps');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🌞 API Dashboard NPS - Canal Solar',
    status: 'online',
    version: '2.0.0'
  });
});

// Rotas da API NPS
app.use('/api/nps', npsRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;