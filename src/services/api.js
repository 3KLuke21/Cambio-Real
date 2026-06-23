const FAWAZ_CURRENCIES = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies.json';
const AWESOME_API_BASE = 'https://economia.awesomeapi.com.br/last';

const FALLBACK_CURRENCIES = {
  "gbp": "Libra Esterlina",
  "usd": "Dólar Americano",
  "brl": "Real Brasileiro",
  "eur": "Euro",
  "cad": "Dólar Canadense",
  "aud": "Dólar Australiano",
  "chf": "Franco Suíço",
  "jpy": "Iene Japonês",
  "cny": "Yuan Chinês",
  "usdt": "Tether USD"
};

// Fetch the master list of all currencies once
export const fetchCurrencyList = async () => {
  try {
    const res = await fetch(FAWAZ_CURRENCIES);
    if (!res.ok) throw new Error('Failed to fetch currency list');
    const data = await res.json();
    return { ...FALLBACK_CURRENCIES, ...data };
  } catch (error) {
    console.warn('Error fetching currency list, using fallback:', error);
    return FALLBACK_CURRENCIES;
  }
};

// Generate rates strictly for requested pairs using AwesomeAPI
export const fetchRates = async (activePairs = ['GBP/USD', 'USD/BRL', 'GBP/BRL']) => {
  try {
    if (!activePairs || activePairs.length === 0) return {};

    // Map "GBP/USD" to "GBP-USD"
    const apiPairs = activePairs.map(p => {
      const parts = p.split('/');
      return `${parts[0]}-${parts[1]}`;
    }).join(',');

    const res = await fetch(`${AWESOME_API_BASE}/${apiPairs}`);
    if (!res.ok) {
      throw new Error(`AwesomeAPI returned status: ${res.status}`);
    }
    
    const data = await res.json();
    const result = {};

    for (const pair of activePairs) {
      const [from, to] = pair.split('/');
      if (!from || !to) continue;

      // AwesomeAPI returns keys like "GBPBRL" for "GBP-BRL"
      const apiKey = `${from}${to}`.toUpperCase();
      const pairInfo = data[apiKey];

      if (pairInfo && pairInfo.bid) {
        const rate = parseFloat(pairInfo.bid);
        result[pair] = {
          rate: rate,
          inverse: 1 / rate,
          timestamp: pairInfo.timestamp ? parseInt(pairInfo.timestamp) * 1000 : Date.now()
        };
      } else {
        // Log warning for missing pairs
        console.warn(`Pair info not found in AwesomeAPI response for key: ${apiKey}`);
      }
    }

    return result;
  } catch (error) {
    console.error('Error fetching rates from AwesomeAPI:', error);
    return null;
  }
};

