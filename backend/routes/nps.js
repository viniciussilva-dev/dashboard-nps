const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/stats — estatísticas gerais
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM respostas_nps').get().count;

    if (total === 0) {
      return res.json({ message: 'Nenhuma resposta ainda' });
    }

    const promotores  = db.prepare('SELECT COUNT(*) as count FROM respostas_nps WHERE nota_geral >= 9').get().count;
    const neutros     = db.prepare('SELECT COUNT(*) as count FROM respostas_nps WHERE nota_geral >= 7 AND nota_geral <= 8').get().count;
    const detratores  = db.prepare('SELECT COUNT(*) as count FROM respostas_nps WHERE nota_geral <= 6').get().count;
    const nps_score   = ((promotores - detratores) / total) * 100;

    res.json({
      total_respostas: total,
      promotores,
      neutros,
      detratores,
      nps_score: Math.round(nps_score * 100) / 100
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/respostas — listar respostas
router.get('/respostas', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 1000;
    const skip  = parseInt(req.query.skip)  || 0;
    const rows  = db.prepare('SELECT * FROM respostas_nps ORDER BY data_resposta DESC LIMIT ? OFFSET ?').all(limit, skip);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webhook/nps — receber resposta manual
router.post('/webhook/nps', (req, res) => {
  try {
    const {
      nome_curso, nota_geral, nota_professores, nota_indicaria,
      nota_faria_outro, nota_organizacao, nota_material,
      feedback_positivo, feedback_negativo, ano
    } = req.body;

    if (!nome_curso || nota_geral === undefined) {
      return res.status(400).json({ error: 'nome_curso e nota_geral são obrigatórios' });
    }

    const stmt = db.prepare(`
      INSERT INTO respostas_nps
        (nome_curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
         nota_organizacao, nota_material, feedback_positivo, feedback_negativo, ano)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nome_curso, nota_geral, nota_professores || null, nota_indicaria || null,
      nota_faria_outro || null, nota_organizacao || null, nota_material || null,
      feedback_positivo || null, feedback_negativo || null, ano || new Date().getFullYear()
    );

    res.json({ success: true, id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webhook/typebot — receber do Typebot
router.post('/webhook/typebot', (req, res) => {
  try {
    console.log('📥 Webhook Typebot recebido:', req.body);

    const data = req.body;
    let nota_geral_raw = null;
    let nota_prof = null, nota_mat = null, nota_org = null;
    let nota_outro = null, nota_ind = null;
    let feedback = null, curso = null;

    // Mapear campos flexivelmente
    for (const [campo, valor] of Object.entries(data)) {
      const c = campo.toLowerCase();
      if (c.includes('avalia') && c.includes('geral'))     nota_geral_raw = parseFloat(valor) || null;
      else if (c.includes('professor'))                    nota_prof      = parseFloat(valor) || null;
      else if (c.includes('material'))                     nota_mat       = parseFloat(valor) || null;
      else if (c.includes('organiza'))                     nota_org       = parseFloat(valor) || null;
      else if (c.includes('faria') && c.includes('outro')) nota_outro     = parseFloat(valor) || null;
      else if (c.includes('indicaria'))                    nota_ind       = parseFloat(valor) || null;
      else if (c === 'feedback')                           feedback       = valor || null;
      else if (c === 'curso')                              curso          = valor || null;
    }

    if (!nota_geral_raw || !curso) {
      return res.status(400).json({ error: 'nota_geral e curso são obrigatórios' });
    }

    // Converter 1-5 para 0-10
    const nota_geral     = Math.round(nota_geral_raw * 2);
    const nota_faria_out = nota_outro ? Math.round(nota_outro * 2) : null;
    const nota_indicaria = nota_ind   ? Math.round(nota_ind * 2)   : null;

    // Classificar feedback pela nota
    let fb_pos = null, fb_neg = null;
    if (feedback) {
      if (nota_geral === 10)      fb_pos = feedback;
      else if (nota_geral === 8) { fb_pos = feedback; fb_neg = feedback; }
      else                        fb_neg = feedback;
    }

    // Normalizar nome do curso
    const cursos_map = {
      'armazenamento': 'Armazenamento', 'mercadolivre': 'Mercado Livre',
      'comercialevendas': 'Comercial e Vendas', 'fundamentos': 'Fundamentos',
      'zerogrid': 'Zero Grid', 'engenharia': 'Engenharia',
      'microgeracao': 'Microgeração', 'usinas': 'Usinas',
      'pvsyst': 'PVsyst', 'cabine': 'Cabine Primária'
    };
    const nome_curso = cursos_map[curso.toLowerCase().replace(/\s*style=.*/,'')] || curso;

    const stmt = db.prepare(`
      INSERT INTO respostas_nps
        (nome_curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
         nota_organizacao, nota_material, feedback_positivo, feedback_negativo, ano)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nome_curso, nota_geral, nota_prof, nota_indicaria, nota_faria_out,
      nota_org, nota_mat, fb_pos, fb_neg, new Date().getFullYear()
    );

    console.log(`✅ Resposta #${result.lastInsertRowid} salva!`);
    res.json({ success: true, id: result.lastInsertRowid, curso: nome_curso, nps: nota_geral });

  } catch (err) {
    console.error('❌ Erro webhook:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
