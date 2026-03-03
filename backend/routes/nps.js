const express = require('express');
const router = express.Router();
const { query, run } = require('../database');

// GET /api/nps/stats
router.get('/stats', async (req, res) => {
  try {
    const respostas = await query('SELECT * FROM respostas_nps');
    const total = respostas.length;
    const promotores = respostas.filter(r => r.nota_geral >= 9).length;
    const neutros = respostas.filter(r => r.nota_geral >= 7 && r.nota_geral <= 8).length;
    const detratores = respostas.filter(r => r.nota_geral <= 6).length;
    const nps = total > 0 ? ((promotores - detratores) / total) * 100 : 0;
    res.json({ total_respostas: total, promotores, neutros, detratores, nps_score: Math.round(nps * 100) / 100 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nps/respostas
router.get('/respostas', async (req, res) => {
  try {
    const { limit = 1000, offset = 0 } = req.query;
    const sql = 'SELECT * FROM respostas_nps ORDER BY data_resposta DESC LIMIT ? OFFSET ?';
    const respostas = await query(sql, [parseInt(limit), parseInt(offset)]);
    res.json(respostas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nps/cursos
router.get('/cursos', async (req, res) => {
  try {
    const respostas = await query('SELECT * FROM respostas_nps');
    const cursoData = {};
    respostas.forEach(r => {
      if (!cursoData[r.nome_curso]) {
        cursoData[r.nome_curso] = { nome: r.nome_curso, total: 0, promotores: 0, neutros: 0, detratores: 0 };
      }
      cursoData[r.nome_curso].total++;
      if (r.nota_geral >= 9) cursoData[r.nome_curso].promotores++;
      else if (r.nota_geral >= 7) cursoData[r.nome_curso].neutros++;
      else cursoData[r.nome_curso].detratores++;
    });
    const cursos = Object.values(cursoData).map(curso => ({
      ...curso,
      nps: ((curso.promotores - curso.detratores) / curso.total) * 100
    })).sort((a, b) => b.nps - a.nps);
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nps/curso/:nome
router.get('/curso/:nome', async (req, res) => {
  try {
    const { nome } = req.params;
    const respostas = await query('SELECT * FROM respostas_nps WHERE nome_curso = ?', [nome]);
    if (respostas.length === 0) {
      return res.status(404).json({ error: 'Curso não encontrado' });
    }
    const promotores = respostas.filter(r => r.nota_geral >= 9);
    const neutros = respostas.filter(r => r.nota_geral >= 7 && r.nota_geral <= 8);
    const detratores = respostas.filter(r => r.nota_geral <= 6);
    const nps = ((promotores.length - detratores.length) / respostas.length) * 100;
    const calcMedia = (campo) => {
      const valores = respostas.filter(r => r[campo] != null).map(r => r[campo]);
      return valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null;
    };
    res.json({
      nome,
      total_respostas: respostas.length,
      nps: Math.round(nps * 100) / 100,
      promotores: promotores.length,
      neutros: neutros.length,
      detratores: detratores.length,
      medias: {
        nota_geral: calcMedia('nota_geral'),
        nota_professores: calcMedia('nota_professores'),
        nota_material: calcMedia('nota_material'),
        nota_organizacao: calcMedia('nota_organizacao')
      },
      respostas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/nps/webhook/typebot
// Payload esperado (notas de 1-5 vindas do Typebot):
// {
//   "curso":                   "Nome do Curso",      <- obrigatório
//   "avaliacao_geral":          5,                   <- Q1: avaliação geral do curso (1-5)
//   "nivel_professores":        5,                   <- Q2: nível dos professores (1-5)
//   "material_didatico":        5,                   <- Q3: material didático (1-5)
//   "organizacao_atendimento":  5,                   <- Q4: organização e atendimento (1-5)
//   "faria_outro_curso":        5,                   <- Q5: faria outro curso (1-5)
//   "indicaria_amigo":          5,                   <- Q6/Q7: indicaria para amigo (1-5) <- NPS REAL
//   "feedback":                 "Texto do aluno"     <- Q8: comentário (opcional)
// }
router.post('/webhook/typebot', async (req, res) => {
  try {
    const {
      curso,
      avaliacao_geral,
      nivel_professores,
      material_didatico,
      organizacao_atendimento,
      faria_outro_curso,
      indicaria_amigo,
      feedback
    } = req.body;

    // Validação dos campos obrigatórios
    if (!curso || String(curso).trim() === '') {
      return res.status(400).json({ error: 'Campo "curso" é obrigatório.' });
    }
    if (indicaria_amigo === undefined || indicaria_amigo === null || indicaria_amigo === '') {
      return res.status(400).json({ error: 'Campo "indicaria_amigo" é obrigatório.' });
    }

    // Converter notas 1-5 do Typebot para escala 0-10 (x2)
    // nota_geral é baseada em "indicaria_amigo" — pergunta NPS padrão
    const nota_geral     = Math.round(parseFloat(indicaria_amigo) * 2);
    const nota_indicaria = nota_geral;
    const nota_faria_outro = faria_outro_curso
      ? Math.round(parseFloat(faria_outro_curso) * 2)
      : null;

    // Notas de qualidade ficam em escala 1-5 no banco (conforme dados existentes)
    const nota_professores = nivel_professores  ? parseFloat(nivel_professores)        : null;
    const nota_material    = material_didatico  ? parseFloat(material_didatico)        : null;
    const nota_organizacao = organizacao_atendimento ? parseFloat(organizacao_atendimento) : null;

    // Separar feedback em positivo ou negativo pela nota geral
    let feedback_positivo = null;
    let feedback_negativo = null;
    if (feedback && String(feedback).trim() !== '') {
      if (nota_geral >= 7) {
        feedback_positivo = String(feedback).trim();
      } else {
        feedback_negativo = String(feedback).trim();
      }
    }

    const agora = new Date();
    const data_resposta = agora.toISOString().replace('T', ' ').replace('Z', '');
    const ano = agora.getFullYear();

    const sql = `
      INSERT INTO respostas_nps
        (nome_curso, nota_geral, nota_professores, nota_indicaria, nota_faria_outro,
         nota_organizacao, nota_material, feedback_positivo, feedback_negativo,
         data_resposta, ano)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await run(sql, [
      String(curso).trim(),
      nota_geral,
      nota_professores,
      nota_indicaria,
      nota_faria_outro,
      nota_organizacao,
      nota_material,
      feedback_positivo,
      feedback_negativo,
      data_resposta,
      ano
    ]);

    console.log(`✅ Nova resposta NPS | Curso: ${curso} | Nota: ${nota_geral} | ID: ${result.id}`);

    res.status(201).json({
      success: true,
      message: 'Resposta registrada com sucesso!',
      id: result.id,
      curso: String(curso).trim(),
      nota_geral
    });

  } catch (error) {
    console.error('❌ Erro no webhook Typebot:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;