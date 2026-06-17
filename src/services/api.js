const FAWAZ_CURRENCIES = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
const FAWAZ_RATES = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json';

// Fetch the master list of all currencies once
export const fetchCurrencyList = async () => {
  try {
    const res = await fetch(FAWAZ_CURRENCIES);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching currency list:', error);
    return null;
  }
};

// Generate rates strictly for requested pairs
export const fetchRates = async (activePairs = ['GBP/USDT', 'USDT/BRL', 'GBP/BRL']) => {
  try {
    const usdRatesRes = await fetch(FAWAZ_RATES);
    const usdData = await usdRatesRes.json();
    const ratesBase = usdData.usd;

    const result = {};
    
    for (const pair of activePairs) {
      const [from, to] = pair.split('/');
      if (!from || !to) continue;

      const fromKey = from.toLowerCase();
      const toKey = to.toLowerCase();
      
      if (ratesBase[fromKey] && ratesBase[toKey]) {
        // Rate: How many 'to' for 1 'from'
        const rate = ratesBase[toKey] / ratesBase[fromKey];
        
        result[pair] = {
          rate: rate,
          inverse: 1 / rate,
          timestamp: Date.now()
        };
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching dynamic rates:', error);
    return null;
  }
};
