const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api', require('./routes/nps'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: '🌞 API Dashboard NPS - Canal Solar', status: 'online' });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
