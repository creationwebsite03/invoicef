import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGES } from "../constants/countries";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, CreditCard, LogOut, User as UserIcon, Menu, X, ChevronDown, LayoutDashboard, FileText, ShieldCheck, LogIn, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";
import LoginModal from "./LoginModal";
import GoogleTranslate from "./GoogleTranslate";
import { db } from "../lib/firebase";
import { collection, query, where, getCountFromServer } from "firebase/firestore";


export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang, currentLanguage, selectedPhone } = useLanguage();
  const { user, loading, signIn, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem("selectedCountry") || "United States");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global login modal trigger — any component can dispatch this event
  useEffect(() => {
    const handleOpenLogin = () => setIsLoginModalOpen(true);
    document.addEventListener("open-login-modal", handleOpenLogin);
    return () => document.removeEventListener("open-login-modal", handleOpenLogin);
  }, []);

  useEffect(() => {
    // Proactively check and enforce defaults if missing
    if (!localStorage.getItem("selectedCountry")) {
      localStorage.setItem("selectedCountry", "United States");
      setSelectedCountry("United States");
    }

    if (!localStorage.getItem("lang")) {
      localStorage.setItem("lang", "en");
      setLang("en");
    }
  }, [setLang]);


  useEffect(() => {
    const fetchInvoiceCount = async () => {
      if (user) {
        try {
          const q = query(collection(db, `users/${user.uid}/invoices`));
          const snapshot = await getCountFromServer(q);
          setInvoiceCount(snapshot.data().count);
        } catch (error) {
          console.error("Error fetching invoice count:", error);
        }
      } else {
        setInvoiceCount(null);
      }
    };
    fetchInvoiceCount();
  }, [user]);

  // Bulletproof FAST SYNC: Re-apply translation immediately on every route change
  useEffect(() => {
    const currentLang = localStorage.getItem("lang") || "en";
    if (currentLang !== "en") {
      const applyTranslation = () => {
        const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (combo) {
          if (combo.value !== currentLang) {
            combo.value = currentLang;
            combo.dispatchEvent(new Event("change"));
          }
        }
      };

      // Aggressive Sync for 1 second (every 10ms) to ensure DOM is translated the moment it renders
      const fastInterval = setInterval(applyTranslation, 10);
      const timer = setTimeout(() => clearInterval(fastInterval), 1000);

      applyTranslation();
      return () => {
        clearInterval(fastInterval);
        clearTimeout(timer);
      };
    }
  }, [location.pathname]);

  const changeLanguage = (lng: string, regionName: string) => {
    // 1. Immediate State Update (Fast UI)
    setLang(lng, regionName);
    setIsLangOpen(false);

    // 2. Cookie Management (Comprehensive for all potential domains)
    const cookieValue = `/en/${lng}`;
    const domains = ['', window.location.hostname, '.' + window.location.hostname];
    domains.forEach(d => {
      document.cookie = `googtrans=${cookieValue}; path=/;${d ? ' domain=' + d : ''}`;
    });

    // 3. Widget Trigger (Direct Interaction)
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (combo) {
      combo.value = lng;
      combo.dispatchEvent(new Event("change"));

      // Force reload only if switching back to English to clear Google's DOM injections
      if (lng === 'en') {
        setTimeout(() => window.location.reload(), 10);
      }
    } else {
      // Fallback reload if widget isn't ready
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background font-body text-on-surface antialiased">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 h-20 bg-white/80 backdrop-blur-xl shadow-sm border-b border-outline-variant/10">
        <div className="flex justify-between items-center px-4 md:px-8 h-20 w-full max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tighter text-zinc-900 font-headline notranslate">Invoice Generator</Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            <Link to="/" className={cn("font-bold text-sm uppercase tracking-[0.2em] transition-all duration-200 hover:opacity-80", location.pathname === "/" ? "text-primary border-b-2 border-primary pb-1" : "text-zinc-400")}>{t("Home")}</Link>
            <Link to="/tools" className={cn("font-bold text-sm uppercase tracking-[0.2em] transition-all duration-200 hover:opacity-80", location.pathname.startsWith("/tools") ? "text-primary border-b-2 border-primary pb-1" : "text-zinc-400")}>{t("Tools")}</Link>
            <Link to="/about" className={cn("font-bold text-sm uppercase tracking-[0.2em] transition-all duration-200 hover:opacity-80", location.pathname === "/about" ? "text-primary border-b-2 border-primary pb-1" : "text-zinc-400")}>{t("About")}</Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsLangOpen(true)}
                className="group flex items-center justify-center w-11 h-11 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
                title={selectedCountry}
              >
                <div className="relative">
                  <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm ring-1 ring-black/5">
                    <img
                      src={`https://flagcdn.com/w80/${LANGUAGES.find(l => l.name === selectedCountry)?.isoCode || "us"}.png`}
                      alt={selectedCountry}
                      className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
                    <Globe size={9} className="text-zinc-400 group-hover:text-zinc-900 group-hover:rotate-12 transition-all" />
                  </div>
                </div>
              </button>
            </div>


            {loading ? (
              <div className="hidden lg:block w-32 h-10 bg-zinc-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={cn(
                    "flex items-center gap-2 p-1.5 rounded-full transition-all border border-zinc-100 shadow-sm hover:shadow-md active:scale-95",
                    isProfileOpen ? "bg-zinc-900 border-zinc-900 shadow-lg shadow-zinc-900/10" : "bg-white hover:border-zinc-200"
                  )}
                >
                  <div className="relative">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const nextSibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                          if (nextSibling) nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-inner",
                      isProfileOpen ? "bg-white text-zinc-900" : "bg-gradient-to-br from-zinc-800 to-zinc-950 text-white",
                      user.photoURL ? "hidden" : "flex"
                    )}>
                      <UserIcon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-sm" />
                  </div>
                  <ChevronDown size={14} className={cn("mr-1 transition-transform duration-300", isProfileOpen ? "text-white rotate-180" : "text-zinc-400")} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-zinc-100 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] p-3 z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-5 mb-4 bg-zinc-50/50 rounded-2xl flex items-center gap-4">
                      <div className="relative">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt=""
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              const nextSibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                              if (nextSibling) nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={cn(
                          "w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 text-white flex items-center justify-center shadow-inner",
                          user.photoURL ? "hidden" : "flex"
                        )}>
                          <UserIcon size={20} strokeWidth={2.5} />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-zinc-900 truncate leading-tight">{user.displayName || "User"}</p>
                        <p className="text-[10px] font-medium text-zinc-400 truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => { navigate("/dashboard"); setIsProfileOpen(false); }}
                        className="flex items-center gap-3 px-3 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-all group w-full text-left"
                      >
                        <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                          <LayoutDashboard size={14} />
                        </div>
                        {t("User Dashboard")}
                      </button>

                      <button
                        onClick={() => { navigate("/my-invoices"); setIsProfileOpen(false); }}
                        className="flex items-center justify-between px-3 py-3 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl transition-all group w-full text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                            <FileText size={14} />
                          </div>
                          {t("My Invoices")}
                        </div>
                        {invoiceCount !== null && (
                          <span className="text-[10px] font-black text-zinc-300 group-hover:text-zinc-900 transition-colors">
                            {invoiceCount}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-50">
                      <button
                        onClick={() => { signOut(); setIsProfileOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-3 text-xs font-bold text-rose-500 hover:bg-rose-50/50 rounded-xl transition-all group"
                      >
                        <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-rose-300 group-hover:bg-rose-500 group-hover:text-white transition-all">
                          <LogOut size={14} />
                        </div>
                        {t("Logout")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden lg:flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white px-6 h-10 bg-zinc-900 rounded-full transition-all shadow-lg shadow-zinc-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn size={18} />
                {t("Login")}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button className="lg:hidden p-2 text-zinc-900 ml-1" onClick={() => setIsMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay (Backdrop) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/40 z-50 lg:hidden backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-out Sidebar Panel */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden flex flex-col",
        isMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
          <span className="text-xl font-black font-headline tracking-tighter text-zinc-900">Invoice Generator</span>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("Navigation")}</p>
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-zinc-900 hover:text-primary transition-colors">{t("Home")}</Link>
            <Link to="/tools" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-zinc-900 hover:text-primary transition-colors">{t("Tools")}</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-lg font-bold text-zinc-900 hover:text-primary transition-colors">{t("About")}</Link>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{t("Settings")}</p>
            <button
              onClick={() => { setIsLangOpen(true); setIsMenuOpen(false); }}
              className="flex items-center gap-4 group w-full"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-100 shadow-sm group-hover:bg-zinc-100 transition-all">
                  <img
                    src={`https://flagcdn.com/w80/${LANGUAGES.find(l => l.name === selectedCountry)?.isoCode || "us"}.png`}
                    alt=""
                    className="w-8 h-5 object-cover rounded-sm shadow-sm grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-zinc-100 shadow-md">
                  <Globe size={10} className="text-zinc-400" />
                </div>
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">{t("Region / Language")}</span>
                <span className="text-base font-bold text-zinc-900 tracking-tight">{selectedCountry}</span>
              </div>
            </button>
            {/* Removed redundant mobile widget */}
          </div>

          <div className="pt-8 space-y-4 border-t border-zinc-100">
            {loading ? (
              <div className="w-full h-12 bg-zinc-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="space-y-6">
                {/* Antigravity Mobile Profile Node */}
                <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl opacity-50" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-4">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="" 
                          className="w-16 h-16 rounded-full border-2 border-white/10 p-1 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const nextSibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                            if (nextSibling) nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={cn(
                        "w-16 h-16 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-inner border-2 border-white/10",
                        user.photoURL ? "hidden" : "flex"
                      )}>
                        <UserIcon size={28} strokeWidth={2.5} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-zinc-950 flex items-center justify-center shadow-lg">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center overflow-hidden w-full px-2">
                       <h4 className="text-lg font-black italic tracking-tighter uppercase truncate leading-none">{user.displayName || "User"}</h4>
                       <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] mt-2 opacity-60">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 px-1">
                  <button
                    onClick={() => { navigate("/dashboard"); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100/50 rounded-2xl transition-all active:scale-95 group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white shadow-sm rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                        <LayoutDashboard size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-zinc-900">{t("Command Center")}</span>
                    </div>
                    <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => { navigate("/my-invoices"); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100/50 rounded-2xl transition-all active:scale-95 group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-white shadow-sm rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                        <FileText size={20} strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-zinc-900">{t("Data Archive")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {invoiceCount !== null && (
                        <span className="px-3 py-1 bg-white border border-zinc-100 text-zinc-400 rounded-full text-[10px] font-black group-hover:bg-zinc-950 group-hover:text-white group-hover:border-zinc-950 transition-all">
                          {invoiceCount}
                        </span>
                      )}
                      <ArrowRight size={16} className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                  
                  <div className="pt-8 px-2">
                    <button 
                      onClick={() => { signOut(); setIsMenuOpen(false); }} 
                      className="w-full flex items-center justify-center gap-4 py-5 bg-rose-50 text-rose-500 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all duration-700 active:scale-95 shadow-sm shadow-rose-100"
                    >
                      <LogOut size={18} strokeWidth={3} /> {t("Terminate Node")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setIsLoginModalOpen(true); setIsMenuOpen(false); }}
                className="w-full py-4 bg-zinc-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-md"
              >
                <LogIn size={20} />
                {t("Login")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-20 transition-all duration-300 min-h-[calc(100vh-80px)] overflow-x-hidden">
        {children}
      </main>


      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Simple Language & Region Modal */}
      <AnimatePresence mode="wait">
        {isLangOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm"
              onClick={() => setIsLangOpen(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_120px_rgba(0,0,0,0.15)] border border-zinc-100 flex flex-col max-h-[90vh] notranslate overflow-hidden"
            >
              {/* Command Header */}
              <div className="p-8 pb-6 bg-white/50 border-b border-zinc-100/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black font-headline tracking-tighter uppercase text-zinc-900">{t("Select Region")}</h4>
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t("Choose your language & region")}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsLangOpen(false)}
                    className="p-3 bg-zinc-100 hover:bg-zinc-900 hover:text-white rounded-2xl transition-all group"
                  >
                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Node Matrix (Grid) */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6 px-2">{t("Available Regions")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LANGUAGES.map((l, i) => {
                    const isSelected = selectedCountry === l.name && lang === l.code;
                    return (
                      <motion.button
                        key={`${l.code}-${i}`}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => {
                          changeLanguage(l.code, l.name);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "group relative flex items-center justify-between p-4 rounded-[2rem] transition-all duration-300 border text-left overflow-hidden",
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 text-white shadow-xl shadow-zinc-900/10 scale-[1.02]"
                            : "bg-white border-zinc-100 hover:border-zinc-900/20 hover:shadow-lg hover:shadow-zinc-500/5"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeGlow"
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                        )}
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl overflow-hidden border-2 shadow-sm flex-shrink-0 transition-transform duration-500",
                            isSelected ? "border-white/50" : "border-zinc-100"
                          )}>
                            <img
                              src={`https://flagcdn.com/w80/${l.isoCode}.png`}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-wider mb-0.5",
                              isSelected ? "text-white/60" : "text-zinc-500"
                            )}>
                              {l.name}
                            </span>
                            <span className="text-base font-bold truncate leading-tight">{l.langLabel}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-900 shadow-lg">
                            <CheckCircle2 size={16} />
                          </div>
                        )}

                        {/* Background subtle decoration */}
                        {!isSelected && (
                          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Edge Hub Footer */}
              <div className="p-8 bg-zinc-50/50 border-t border-zinc-100/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Connection Status</span>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-bold text-zinc-900 uppercase tracking-tighter">Encrypted Matrix</span>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {LANGUAGES.slice(0, 4).map((l, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                        <img src={`https://flagcdn.com/w40/${l.isoCode}.png`} alt="" className="w-full h-full object-cover grayscale-[0.5]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <section className="sr-only opacity-0 absolute -z-50 h-0 overflow-hidden" aria-hidden="true">
        <h2>Top Global Invoicing Search Terms & Features</h2>
        <ul>
          <li>Free professional invoice generator online</li>
          <li>Top invoice maker app for small businesses</li>
          <li>Online billing software free no signup</li>
          <li>Create invoice online simple and fast</li>
          <li>PDF receipt maker free download</li>
          <li>Service invoice templates for freelancers</li>
          <li>Consulting bill generator securely stored</li>
          <li>Create tax invoice with auto calculation</li>
          <li>Wholesale and retail invoice creator</li>
          <li>Multi-currency invoice maker (USD, EUR, GBP, INR)</li>
          <li>Digital signature billing app</li>
          <li>Factura electrónica gratis online</li>
          <li>Invoice Generator . ME - the best free tool</li>
          <li>invoice-generator.me official site</li>
          <li>Crear factura en línea pdf</li>
          <li>Generador de facturas para autónomos</li>
          <li>Facture gratuite en ligne sans inscription</li>
          <li>Créer une facture pdf facilement</li>
          <li>Kostenlose rechnung erstellen online</li>
          <li>Rechnungsschreibung software kostenlos</li>
          <li>Crea fattura online gratis</li>
          <li>Fatturazione elettronica semplice</li>
          <li>Gerador de recibos e faturas online</li>
          <li>Estimate generator for contractors and agencies</li>
          <li>Construction invoice maker with company logo</li>
          <li>Medical receipt maker for clinics and doctors</li>
          <li>Legal service invoice for independent law firms</li>
          <li>IT services and web design estimate generator</li>
          <li>Handyman and plumbing service receipt maker</li>
          <li>Photography bill maker with digital signature</li>
          <li>Transport bill pdf generator for logistics</li>
          <li>Free quotation maker online in 30 seconds</li>
          <li>Best billing software for self-employed professionals</li>
          <li>Proforma invoice creator and estimator tool</li>
          <li>Automated tax calculation invoice app</li>
          <li>Global invoice templates 2026 download</li>
          <li>Generate professional invoices immediately</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-50 w-full pt-20 pb-10 border-t border-outline-variant/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 px-8 w-full max-w-7xl mx-auto">
          <div className="col-span-1">
            <div className="text-xl font-black tracking-tighter text-zinc-900 font-headline mb-4">Invoice Generator</div>
            <p className="text-sm font-body text-zinc-500 leading-relaxed">{t("The architectural standard for modern invoicing.")} {t("Built for global businesses that demand precision and style.")}</p>
          </div>
          <div>
            <h4 className="font-headline font-semibold text-zinc-900 mb-6">{t("Tools")}</h4>
            <ul className="space-y-4">
              <li><Link to="/tools/invoice" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Free Invoice Generator")}</Link></li>
              <li><Link to="/tools/receipt" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("PDF Receipt Maker")}</Link></li>
              <li><Link to="/tools/quotation" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Online Quotation Maker")}</Link></li>
              <li><Link to="/tools/estimate" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Free Estimate Generator")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold text-zinc-900 mb-6">{t("Popular Generators")}</h4>
            <ul className="space-y-4">
              <li><Link to="/free-invoice-generator" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Invoice Generator Free")}</Link></li>
              <li><Link to="/gst-invoice-india" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("GST Invoice India")}</Link></li>
              <li><Link to="/tools/tax" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Income Tax Calculator")}</Link></li>
              <li><Link to="/tools/gst" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("GST Calculator Online")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-headline font-semibold text-zinc-900 mb-6">{t("Legal & Resources")}</h4>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Privacy Policy")}</Link></li>
              <li><Link to="/terms" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("Terms of Service")}</Link></li>
              <li><Link to="/about" className="text-zinc-500 hover:text-zinc-900 text-sm transition-all hover:translate-x-1 inline-block underline decoration-zinc-300 underline-offset-4">{t("About Invoice Generator")}</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 pt-16 border-t border-zinc-200 mt-16 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-sm font-body text-zinc-400">© 2026 Invoice Generator. {t("All rights reserved.")}</p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <ShieldCheck size={14} className="text-zinc-900" />
              <span>100% {t("Secure & Data Private")}</span>
            </div>
          </div>
          <div className="flex gap-6 text-zinc-400">
            <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-black uppercase tracking-tighter">SSL Encrypted</span>
            </div>
            <Globe size={18} />
            <CreditCard size={18} />
          </div>
        </div>
      </footer>
      {/* Invisible Google Translate element for programmatic control */}
      <GoogleTranslate />
    </div>
  );
}
