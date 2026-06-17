import { useState, useEffect } from 'react';
import './index.css';
import TickerPanel from './components/TickerPanel';
import Calculator from './components/Calculator';
import CurrencyModal from './components/CurrencyModal';
import { fetchCurrencyList } from './services/api';

function App() {
  const [activePairs, setActivePairs] = useState(['GBP/USDT', 'USDT/BRL', 'GBP/BRL']);
  const [currencyDict, setCurrencyDict] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState('light'); // Padrão light (estilo Wise)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchCurrencyList().then(data => {
      if (data) setCurrencyDict(data);
    });
  }, []);

  const handleAddPair = (pairStr) => {
    const upperPair = pairStr.toUpperCase();
    if (!activePairs.includes(upperPair)) {
      setActivePairs([...activePairs, upperPair]);
    }
    setIsModalOpen(false);
  };

  const handleRemovePair = (pairStr) => {
    if (activePairs.length <= 1) {
      alert("Você precisa de pelo menos 1 par ativo.");
      return;
    }
    setActivePairs(activePairs.filter(p => p !== pairStr));
  };

  return (
    <div className="container fade-in">
      <header>
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          CambioReal
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button className="theme-toggle-btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          <button className="primary" onClick={() => setIsModalOpen(true)}>
            + Adicionar Par
          </button>
        </div>
      </header>
      
      <main className="grid-layout">
        <aside>
          <TickerPanel 
            activePairs={activePairs} 
            onRemovePair={handleRemovePair}
          />
        </aside>
        <section>
          <Calculator activePairs={activePairs} />
        </section>
      </main>

      <CurrencyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        currencyDict={currencyDict}
        onAdd={handleAddPair}
      />
    </div>
  );
}

export default App;
