import React, { createContext, useContext, useEffect, useState } from 'react';
import { Currency } from 'utils/helper';
import { storageService } from 'utils/storage';

type CurrencyContextType = {
  currency: Currency;
  setCurrency: (c: Currency) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('INR');

  useEffect(() => {
    (async () => {
      const saved = await storageService.getCurrency();
      if (saved) setCurrencyState(saved as Currency);
    })();
  }, []);

  const setCurrency = async (c: Currency) => {
    setCurrencyState(c);
    await storageService.saveCurrency(c);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
};
