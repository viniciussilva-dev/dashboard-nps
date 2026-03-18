// === ROTA: engenharia.js ===
// Arquivo: backend/routes/engenharia.js
//
// O que este arquivo faz:
// Define todas as rotas da API para o dashboard de Engenharia.
// Funciona exatamente igual ao comunicacao.js, mas com a tabela
// "respostas_engenharia" e o critério "conhecimento_tecnico"
// no lugar de "beneficio".
//
// Rotas disponíveis:
//   GET  /api/engenharia/stats            → Estatísticas gerais (NPS, médias, gráficos)
//   GET  /api/engenharia/respostas        → Lista todas as respostas
//   POST /api/engenharia/webhook/typebot  → Recebe dados do Typebot

const express = require('express');
const router  = express.Router();
const { query, run } = require('../database');

// === FUNÇÃO: Converte texto para número ===
// O Typebot envia as avaliações como texto ("Excelente", "Bom", etc.)
// Esta função converte para número (5, 4, 3, 2, 1) para salvar no banco.
// Também aceita se já vier como número (caso o Typebot envie assim).
// Exemplos:
//   "Excelente" → 5
//   "Bom"       → 4
//   "Regular"   → 3
//   "Ruim"      → 2
//   "Péssimo"   → 1
//   5           → 5  (já é número, retorna direto)
//   ""          → null (vazio, retorna nulo)
const textoParaNota = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  if (!isNaN(n)) return n;
  const m = { 'excelente':5, 'bom':4, 'regular':3, 'ruim':2, 'péssimo':1, 'pessimo':1 };
  return m[String(v).toLowerCase().trim()] ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/engenharia/stats
