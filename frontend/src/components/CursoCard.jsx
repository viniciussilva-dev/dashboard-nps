import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CursoCard = ({ curso }) => {
  const navigate = useNavigate();
  
  const getBadgeColor = (nps) => {
    if (nps < 0) return '#EF4444';
    if (nps <= 50) return '#F59E0B';
    if (nps <= 70) return '#3B82F6';
    return '#10B981';
  };

  const getNPSZone = (nps) => {
    if (nps < 0) return { name: 'Crítico', emoji: '😞' };
    if (nps <= 50) return { name: 'Aperfeiçoamento', emoji: '⚙️' };
    if (nps <= 70) return { name: 'Qualidade', emoji: '🎯' };
    return { name: 'Excelência', emoji: '⭐' };
  };

  const zone = getNPSZone(curso.nps);
  const badgeColor = getBadgeColor(curso.nps);

  return (
    <div 
      className="curso-card" 
      onClick={() => navigate(`/curso/${encodeURIComponent(curso.nome)}`)}
    >
      <div 
        className="curso-badge" 
        style={{ backgroundColor: badgeColor }}
      >
        {Math.round(curso.nps)}
      </div>
      
      <div className="curso-info">
        <h3>{curso.nome}</h3>
        <div className="curso-stats">
          <span className="stat">📊 {curso.total} respostas</span>
          <span className="stat promotor">👍 {curso.promotores}</span>
          <span className="stat neutro">😐 {curso.neutros}</span>
          <span className="stat detrator">👎 {curso.detratores}</span>
          <span className="stat zone" style={{ color: badgeColor }}>
            {zone.emoji} {zone.name}
          </span>
        </div>
      </div>
      
      <div className="curso-action">
        <ArrowRight size={20} />
      </div>
    </div>
  );
};

export default CursoCard;
