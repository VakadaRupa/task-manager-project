import React from 'react';

const MetricCard = ({ title, value, icon: Icon, colorClass }) => {
  return (
    <div className={`metric-card ${colorClass}`}>
      <div className="metric-icon-wrapper">
        <Icon size={24} />
      </div>
      <div className="metric-details">
        <h3 className="metric-title">{title}</h3>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;
