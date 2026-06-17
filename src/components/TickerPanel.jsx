import { useState, useEffect } from 'react';
import { fetchRates } from '../services/api';
import './TickerPanel.css';

export default function TickerPanel({ activePairs, onRemovePair }) {
  const [rates, setRates] = useState(null);
  const [prevRates, setPrevRates] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    let interval;
    const updateRates = async () => {
      const data = await fetchRates(activePairs);
      if (data) {
        setRates(currentRates => {
          setPrevRates(currentRates);
          return data;
        });
        setLastUpdate(new Date());
      }
    };

    updateRates();
    interval = setInterval(updateRates, 5000);
    return () => clearInterval(interval);
  }, [activePairs]);

  const getStatusClass = (pair, value) => {
    if (!prevRates || !prevRates[pair]) return '';
    return value > prevRates[pair].rate ? 'rate-up' : value < prevRates[pair].rate ? 'rate-down' : '';
  };

  if (!rates) {
    return (
      <div className="glass-panel ticker-container">
        <h3>Live Market</h3>
        <p>Loading rates...</p>
      </div>
    );
  }

  return (
    <div className="glass-panel ticker-container">
      <div className="flex-between">
        <h3>Live Market</h3>
        <div className="live-indicator">
          <span className="dot pulse"></span>
          Live
        </div>
      </div>

      <div className="active-currencies-tags">
        {activePairs.map(p => (
          <div key={p} className="currency-tag">
            {p}
            <button className="tag-remove-btn" onClick={() => onRemovePair(p)}>×</button>
          </div>
        ))}
      </div>
      
      <div className="tickers-list">
        {activePairs.map(pair => {
          // If the API hasn't returned it yet, skip
          if (!rates[pair]) return null;

          return (
            <div key={pair} className="ticker-card glass-panel fade-in">
              <div className="ticker-header">
                <span className="pair-name">{pair}</span>
              </div>
              <div className={`ticker-price ${getStatusClass(pair, rates[pair].rate)}`}>
                {rates[pair].rate.toFixed(5)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="update-time">
        Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : ''}
      </div>
    </div>
  );
}
