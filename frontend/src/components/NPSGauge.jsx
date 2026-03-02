import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const NPSGauge = ({ nps }) => {
  const getNPSZone = (score) => {
    if (score < 0) return { name: 'Crítico', emoji: '😞', color: '#EF4444' };
    if (score <= 50) return { name: 'Aperfeiçoamento', emoji: '⚙️', color: '#F59E0B' };
    if (score <= 70) return { name: 'Qualidade', emoji: '🎯', color: '#3B82F6' };
    return { name: 'Excelência', emoji: '⭐', color: '#10B981' };
  };

  const zone = getNPSZone(nps);
  const displayNPS = Math.max(0, Math.min(100, nps));
  
  const data = [
    { value: displayNPS },
    { value: 100 - displayNPS }
  ];

  return (
    <div className="nps-gauge">
      <div className="gauge-chart">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              dataKey="value"
            >
              <Cell fill={zone.color} />
              <Cell fill="#E5E7EB" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="gauge-value">
          <div className="gauge-number">{Math.round(nps)}</div>
          <div className="gauge-label">NPS</div>
        </div>
      </div>
      <div className="gauge-info">
        <h2>NPS: {Math.round(nps)} — {zone.name} {zone.emoji}</h2>
        <div className="nps-zones">
          <span className="zone-badge zone-crit">😞 Crítico &lt; 0</span>
          <span className="zone-badge zone-aper">⚙️ Aperfeiçoamento 0–50</span>
          <span className="zone-badge zone-qual">🎯 Qualidade 51–70</span>
          <span className="zone-badge zone-exc">⭐ Excelência &gt; 70</span>
        </div>
      </div>
    </div>
  );
};

export default NPSGauge;
