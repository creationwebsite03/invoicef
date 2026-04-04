import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, onSnapshot, orderBy, deleteDoc, doc } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/error-handler";
import { Invoice } from "../types/invoice";
import {
  Edit,
  Trash2,
  Download,
  Printer,
  FileText,
  Plus,
  Search,
  ArrowUpDown,
  MoreVertical,
  Layers,
  ChevronRight,
  ExternalLink,
  Calendar,
  DollarSign,
  Briefcase,
  FileCheck,
  Filter
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import ConfirmModal from "../components/ConfirmModal";
import Skeleton from "../components/Skeleton";
import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";

type SortConfig = {
  key: keyof Invoice | 'clientName';
  direction: 'asc' | 'desc';
};

export default function MyInvoices() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'issueDate', direction: 'desc' });

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

  const deleteInvoice = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/invoices`, id));
      toast.success(t("Document purged successfully"));
      setDeleteId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/invoices/${id}`);
    }
  };

  const handleSort = (key: SortConfig['key']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let result = invoices.filter(inv => {
      const matchesSearch = inv.clientDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || inv.type === activeTab;
      return matchesSearch && matchesTab;
    });

    result.sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof Invoice];
      let bVal: any = b[sortConfig.key as keyof Invoice];

      if (sortConfig.key === 'clientName') {
        aVal = a.clientDetails.name;
        bVal = b.clientDetails.name;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [invoices, searchQuery, activeTab, sortConfig]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const totalValue = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const uniqueClients = new Set(invoices.map(inv => inv.clientDetails.name)).size;
    return {
      totalDocuments: invoices.length,
      totalValue: totalValue,
      clientCount: uniqueClients
    };
  }, [invoices]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh] bg-zinc-50">
      <div className="w-10 h-10 border-t-2 border-zinc-900 rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const tabs = [
    { id: 'all', label: 'All Documents', icon: Layers },
    { id: 'invoice', label: 'Invoices', icon: Briefcase },
    { id: 'receipt', label: 'Receipts', icon: FileCheck },
    { id: 'quotation', label: 'Estimates', icon: FileText },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-10 py-10 antialiased bg-zinc-50/30 min-h-screen">
      <SEO 
        title={t("My Invoices")}
        description="Access and manage your professional billing history with INVOXA. Track your revenue, edit documents, and manage client relations in one place."
        keywords="invoice history, my billing, manage invoices, professional billing management, INVOXA account"
      />

        {/* Elite Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3 bg-zinc-900 text-white px-3 py-1 rounded-full w-fit">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">{t("Operational Hub")}</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black tracking-tighter text-zinc-900 uppercase leading-none italic break-words [hyphens:auto]">
              {t("Document")}<br />
              <span className="text-zinc-400">{t("Archive")}</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-500/5 flex flex-col justify-center min-w-[180px] sm:min-w-[220px]">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 break-words">{t("Capital Reserve")}</span>
              <p className="text-2xl font-black text-zinc-900 tracking-tighter truncate">
                {stats.totalValue.toLocaleString(undefined, { style: 'currency', currency: invoices[0]?.currency || 'USD' })}
              </p>
            </div>
            <Link
              to="/tools/invoice"
              className="bg-zinc-900 text-white px-8 py-4 rounded-[2.5rem] font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-2xl active:scale-95"
            >
              <Plus size={20} /> {t("New Entry")}
            </Link>
          </div>
        </div>

        {/* Intelligence Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-center">
           <div className="lg:col-span-8 flex p-1.5 bg-white border border-zinc-100 rounded-[2rem] shadow-sm overflow-x-auto no-scrollbar scroll-smooth">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 min-w-fit flex items-center justify-center gap-2 md:gap-4 px-4 md:px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-zinc-900 text-white shadow-xl translate-y-[-1px]" 
                      : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600"
                  )}
                >
                  <tab.icon size={14} strokeWidth={2.5} className="shrink-0" />
                  <span>{t(tab.label)}</span>
                </button>
              ))}
           </div>
           
           <div className="lg:col-span-4 relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-hover:text-zinc-900 transition-colors" size={22} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("Filter archive...")}
                className="w-full bg-white border border-zinc-100 rounded-[2.5rem] py-5 pl-20 pr-10 text-sm font-bold text-zinc-900 shadow-xl shadow-zinc-500/5 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all placeholder:text-zinc-300"
              />
           </div>
        </div>

        {/* Visual Matrix Container */}
        <div className="min-h-[600px] relative">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-[3rem]" />)}
            </div>
          ) : filteredAndSortedInvoices.length === 0 ? (
            <div className="bg-white rounded-[4rem] border border-zinc-100 shadow-2xl p-32 text-center flex flex-col items-center">
              <div className="w-32 h-32 bg-zinc-50 rounded-[3rem] flex items-center justify-center text-zinc-200 border border-zinc-100 mb-8 animate-in fade-in zoom-in duration-700">
                <Filter size={50} />
              </div>
              <h3 className="text-3xl font-black text-zinc-900 uppercase mb-4 tracking-tighter">{t("Zero Data Nodes Found")}</h3>
              <p className="text-sm font-medium text-zinc-400 max-w-sm mx-auto leading-relaxed">
                No operational records match your selected criteria. Try resetting filters or initializing your first document stream.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="group relative bg-white rounded-[3rem] border border-zinc-100 p-8 shadow-xl shadow-zinc-500/5 hover:shadow-2xl hover:shadow-zinc-500/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Subtle Accent Glow */}
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 blur-3xl opacity-[0.03] transition-opacity group-hover:opacity-[0.1]",
                    inv.type === 'invoice' ? "bg-zinc-900" :
                      inv.type === 'receipt' ? "bg-emerald-500" : "bg-indigo-500"
                  )} />

                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex flex-col min-w-0 pr-4">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest break-words">{t(inv.type || 'Doc')} Node</span>
                      <p className="text-xl font-black text-zinc-900 tracking-tighter">#{inv.id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 bg-zinc-900 text-white shrink-0 whitespace-nowrap">
                      {t(inv.type || 'Doc')}
                    </div>
                  </div>

                  <div className="space-y-6 mb-10 relative z-10">
                    <div>
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">{t("Target Entity")}</span>
                      <p className="text-base font-black text-zinc-900">{inv.clientDetails.name}</p>
                    </div>
                    <div className="flex justify-between items-end border-t border-zinc-50 pt-6">
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">{t("Temporal Code")}</span>
                        <p className="text-xs font-bold text-zinc-600 italic">{inv.issueDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest mb-1 block">{t("Payload Value")}</span>
                        <p className="text-lg font-medium text-zinc-900 font-headline">
                          {inv.currency} {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 relative z-10">
                    <button
                      onClick={() => navigate(`/tools/${inv.type || 'invoice'}/${inv.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-zinc-900/10"
                    >
                      <Edit size={14} strokeWidth={2.5} /> {t("Modify")}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/tools/${inv.type || 'invoice'}/${inv.id}?download=true`)}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-100 rounded-2xl hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all shadow-sm active:scale-95"
                        title={t("Stream Down")}
                      >
                        <Download size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => setDeleteId(inv.id!)}
                        className="w-12 h-12 flex items-center justify-center bg-white border border-rose-100 rounded-2xl text-rose-300 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-95"
                        title={t("Purge Entry")}
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Global Hub Status */}
        {!isLoading && filteredAndSortedInvoices.length > 0 && (
          <div className="mt-16 flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-500/5 gap-8">
            <div className="flex flex-wrap justify-center gap-10">
              <div className="flex flex-col items-center md:items-start gap-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t("Operational Mode")}</span>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <span className="text-xs font-black text-zinc-900">{t("Secure Cloud Sync Enabled")}</span>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-start gap-1">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{t("Archive Density")}</span>
                <p className="text-xs font-black text-zinc-900">{stats.totalDocuments} {t("Active Nodes")}</p>
              </div>
              <div className="flex flex-col items-center md:items-start gap-1 text-right">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right">{t("Last Temporal Sync")}</span>
                <p className="text-xs font-black text-zinc-900">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-zinc-50 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500">
              {t("Protocol Version")}: v2.0
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={!!deleteId}
          title={t("Critical Action Requested")}
          message={t("Confirm total elimination of this operational document. This will permanently detach the node from your commercial network.")}
          confirmLabel={t("Purge Document")}
          cancelLabel={t("Abort Request")}
          onConfirm={() => deleteId && deleteInvoice(deleteId)}
          onCancel={() => setDeleteId(null)}
          variant="danger"
        />
    </div>
  );
}
