// === ROTA: comunicacao.js ===
// Arquivo: backend/routes/comunicacao.js

const express = require('express');
const router  = express.Router();
const { query, run } = require('../database');

// === Converte texto para número ===
const textoParaNota = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  if (!isNaN(n)) return n;
  const m = { 'excelente':5, 'bom':4, 'regular':3, 'ruim':2, 'péssimo':1, 'pessimo':1 };
  return m[String(v).toLowerCase().trim()] ?? null;
};

// ─────────────────────────────────────────────────
// GET /api/comunicacao/stats
// ─────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const rows  = await query('SELECT * FROM respostas_comunicacao');
    const total = rows.length;

    const promotores = rows.filter(r => r.indicaria_amigo >= 9).length;
    const neutros    = rows.filter(r => r.indicaria_amigo >= 7 && r.indicaria_amigo <= 8).length;
    const detratores = rows.filter(r => r.indicaria_amigo <= 6).length;
    const nps        = total > 0 ? ((promotores - detratores) / total) * 100 : 0;

    const media = (campo) => {
      const vals = rows.filter(r => r[campo] != null).map(r => r[campo]);
      return vals.length ? +(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(2) : null;
    };

    // Distribuição de notas NPS (0-10)
    const distribuicao = Array.from({ length: 11 }, (_, i) => ({
      nota:  i,
      count: rows.filter(r => r.indicaria_amigo === i).length
    }));

    // Contagem de cada resposta por critério (para gráfico de barras em texto)
    const contarTexto = (campo) => {
      const labels = ['Excelente','Bom','Regular','Ruim','Péssimo'];
      const mapa   = { 5:'Excelente', 4:'Bom', 3:'Regular', 2:'Ruim', 1:'Péssimo' };
      return labels.map(label => ({
        label,
        count: rows.filter(r => mapa[r[campo]] === label).length
      }));
    };

    res.json({
      total_respostas: total,
      promotores,
      neutros,
      detratores,
      nps_score: Math.round(nps * 100) / 100,
      distribuicao,
      medias: {
        agilidade:    media('avaliacao_agilidade'),
        pontualidade: media('avaliacao_pontualidade'),
        qualidade:    media('avaliacao_qualidade'),
        beneficio:    media('avaliacao_beneficio'),
        satisfacao:   media('avaliacao_satisfacao'),
      },
      graficos: {
        agilidade:    contarTexto('avaliacao_agilidade'),
        pontualidade: contarTexto('avaliacao_pontualidade'),
        qualidade:    contarTexto('avaliacao_qualidade'),
        beneficio:    contarTexto('avaliacao_beneficio'),
        satisfacao:   contarTexto('avaliacao_satisfacao'),
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────
// GET /api/comunicacao/respostas
// ─────────────────────────────────────────────────
router.get('/respostas', async (req, res) => {
  try {
    const { limit = 500, offset = 0 } = req.query;
    const rows = await query(
      'SELECT * FROM respostas_comunicacao ORDER BY data_resposta DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────
// POST /api/comunicacao/webhook/typebot
// ─────────────────────────────────────────────────
router.post('/webhook/typebot', async (req, res) => {
  try {
    const {
      nome, empresa,
      avaliacao_agilidade, avaliacao_pontualidade,
      avaliacao_qualidade, avaliacao_beneficio, avaliacao_satisfacao,
      indicaria_amigo, feedback
    } = req.body;

    const email = req.body['e-mail'] || req.body['email'] || null;

    if (indicaria_amigo == null || indicaria_amigo === '') {
      return res.status(400).json({ error: 'Campo "indicaria_amigo" é obrigatório.' });
    }

    const agora    = new Date();
    const data_str = agora.toISOString().replace('T',' ').substring(0,19);

    const result = await run(`
      INSERT INTO respostas_comunicacao
        (nome, email, empresa,
         avaliacao_agilidade, avaliacao_pontualidade, avaliacao_qualidade,
         avaliacao_beneficio, avaliacao_satisfacao,
         indicaria_amigo, feedback, data_resposta, ano)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      nome    || null,
      email   || null,
      empresa || null,
      textoParaNota(avaliacao_agilidade),
      textoParaNota(avaliacao_pontualidade),
      textoParaNota(avaliacao_qualidade),
      textoParaNota(avaliacao_beneficio),
      textoParaNota(avaliacao_satisfacao),
      parseInt(indicaria_amigo),
      feedback || null,
      data_str,
      agora.getFullYear()
    ]);

    console.log(`✅ Comunicação | NPS: ${indicaria_amigo} | Empresa: ${empresa} | ID: ${result.id}`);
    res.status(201).json({ success: true, id: result.id, nps: parseInt(indicaria_amigo) });

  } catch (e) {
    console.error('❌ Webhook Comunicação:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;