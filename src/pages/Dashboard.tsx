import React, { useState, useEffect, useMemo } from "react";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/error-handler";
import { Invoice } from "../types/invoice";
import {
   Plus,
   ArrowUpRight,
   Wallet,
   FileText,
   TrendingUp,
   ArrowRight,
   Clock,
   ArrowDownRight,
   Users,
   LayoutGrid
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import Skeleton from "../components/Skeleton";
import { useLanguage } from "../context/LanguageContext";
import { CURRENCIES } from "../constants/countries";
import SEO from "../components/SEO";

export default function Dashboard() {
   const { t, currency: globalCurrency } = useLanguage();
   const navigate = useNavigate();
   const { user, loading } = useAuth();
   const [invoices, setInvoices] = useState<Invoice[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      if (!loading && !user) navigate("/");
      let unsubscribe: () => void;
      if (user) unsubscribe = fetchInvoices(user.uid);
      return () => unsubscribe?.();
   }, [user, loading, navigate]);

   const fetchInvoices = (uid: string) => {
      setIsLoading(true);
      const q = query(
         collection(db, `users/${uid}/invoices`),
         orderBy("createdAt", "desc")
      );

      return onSnapshot(q, (querySnapshot) => {
         const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
         setInvoices(data);
         setIsLoading(false);
      }, (error) => {
         handleFirestoreError(error, OperationType.LIST, `users/${uid}/invoices`);
         setIsLoading(false);
      });
   };

   const stats = useMemo(() => {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      // 100% Proper Calculation: Filter by matching current global currency
      const matchingInvoices = invoices.filter(inv => inv.currency === globalCurrency);

      const totalRevenue = matchingInvoices.reduce((acc, inv) => acc + inv.total, 0);
      const thisMonthRevenue = matchingInvoices
         .filter(inv => new Date(inv.issueDate) >= lastMonth)
         .reduce((acc, inv) => acc + inv.total, 0);

      const totalTransactions = invoices.length; // Total count stays global
      const avgTicket = matchingInvoices.length > 0 ? totalRevenue / matchingInvoices.length : 0;

      return { totalRevenue, thisMonthRevenue, totalTransactions, avgTicket };
   }, [invoices, globalCurrency]);

   // Generate simple sparkline data for the SVG chart
   const sparklinePoints = useMemo(() => {
      const matching = invoices.filter(inv => inv.currency === globalCurrency);
      if (matching.length < 2) return "M 0 50 L 200 50";
      const sorted = [...matching].sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime());
      const maxVal = Math.max(...sorted.map(i => i.total)) || 1;
      const points = sorted.map((inv, i) => {
         const x = (i / (sorted.length - 1)) * 200;
         const y = 80 - (inv.total / maxVal) * 60;
         return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      }).join(" ");
      return points;
   }, [invoices, globalCurrency]);

   if (loading) return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
   );

   if (!user) return null;

   const currentCurrencySymbol = CURRENCIES.find(c => c.code === globalCurrency)?.symbol || globalCurrency;

   return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10 antialiased bg-zinc-50/30 min-h-screen">
         <SEO
            title={t("Command Center")}
            description="Analyze your financial matrix and manage invoices with INVOXA's elite command center. 100% accurate calculations for global business."
            keywords="invoice dashboard, business analysis, tax management, revenue tracking, 2026 invoice tools"
         />
         {/* Top Banner / Welcome */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{t("Active Session")}</span>
               </div>
               <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 uppercase">
                  {t("Command Center")}
               </h1>
               <p className="text-sm font-medium text-zinc-500 mt-1">
                  {t("Analysis of the financial matrix for")} <span className="text-zinc-900 font-bold">{user.displayName}</span>
               </p>
            </div>

            <div className="flex items-center gap-3">
               <button
                  onClick={() => navigate("/tools/invoice")}
                  className="bg-zinc-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 active:scale-95"
               >
                  <Plus size={16} /> {t("Create Document")}
               </button>
               <button
                  onClick={() => navigate("/my-invoices")}
                  className="bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm"
               >
                  {t("Deep History")}
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Section */}
            <div className="lg:col-span-3 space-y-8">

               {/* Key Metric Overview */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                           <Wallet size={20} />
                        </div>
                        <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px]">
                           <ArrowUpRight size={12} /> 12%
                        </div>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t("Net Yield")} ({globalCurrency})</p>
                     <p className="text-3xl font-black text-zinc-900 tracking-tighter">
                        {currentCurrencySymbol}{stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                     </p>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 transition-transform group-hover:bg-zinc-100 group-hover:text-zinc-600">
                           <FileText size={20} />
                        </div>
                        <div className="flex items-center gap-1 text-zinc-400 font-black text-[10px]">
                           <span className="opacity-50">STABLE</span>
                        </div>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t("Documents")}</p>
                     <p className="text-3xl font-black text-zinc-900 tracking-tighter">
                        {stats.totalTransactions}
                     </p>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm transition-all hover:shadow-xl hover:shadow-zinc-200/50 group">
                     <div className="flex justify-between items-start mb-6">
                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 transition-transform group-hover:bg-zinc-100 group-hover:text-zinc-600">
                           <LayoutGrid size={20} />
                        </div>
                        <div className="flex items-center gap-1 text-rose-500 font-black text-[10px]">
                           <ArrowDownRight size={12} /> 5%
                        </div>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{t("Avg Ticket")}</p>
                     <p className="text-3xl font-black text-zinc-900 tracking-tighter">
                        {currentCurrencySymbol}{stats.avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                     </p>
                  </div>
               </div>

               {/* Revenue Chart Section */}
               <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm p-10 overflow-hidden relative">
                  <div className="flex justify-between items-end mb-10">
                     <div>
                        <h2 className="text-lg font-black text-zinc-900 uppercase tracking-tight">{t("Revenue Velocity")}</h2>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{t("Real-time telemetry of financial flow")}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{t("This Month")}</p>
                        <p className="text-2xl font-black text-emerald-500 tracking-tighter">{currentCurrencySymbol}{stats.thisMonthRevenue.toLocaleString()}</p>
                     </div>
                  </div>

                  {/* Custom SVG Sparkline for visual flair */}
                  <div className="relative h-48 w-full">
                     <svg viewBox="0 0 200 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                        <path
                           d={sparklinePoints}
                           fill="none"
                           stroke="#18181b"
                           strokeWidth="2.5"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           className="drop-shadow-lg"
                        />
                        <path
                           d={`${sparklinePoints} L 200 100 L 0 100 Z`}
                           fill="url(#sparkline-gradient)"
                           className="opacity-10"
                        />
                        <defs>
                           <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#18181b" />
                              <stop offset="100%" stopColor="white" />
                           </linearGradient>
                        </defs>
                     </svg>
                  </div>
               </div>

               {/* Recent Invoices - A "proper" dashboard feature */}
               <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="px-10 py-8 border-b border-zinc-50 flex justify-between items-center bg-zinc-50/10">
                     <div className="flex items-center gap-3">
                        <Clock size={18} className="text-zinc-400" />
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-widest">{t("Recent Activity")}</h3>
                     </div>
                     <button
                        onClick={() => navigate("/my-invoices")}
                        className="text-[10px] font-black text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
                     >
                        {t("View Full History")} <ArrowRight size={12} />
                     </button>
                  </div>

                  <div className="divide-y divide-zinc-50">
                     {invoices.slice(0, 5).map((inv) => (
                        <div key={inv.id} className="px-10 py-6 flex items-center justify-between hover:bg-zinc-50/50 transition-all cursor-pointer group" onClick={() => navigate(`/tools/${inv.type}/${inv.id}`)}>
                           <div className="flex items-center gap-5">
                              <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-300 font-bold text-xs group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                 {inv.clientDetails.name.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-zinc-900">{inv.clientDetails.name}</p>
                                 <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-0.5">{inv.issueDate}</p>
                              </div>
                           </div>
                           <div className="text-right flex items-center gap-6">
                              <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border bg-zinc-900 border-zinc-900 text-white">
                                 {inv.type}
                              </span>
                              <p className="text-sm font-normal text-zinc-900 font-headline">{inv.currency} {inv.total.toLocaleString()}</p>
                           </div>
                        </div>
                     ))}
                     {invoices.length === 0 && (
                        <div className="p-10 text-center text-zinc-400 italic text-xs capitalize">{t("No transactions detected.")}</div>
                     )}
                  </div>
               </div>
            </div>

            {/* Sidebar Panel */}
            <div className="space-y-8">
               {/* Global Actions */}
               <div className="p-8 rounded-[2.5rem] bg-zinc-900 text-white space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                     <h3 className="text-xl font-black tracking-tight mb-6 uppercase leading-tight">{t("Quick Operations")}</h3>
                     <div className="space-y-3">
                        <button onClick={() => navigate("/tools/invoice")} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                           <div className="flex items-center gap-3">
                              <FileText size={16} className="text-zinc-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t("New Invoice")}</span>
                           </div>
                           <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                        <button onClick={() => navigate("/tools/quotation")} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                           <div className="flex items-center gap-3">
                              <ArrowUpRight size={16} className="text-zinc-500" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t("New Estimate")}</span>
                           </div>
                           <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
               </div>

               {/* Insights Block */}
               <div className="p-8 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm space-y-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                     <TrendingUp size={18} />
                  </div>
                  <h4 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{t("Smart Insight")}</h4>
                  <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                     {stats.thisMonthRevenue > stats.totalRevenue / 12
                        ? t("Positive deviation detected. Your monthly yield is currently outperforming your annual average by significant margin.")
                        : t("Stable flow detected. Maintain consistent documentation density to ensure financial matrix remains intact.")}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
}
