const express = require('express');
const router = express.Router();
const { query, run } = require('../database');

// GET /api/nps/stats - Estatísticas gerais
router.get('/stats', async (req, res) => {
  try {
    const respostas = await query('SELECT * FROM respostas_nps');
    
    const total = respostas.length;
    const promotores = respostas.filter(r => r.nota_geral >= 9).length;
    const neutros = respostas.filter(r => r.nota_geral >= 7 && r.nota_geral <= 8).length;
    const detratores = respostas.filter(r => r.nota_geral <= 6).length;
    
    const nps = total > 0 ? ((promotores - detratores) / total) * 100 : 0;
    
    res.json({
      total_respostas: total,
      promotores,
      neutros,
      detratores,
      nps_score: Math.round(nps * 100) / 100
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nps/respostas - Listar todas as respostas
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

// GET /api/nps/cursos - Listar cursos com NPS
router.get('/cursos', async (req, res) => {
  try {
    const respostas = await query('SELECT * FROM respostas_nps');
    
    // Agrupar por curso
    const cursoData = {};
    
    respostas.forEach(r => {
      if (!cursoData[r.nome_curso]) {
        cursoData[r.nome_curso] = {
          nome: r.nome_curso,
          total: 0,
          promotores: 0,
          neutros: 0,
          detratores: 0
        };
      }
      
      cursoData[r.nome_curso].total++;
      
      if (r.nota_geral >= 9) cursoData[r.nome_curso].promotores++;
      else if (r.nota_geral >= 7) cursoData[r.nome_curso].neutros++;
      else cursoData[r.nome_curso].detratores++;
    });
    
    // Calcular NPS de cada curso
    const cursos = Object.values(cursoData).map(curso => ({
      ...curso,
      nps: ((curso.promotores - curso.detratores) / curso.total) * 100
    })).sort((a, b) => b.nps - a.nps);
    
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/nps/curso/:nome - Detalhes de um curso específico
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
    
    // Calcular médias
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

module.exports = router;