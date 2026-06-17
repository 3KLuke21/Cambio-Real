import { useState } from 'react';
import './CurrencyModal.css';

export default function CurrencyModal({ isOpen, onClose, currencyDict, onAdd }) {
  const [fromCode, setFromCode] = useState('eur');
  const [toCode, setToCode] = useState('usdt');

  if (!isOpen) return null;

  const allCodes = Object.keys(currencyDict).sort();

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel fade-in">
        <div className="modal-header">
          <h3>Adicionar Novo Par</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-desc">
            Selecione as duas moedas que compõem o par que você deseja operar (Ex: EUR/USDT).
          </p>
          
          <div className="pair-builder">
            <div className="select-wrapper">
              <label>De (Moeda Base):</label>
              <select value={fromCode} onChange={e => setFromCode(e.target.value)}>
                {allCodes.map(c => <option key={`from-${c}`} value={c}>{c.toUpperCase()} - {currencyDict[c]}</option>)}
              </select>
            </div>
            
            <div className="pair-divider">/</div>
            
            <div className="select-wrapper">
              <label>Para (Moeda Cotação):</label>
              <select value={toCode} onChange={e => setToCode(e.target.value)}>
                {allCodes.map(c => <option key={`to-${c}`} value={c}>{c.toUpperCase()} - {currencyDict[c]}</option>)}
              </select>
            </div>
          </div>
          
          <button 
            className="primary add-pair-btn" 
            onClick={() => onAdd(`${fromCode}/${toCode}`)}
            disabled={fromCode === toCode}
          >
            Salvar Par: {fromCode.toUpperCase()}/{toCode.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
