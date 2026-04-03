export const getExchangeRate = async (baseCurrency: string, targetCurrency: string): Promise<number> => {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
    const data = await response.json();
    return data.rates[targetCurrency];
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return 1;
  }
};
