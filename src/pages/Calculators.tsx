import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getExchangeRate } from "../services/currencyService";

export function GSTCalculator() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(0);
  const [rate, setRate] = useState<number>(18);
  const gst = (amount * rate) / 100;
  const total = amount + gst;

  return (
    <div className="max-w-4xl mx-auto px-8 py-24">
      <h1 className="text-5xl font-black font-headline mb-8">{t("GST Calculator")}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">{t("Amount")}</label>
          <input 
            type="number" 
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary"
            value={amount}
            onChange={e => setAmount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">{t("GST Rate (%)")}</label>
          <input 
            type="number" 
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary"
            value={rate}
            onChange={e => setRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="pt-6 border-t border-outline-variant/10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">{t("GST Amount")}</p>
            <p className="text-3xl font-black">{gst.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">{t("Total Amount")}</p>
            <p className="text-3xl font-black text-primary">{total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaxCalculator() {
  const { t } = useTranslation();
  const [income, setIncome] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(20);
  const tax = (income * taxRate) / 100;
  const net = income - tax;

  return (
    <div className="max-w-4xl mx-auto px-8 py-24">
      <h1 className="text-5xl font-black font-headline mb-8">{t("Tax Calculator")}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">{t("Annual Income")}</label>
          <input 
            type="number" 
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary"
            value={income}
            onChange={e => setIncome(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">{t("Tax Rate (%)")}</label>
          <input 
            type="number" 
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary"
            value={taxRate}
            onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="pt-6 border-t border-outline-variant/10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">{t("Tax Payable")}</p>
            <p className="text-3xl font-black">{tax.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">{t("Net Income")}</p>
            <p className="text-3xl font-black text-primary">{net.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscountCalculator() {
  const { t } = useTranslation();
  const [price, setPrice] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(10);
  const savings = (price * discount) / 100;
  const finalPrice = price - savings;

  return (
    <div className="max-w-4xl mx-auto px-8 py-24">
      <h1 className="text-5xl font-black font-headline mb-8">{t("Discount Calculator")}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">{t("Original Price")}</label>
          <input 
            type="number" 
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary"
            value={price}
            onChange={e => setPrice(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">{t("Discount (%)")}</label>
          <input 
            type="number" 
            className="w-full p-4 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary"
            value={discount}
            onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="pt-6 border-t border-outline-variant/10 grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-on-surface-variant mb-1">{t("You Save")}</p>
            <p className="text-3xl font-black">{savings.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-on-surface-variant mb-1">{t("Final Price")}</p>
            <p className="text-3xl font-black text-primary">{finalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CurrencyConverter() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState<number>(1);
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [rate, setRate] = useState(0.92);

  const CURRENCIES = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "MXN", name: "Mexican Peso", symbol: "$" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  ];

  useEffect(() => {
    const fetchRate = async () => {
      if (from === to) {
        setRate(1);
      } else {
        try {
          const newRate = await getExchangeRate(from, to);
          setRate(newRate);
        } catch (error) {
          console.error("Failed to fetch exchange rate", error);
        }
      }
    };
    fetchRate();
  }, [from, to]);

  return (
    <div className="max-w-4xl mx-auto px-8 py-24">
      <h1 className="text-5xl font-black font-headline mb-8">{t("Currency Converter")}</h1>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-outline-variant/10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">{t("Amount")}</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-on-surface-variant">
                {CURRENCIES.find(c => c.code === from)?.symbol}
              </span>
              <input 
                type="number" 
                className="w-full p-6 pl-12 bg-surface-container-low rounded-2xl border-none text-2xl font-black focus:ring-2 focus:ring-primary"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">{t("From")}</label>
              <select 
                className="w-full p-6 bg-surface-container-low rounded-2xl border-none font-bold focus:ring-2 focus:ring-primary appearance-none" 
                value={from} 
                onChange={e => setFrom(e.target.value)}
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">{t("To")}</label>
              <select 
                className="w-full p-6 bg-surface-container-low rounded-2xl border-none font-bold focus:ring-2 focus:ring-primary appearance-none" 
                value={to} 
                onChange={e => setTo(e.target.value)}
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} - {c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-outline-variant/10 text-center space-y-4">
          <p className="text-lg text-on-surface-variant font-medium">
            {amount.toLocaleString()} {from} {t("equals")}
          </p>
          <div className="flex flex-col items-center">
            <h2 className="text-6xl md:text-7xl font-black text-primary tracking-tighter">
              {(amount * rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {to}
            </h2>
            <p className="text-sm font-bold text-zinc-400 mt-4 uppercase tracking-[0.2em]">
              1 {from} = {rate.toFixed(4)} {to}
            </p>
          </div>
          <p className="text-xs text-zinc-400 pt-8">{t("Institutional-grade exchange rates. Updated every minute.")}</p>
        </div>
      </div>
    </div>
  );
}