// Retorna todas as estatísticas para o dashboard:
//   - total de respostas
//   - promotores, neutros, detratores
//   - score NPS calculado
//   - distribuição das notas (0 a 10)
//   - médias de cada critério
//   - dados para os gráficos de barras por critério
// ─────────────────────────────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    // Busca todas as respostas da tabela de engenharia
    const rows  = await query('SELECT * FROM respostas_engenharia');
    const total = rows.length;

    // === CÁLCULO NPS ===
    // Promotores: nota 9 ou 10
    // Neutros: nota 7 ou 8
    // Detratores: nota 0 a 6
    // Fórmula: ((Promotores - Detratores) / Total) × 100
    const promotores = rows.filter(r => r.indicaria_amigo >= 9).length;
    const neutros    = rows.filter(r => r.indicaria_amigo >= 7 && r.indicaria_amigo <= 8).length;
    const detratores = rows.filter(r => r.indicaria_amigo <= 6).length;
    const nps        = total > 0 ? ((promotores - detratores) / total) * 100 : 0;

    // === FUNÇÃO: Calcula a média de um campo numérico ===
    // Ignora valores nulos para não distorcer a média
    const media = (campo) => {
      const vals = rows.filter(r => r[campo] != null).map(r => r[campo]);
      return vals.length ? +(vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(2) : null;
    };

    // === DISTRIBUIÇÃO DE NOTAS NPS (0 a 10) ===
    // Cria um array com 11 posições (notas 0 até 10)
    // Cada posição tem a nota e quantas pessoas deram aquela nota
    const distribuicao = Array.from({ length: 11 }, (_, i) => ({
      nota:  i,
      count: rows.filter(r => r.indicaria_amigo === i).length
    }));

    // === FUNÇÃO: Conta respostas de texto por critério ===
    // Usada para gerar os gráficos de barras coloridas
    // Retorna array: [{ label: 'Excelente', count: 10 }, { label: 'Bom', count: 5 }, ...]
    const contarTexto = (campo) => {
      const labels = ['Excelente','Bom','Regular','Ruim','Péssimo'];
      const mapa   = { 5:'Excelente', 4:'Bom', 3:'Regular', 2:'Ruim', 1:'Péssimo' };
      return labels.map(label => ({
        label,
        count: rows.filter(r => mapa[r[campo]] === label).length
      }));
    };

    // Retorna todos os dados calculados para o frontend
    res.json({
      total_respostas: total,
      promotores,
      neutros,
      detratores,
      nps_score: Math.round(nps * 100) / 100,
      distribuicao,
      medias: {
        agilidade:            media('avaliacao_agilidade'),
        conhecimento_tecnico: media('avaliacao_conhecimento_tecnico'), // ← EXCLUSIVO ENGENHARIA
        qualidade:            media('avaliacao_qualidade'),
        pontualidade:         media('avaliacao_pontualidade'),
        satisfacao:           media('avaliacao_satisfacao'),
      },
      graficos: {
        agilidade:            contarTexto('avaliacao_agilidade'),
        conhecimento_tecnico: contarTexto('avaliacao_conhecimento_tecnico'), // ← EXCLUSIVO ENGENHARIA
        qualidade:            contarTexto('avaliacao_qualidade'),
        pontualidade:         contarTexto('avaliacao_pontualidade'),
        satisfacao:           contarTexto('avaliacao_satisfacao'),
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/engenharia/respostas
// Retorna a lista de respostas individuais.
// Suporta paginação via query params: ?limit=500&offset=0
// Ordenadas da mais recente para a mais antiga.
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
// Recebe os dados enviados pelo Typebot quando alguém termina a pesquisa.
//
// Payload esperado (enviado pelo Typebot):
// {
//   "nome":                        "Nome do respondente",
//   "e-mail":                      "email@empresa.com",
//   "empresa":                     "Nome da Empresa",
//   "avaliacao_agilidade":         "Excelente",
//   "avaliacao_conhecimento_tecnico": "Bom",
//   "avaliacao_qualidade":         "Excelente",
//   "avaliacao_pontualidade":      "Bom",
//   "avaliacao_satisfacao":        "Excelente",
//   "indicaria_amigo":             9,
//   "feedback":                    "Comentário opcional..."
// }
// ─────────────────────────────────────────────────────────────────────────────
router.post('/webhook/typebot', async (req, res) => {
  try {
    const {
      nome, empresa,
      avaliacao_agilidade, avaliacao_conhecimento_tecnico,
      avaliacao_qualidade, avaliacao_pontualidade, avaliacao_satisfacao,
      indicaria_amigo, feedback
    } = req.body;

    // Aceita tanto "e-mail" (como o Typebot de publicidade envia) quanto "email"
    const email = req.body['e-mail'] || req.body['email'] || null;

    // === VALIDAÇÃO ===
    // O campo NPS é obrigatório — sem ele não dá para calcular o score
    if (indicaria_amigo == null || indicaria_amigo === '') {
      return res.status(400).json({ error: 'Campo "indicaria_amigo" é obrigatório.' });
    }

    // === DATA E HORA ===
    // Gera a data atual no formato "2026-03-18 14:30:00"
    const agora    = new Date();
    const data_str = agora.toISOString().replace('T', ' ').substring(0, 19);

    // === INSERÇÃO NO BANCO ===
    // Salva todos os dados na tabela respostas_engenharia
    const result = await run(`
      INSERT INTO respostas_engenharia
        (nome, email, empresa,
         avaliacao_agilidade, avaliacao_conhecimento_tecnico, avaliacao_qualidade,
         avaliacao_pontualidade, avaliacao_satisfacao,
         indicaria_amigo, feedback, data_resposta, ano)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      nome    || null,
      email   || null,
      empresa || null,
      textoParaNota(avaliacao_agilidade),
      textoParaNota(avaliacao_conhecimento_tecnico), // ← EXCLUSIVO ENGENHARIA
      textoParaNota(avaliacao_qualidade),
      textoParaNota(avaliacao_pontualidade),
      textoParaNota(avaliacao_satisfacao),
      parseInt(indicaria_amigo),
      feedback || null,
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