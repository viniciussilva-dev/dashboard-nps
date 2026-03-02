const FeedbackCard = ({ feedback, tipo = 'positivo' }) => {
  const isPositivo = tipo === 'positivo';
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className={`feedback-card ${isPositivo ? 'pos' : 'neg'}`}>
      <div className="feedback-text">
        {isPositivo ? '✅' : '⚠️'} {feedback.texto}
      </div>
      <div className="feedback-meta">
        <span className="feedback-curso">{feedback.curso}</span>
        <span className="feedback-nota">Nota: {feedback.nota}/10</span>
        <span className="feedback-date">{formatDate(feedback.data)}</span>
      </div>
    </div>
  );
};

export default FeedbackCard;
