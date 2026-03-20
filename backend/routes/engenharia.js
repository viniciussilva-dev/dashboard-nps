// === ROTA: engenharia.js ===
// Arquivo: backend/routes/engenharia.js
//
// O que mudou nesta versão:
// O webhook agora recebe e salva os 5 campos de melhoria por critério:
//   melhoria_agilidade, melhoria_conhecimento_tecnico, melhoria_qualidade,
//   melhoria_pontualidade, melhoria_satisfacao
// Esses campos chegam preenchidos quando o cliente deu nota < 8 no critério.
// Quando a nota foi >= 8, o campo chega vazio e é salvo como null.

const express = require('express');
const router  = express.Router();
const { query, run } = require('../database');

// === FUNÇÃO: Converte texto ou número para nota numérica ===
// Agora o Typebot envia as avaliações como número de 1 a 10 diretamente.
// Esta função aceita tanto número quanto texto por compatibilidade.
const textoParaNota = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  if (!isNaN(n)) return n;
  const m = { 'excelente':5, 'bom':4, 'regular':3, 'ruim':2, 'péssimo':1, 'pessimo':1 };
  return m[String(v).toLowerCase().trim()] ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/engenharia/stats
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const rows  = await query('SELECT * FROM respostas_engenharia');
    const total = rows.length;

    const promotores = rows.filter(r => r.indicaria_amigo >= 9).length;
    const neutros    = rows.filter(r => r.indicaria_amigo >= 7 && r.indicaria_amigo <= 8).length;
    const detratores = rows.filter(r => r.indicaria_amigo <= 6).length;
    const nps        = total > 0 ? ((promotores - detratores) / total) * 100 : 0;

    const media = (campo) => {
      const vals = rows.filter(r => r[campo] != null).map(r => r[campo]);
      return vals.length ? +(vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2) : null;
    };

    const distribuicao = Array.from({ length: 11 }, (_, i) => ({
      nota:  i,
      count: rows.filter(r => r.indicaria_amigo === i).length
    }));

    // === AGRUPA NOTAS DE 1-10 EM FAIXAS PARA OS GRÁFICOS ===
    // 9-10 = Excelente, 7-8 = Bom, 5-6 = Regular, 3-4 = Ruim, 1-2 = Péssimo
    const contarNotas = (campo) => [
      { label: 'Excelente', count: rows.filter(r => r[campo] >= 9).length },
      { label: 'Bom',       count: rows.filter(r => r[campo] >= 7 && r[campo] <= 8).length },
      { label: 'Regular',   count: rows.filter(r => r[campo] >= 5 && r[campo] <= 6).length },
      { label: 'Ruim',      count: rows.filter(r => r[campo] >= 3 && r[campo] <= 4).length },
      { label: 'Péssimo',   count: rows.filter(r => r[campo] >= 1 && r[campo] <= 2).length },
    ];

    res.json({
      total_respostas: total,
      promotores,
      neutros,
      detratores,
      nps_score: Math.round(nps * 100) / 100,
      distribuicao,
      medias: {
        agilidade:            media('avaliacao_agilidade'),
        conhecimento_tecnico: media('avaliacao_conhecimento_tecnico'),
        qualidade:            media('avaliacao_qualidade'),
        pontualidade:         media('avaliacao_pontualidade'),
        satisfacao:           media('avaliacao_satisfacao'),
      },
      graficos: {
        agilidade:            contarNotas('avaliacao_agilidade'),
        conhecimento_tecnico: contarNotas('avaliacao_conhecimento_tecnico'),
        qualidade:            contarNotas('avaliacao_qualidade'),
        pontualidade:         contarNotas('avaliacao_pontualidade'),
        satisfacao:           contarNotas('avaliacao_satisfacao'),
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/engenharia/respostas
// ─────────────────────────────────────────────────────────────────────────────
router.get('/respostas', async (req, res) => {
  try {
    const { limit = 500, offset = 0 } = req.query;
    const rows = await query(
      'SELECT * FROM respostas_engenharia ORDER BY data_resposta DESC LIMIT ? OFFSET ?',
      [parseInt(limit), parseInt(offset)]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/engenharia/webhook/typebot
//
// Payload esperado (enviado pelo Typebot):
// {
//   "nome":                           "Nome do respondente",
//   "e-mail":                         "email@empresa.com",
//   "empresa":                        "Nome da Empresa",
//   "avaliacao_agilidade":            8,
//   "avaliacao_conhecimento_tecnico": 9,
//   "avaliacao_qualidade":            7,
//   "avaliacao_pontualidade":         10,
//   "avaliacao_satisfacao":           8,
//   "melhoria_agilidade":             "Poderia ser mais rápido",
//   "melhoria_conhecimento_tecnico":  "",
//   "melhoria_qualidade":             "Mais atenção aos detalhes",
//   "melhoria_pontualidade":          "",
//   "melhoria_satisfacao":            "",
//   "indicaria_amigo":                9
// }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook/typebot', async (req, res) => {
  try {
    const {
      nome, empresa,
      avaliacao_agilidade, avaliacao_conhecimento_tecnico,
      avaliacao_qualidade, avaliacao_pontualidade, avaliacao_satisfacao,
      melhoria_agilidade, melhoria_conhecimento_tecnico,
      melhoria_qualidade, melhoria_pontualidade, melhoria_satisfacao,
      indicaria_amigo
    } = req.body;

    const email = req.body['e-mail'] || req.body['email'] || null;

    if (indicaria_amigo == null || indicaria_amigo === '') {
      return res.status(400).json({ error: 'Campo "indicaria_amigo" é obrigatório.' });
    }

    const agora    = new Date();
    const data_str = agora.toISOString().replace('T', ' ').substring(0, 19);

    // === LIMPA STRINGS VAZIAS PARA NULL ===
    // Campos de melhoria chegam vazios ("") quando nota >= 8
    const limpar = (v) => (v && String(v).trim() !== '' ? String(v).trim() : null);

    const result = await run(`
      INSERT INTO respostas_engenharia
        (nome, email, empresa,
         avaliacao_agilidade, avaliacao_conhecimento_tecnico, avaliacao_qualidade,
         avaliacao_pontualidade, avaliacao_satisfacao,
         melhoria_agilidade, melhoria_conhecimento_tecnico, melhoria_qualidade,
         melhoria_pontualidade, melhoria_satisfacao,
         indicaria_amigo, data_resposta, ano)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      limpar(nome),
      limpar(email),
      limpar(empresa),
      textoParaNota(avaliacao_agilidade),
      textoParaNota(avaliacao_conhecimento_tecnico),
      textoParaNota(avaliacao_qualidade),
      textoParaNota(avaliacao_pontualidade),
      textoParaNota(avaliacao_satisfacao),
      limpar(melhoria_agilidade),
      limpar(melhoria_conhecimento_tecnico),
      limpar(melhoria_qualidade),
      limpar(melhoria_pontualidade),
      limpar(melhoria_satisfacao),
      parseInt(indicaria_amigo),
      data_str,
      agora.getFullYear()
    ]);

    console.log(`✅ Engenharia | NPS: ${indicaria_amigo} | Empresa: ${empresa} | ID: ${result.id}`);
    res.status(201).json({ success: true, id: result.id, nps: parseInt(indicaria_amigo) });

  } catch (e) {
    console.error('❌ Webhook Engenharia:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;