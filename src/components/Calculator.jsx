import { useState, useEffect } from 'react';
import { fetchRates } from '../services/api';
import './Calculator.css';

export default function Calculator({ activePairs }) {
  const [liveRates, setLiveRates] = useState(null);
  const [initialCapital, setInitialCapital] = useState(30000);
  const [initialCurrency, setInitialCurrency] = useState('GBP');

  // Deriva dinamicamente as moedas a partir dos pares para preencher os menus
  const activeCurrencies = Array.from(new Set(activePairs.flatMap(p => p.split('/'))));

  const [steps, setSteps] = useState([
    {
      id: 1,
      from: 'GBP',
      to: 'USDT',
      quotePair: 'GBP/USDT',
      marginType: 'percent', 
      marginValue: -4, 
      lockedRate: null, 
    },
    {
      id: 2,
      from: 'USDT',
      to: 'BRL',
      quotePair: 'USDT/BRL',
      marginType: 'points',
      marginValue: 0.06,
      lockedRate: null,
    },
    {
      id: 3,
      from: 'BRL',
      to: 'GBP',
      quotePair: 'GBP/BRL', 
      marginType: 'points',
      marginValue: -0.50, 
      lockedRate: null,
    }
  ]);

  useEffect(() => {
    const updateRates = async () => {
      const data = await fetchRates(activePairs);
      if (data) setLiveRates(data);
    };
    updateRates();
    const interval = setInterval(updateRates, 5000);
    return () => clearInterval(interval);
  }, [activePairs]);

  const getMarketRate = (quotePair) => {
    if (!liveRates) return 1;
    if (liveRates[quotePair]) return liveRates[quotePair].rate;
    
    // inverse fallback if pair is inverted dynamically
    const parts = quotePair.split('/');
    if (parts.length === 2) {
      const inv = `${parts[1]}/${parts[0]}`;
      if (liveRates[inv]) return liveRates[inv].inverse;
    }
    return 1;
  };

  const calculateStepRate = (marketRate, marginType, marginValue) => {
    let finalRate = marketRate;
    if (marginType === 'points') {
      finalRate = marketRate + parseFloat(marginValue || 0);
    } else if (marginType === 'percent') {
      finalRate = marketRate * (1 + parseFloat(marginValue || 0) / 100);
    }
    return Math.max(0, finalRate);
  };

  const calculateOutput = (inputValue, finalRate, from, quotePair) => {
    const baseCurrency = quotePair.split('/')[0];
    if (from === baseCurrency) {
      return inputValue * finalRate;
    } else {
      return finalRate > 0 ? inputValue / finalRate : 0;
    }
  };

  const handleStepChange = (id, field, value) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const toggleLock = (id, quotePair) => {
    const step = steps.find(s => s.id === id);
    if (step.lockedRate) {
      handleStepChange(id, 'lockedRate', null);
    } else {
      const rate = getMarketRate(quotePair);
      handleStepChange(id, 'lockedRate', rate);
    }
  };

  const addStep = () => {
    const lastStep = steps[steps.length - 1];
    setSteps([
      ...steps,
      {
        id: Date.now(),
        from: lastStep ? lastStep.to : (activeCurrencies[0] || 'GBP'),
        to: activeCurrencies[1] || 'BRL',
        quotePair: activePairs[0] || 'GBP/BRL',
        marginType: 'none',
        marginValue: 0,
        lockedRate: null,
      }
    ]);
  };

  const removeStep = (id) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  let currentValue = initialCapital;

  return (
    <div className="calculator-wrapper">
      <div className="calc-header glass-panel">
        <h2>Simulador de Operações</h2>
        <div className="initial-setup">
          <div className="input-group">
            <label>Capital Inicial</label>
            <input 
              type="number" 
              value={initialCapital} 
              onChange={e => setInitialCapital(parseFloat(e.target.value) || 0)} 
            />
          </div>
          <div className="input-group">
            <label>Moeda Base</label>
            <select value={initialCurrency} onChange={e => setInitialCurrency(e.target.value)}>
              {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="steps-container">
        {steps.map((step, index) => {
          const inputValue = index === 0 ? initialCapital : currentValue;
          
          const marketRate = step.lockedRate || getMarketRate(step.quotePair);
          const finalRate = calculateStepRate(marketRate, step.marginType, step.marginValue);
          const outputValue = calculateOutput(inputValue, finalRate, step.from, step.quotePair);
          
          currentValue = outputValue;

          return (
            <div key={step.id} className="step-card glass-panel fade-in">
              <button className="remove-btn" onClick={() => removeStep(step.id)}>×</button>
              
              <div className="step-header">
                <h3>Etapa {index + 1}</h3>
                <div className="pair-selector">
                  <select value={step.from} onChange={e => handleStepChange(step.id, 'from', e.target.value)}>
                    {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="arrow">→</span>
                  <select value={step.to} onChange={e => handleStepChange(step.id, 'to', e.target.value)}>
                    {activeCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span style={{marginLeft: '15px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Base Cotação:</span>
                  <select 
                    value={step.quotePair} 
                    onChange={e => handleStepChange(step.id, 'quotePair', e.target.value)}
                    style={{marginLeft: '5px'}}
                  >
                    {/* Only show the exact user-defined pairs */}
                    {activePairs.map(p => <option key={p} value={p}>{p}</option>)}
                    {/* Add inverted fallback options if needed implicitly */}
                    {activePairs.map(p => {
                      const inv = `${p.split('/')[1]}/${p.split('/')[0]}`;
                      return <option key={inv} value={inv}>{inv}</option>
                    })}
                  </select>
                </div>
              </div>

              <div className="step-body">
                <div className="rate-info">
                  <div className="flex-between">
                    <span>Cotação Comercial ({step.quotePair}):</span>
                    <span className="monospace">{marketRate.toFixed(5)}</span>
                  </div>
                  <button 
                    className={`lock-btn ${step.lockedRate ? 'locked' : ''}`}
                    onClick={() => toggleLock(step.id, step.quotePair)}
                  >
                    {step.lockedRate ? '🔒 Locked' : '🔓 Lock-in Live Rate'}
                  </button>
                </div>

                <div className="margin-config">
                  <label>Margem / Custo:</label>
                  <div className="margin-inputs">
                    <select value={step.marginType} onChange={e => handleStepChange(step.id, 'marginType', e.target.value)}>
                      <option value="none">Sem Margem</option>
                      <option value="points">Pontos (Ex: +0.06)</option>
                      <option value="percent">Porcentagem (%)</option>
                    </select>
                    {step.marginType !== 'none' && (
                      <input 
                        type="number" 
                        step="0.01" 
                        value={step.marginValue} 
                        onChange={e => handleStepChange(step.id, 'marginValue', e.target.value)} 
                        placeholder={step.marginType === 'percent' ? '% (-4)' : 'Valor'}
                      />
                    )}
                  </div>
                </div>

                <div className="step-result">
                  <div className="flex-between">
                    <span>Taxa Aplicada ({step.quotePair}):</span>
                    <strong className="monospace text-accent">{finalRate.toFixed(5)}</strong>
                  </div>
                  <div className="conversion-flow">
                    <div className="conv-value from-value">
                      <span className="currency-symbol">{step.from}</span>
                      {inputValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="conv-arrow">⟶</div>
                    <div className="conv-value to-value">
                      <span className="currency-symbol">{step.to}</span>
                      {outputValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="add-step-btn" onClick={addStep}>
        + Adicionar Etapa
      </button>

      <div className="final-summary glass-panel">
        <h3>Resumo da Operação</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span>Capital Inicial</span>
            <strong>{initialCapital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {initialCurrency}</strong>
          </div>
          <div className="summary-item highlight">
            <span>Capital Final</span>
            <strong>{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {steps.length > 0 ? steps[steps.length-1].to : initialCurrency}</strong>
          </div>
          
          {steps.length > 0 && steps[steps.length-1].to === initialCurrency && (
            <div className={`summary-item profit ${currentValue - initialCapital >= 0 ? 'positive' : 'negative'}`}>
              <span>Lucro Líquido</span>
              <strong>
                {(currentValue - initialCapital).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {initialCurrency}
              </strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
