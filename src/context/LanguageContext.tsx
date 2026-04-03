import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import i18n from "../lib/i18n";
import { LANGUAGES, COUNTRIES } from "../constants/countries";

interface Language {
  code: string;
  name: string;
  langLabel: string;
  flag: string;
  isoCode: string;
  phones?: string[];
  dialCode?: string;
}

interface LanguageContextType {
  t: (key: string) => string;
  lang: string;
  currentLanguage: Language;
  selectedPhone: string;
  currency: string;
  setLang: (lang: string, regionName?: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const initialLang = localStorage.getItem("lang") || "en";
  const initialRegion = localStorage.getItem("selectedCountry") || "United States";
  
  const [lang, setLangState] = useState(initialLang);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    LANGUAGES.find(l => l.code === initialLang && l.name === initialRegion) || LANGUAGES[0]
  );
  const [selectedPhone, setSelectedPhone] = useState<string>(() => {
    const l = LANGUAGES.find(l => l.code === initialLang && l.name === initialRegion) || LANGUAGES[0];
    return l.phones ? l.phones[Math.floor(Math.random() * l.phones.length)] : "";
  });
  const [currency, setCurrency] = useState<string>(() => {
    const country = COUNTRIES.find(c => c.name === initialRegion) || COUNTRIES[0];
    return country.currency;
  });

  const setLang = (newLang: string, regionName?: string) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
    
    let newLangObj: Language | undefined;
    if (regionName) {
      localStorage.setItem("selectedCountry", regionName);
      newLangObj = LANGUAGES.find(l => l.code === newLang && l.name === regionName);
    } else {
      newLangObj = LANGUAGES.find(l => l.code === newLang);
    }

    if (newLangObj) {
      setCurrentLanguage(newLangObj);
      if (newLangObj.phones) {
        setSelectedPhone(newLangObj.phones[Math.floor(Math.random() * newLangObj.phones.length)]);
      }
      
      const countryMatch = COUNTRIES.find(c => c.name === regionName || (newLangObj && c.isoCode === newLangObj.isoCode));
      if (countryMatch) {
         setCurrency(countryMatch.currency);
      }
    }

    const cookieValue = `/en/${newLang}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/;`;
  };

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const res = await fetch(`/languages/en.json`);
        if (res.ok) {
          const data = await res.json();
          setTranslations(data);
        }
      } catch (error) {
        console.error("Failed to load language:", error);
      }
    };

    fetchTranslations();
  }, []);

  const t = (key: string) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ t, lang, currentLanguage, selectedPhone, currency, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
