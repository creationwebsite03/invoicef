import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  Receipt, 
  FileSignature, 
  Calculator, 
  Percent, 
  Landmark,
  Tag,
  Globe,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Zap
} from "lucide-react";

export default function Tools() {
  const { t } = useTranslation();

  return (
    <div className="pb-12 md:pb-24 pt-8 md:pt-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10 md:mb-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black font-headline tracking-tighter mb-4 md:mb-6 leading-[0.9] text-zinc-900 text-balance">
              {t("Financial Arsenal")} <br className="hidden md:block" />{t("for Modern Teams.")}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-zinc-500 max-w-xl font-body leading-relaxed">
              {t("A curated directory of high-precision tools designed to streamline your billing, tax calculations, and global commerce operations. No bloat. Just performance.")}
            </p>
          </div>
        </div>
      </section>

      {/* Tools Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          
          {/* Tool Card: Invoice Generator */}
          <div className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-row sm:flex-col gap-4 sm:gap-0 items-center sm:items-start sm:justify-between sm:min-h-[280px] md:min-h-[320px]">
            <div className="shrink-0 sm:w-full">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-100 rounded-xl flex items-center justify-center sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform text-zinc-900">
                <FileText size={22} />
              </div>
              <h3 className="hidden sm:block text-xl md:text-2xl font-bold font-headline mb-2 md:mb-3 text-zinc-900">{t("Invoice Generator")}</h3>
              <p className="hidden sm:block text-xs sm:text-sm text-zinc-500 leading-snug">{t("Professional billing for freelancers and global enterprises.")}</p>
            </div>
            <div className="flex-1 sm:hidden">
              <h3 className="text-base font-bold font-headline mb-1 text-zinc-900">{t("Invoice Generator")}</h3>
              <Link to="/tools/invoice" className="flex items-center text-xs font-bold tracking-tight text-zinc-500">{t("Launch")} <ArrowRight size={14} className="ml-1" /></Link>
            </div>
            <Link to="/tools/invoice" className="hidden sm:flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-4 md:mt-6">
              {t("Launch Tool")} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: Receipt Generator */}
          <div className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-row sm:flex-col gap-4 sm:gap-0 items-center sm:items-start sm:justify-between sm:min-h-[280px] md:min-h-[320px]">
            <div className="shrink-0 sm:w-full">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-100 rounded-xl flex items-center justify-center sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform text-zinc-900">
                <Receipt size={22} />
              </div>
              <h3 className="hidden sm:block text-xl md:text-2xl font-bold font-headline mb-2 md:mb-3 text-zinc-900">{t("Receipt Generator")}</h3>
              <p className="hidden sm:block text-xs sm:text-sm text-zinc-500 leading-snug">{t("Instant digital receipts with custom branding and tax items.")}</p>
            </div>
            <div className="flex-1 sm:hidden">
              <h3 className="text-base font-bold font-headline mb-1 text-zinc-900">{t("Receipt Generator")}</h3>
              <Link to="/tools/receipt" className="flex items-center text-xs font-bold tracking-tight text-zinc-500">{t("Launch")} <ArrowRight size={14} className="ml-1" /></Link>
            </div>
            <Link to="/tools/receipt" className="hidden sm:flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-4 md:mt-6">
              {t("Launch Tool")} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: Quotation Generator */}
          <div className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-row sm:flex-col gap-4 sm:gap-0 items-center sm:items-start sm:justify-between sm:min-h-[280px] md:min-h-[320px]">
            <div className="shrink-0 sm:w-full">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-100 rounded-xl flex items-center justify-center sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform text-zinc-900">
                <FileSignature size={22} />
              </div>
              <h3 className="hidden sm:block text-xl md:text-2xl font-bold font-headline mb-2 md:mb-3 text-zinc-900">{t("Quotation Generator")}</h3>
              <p className="hidden sm:block text-xs sm:text-sm text-zinc-500 leading-snug">{t("Send professional quotes that win more high-ticket projects.")}</p>
            </div>
            <div className="flex-1 sm:hidden">
              <h3 className="text-base font-bold font-headline mb-1 text-zinc-900">{t("Quotation Generator")}</h3>
              <Link to="/tools/quotation" className="flex items-center text-xs font-bold tracking-tight text-zinc-500">{t("Launch")} <ArrowRight size={14} className="ml-1" /></Link>
            </div>
            <Link to="/tools/quotation" className="hidden sm:flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-4 md:mt-6">
              {t("Launch Tool")} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: Estimate Generator */}
          <div className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-row sm:flex-col gap-4 sm:gap-0 items-center sm:items-start sm:justify-between sm:min-h-[280px] md:min-h-[320px]">
            <div className="shrink-0 sm:w-full">
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-zinc-100 rounded-xl flex items-center justify-center sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform text-zinc-900">
                <Calculator size={22} />
              </div>
              <h3 className="hidden sm:block text-xl md:text-2xl font-bold font-headline mb-2 md:mb-3 text-zinc-900">{t("Estimate Generator")}</h3>
              <p className="hidden sm:block text-xs sm:text-sm text-zinc-500 leading-snug">{t("Quickly draft project estimates with itemized task breakdowns.")}</p>
            </div>
            <div className="flex-1 sm:hidden">
              <h3 className="text-base font-bold font-headline mb-1 text-zinc-900">{t("Estimate Generator")}</h3>
              <Link to="/tools/estimate" className="flex items-center text-xs font-bold tracking-tight text-zinc-500">{t("Launch")} <ArrowRight size={14} className="ml-1" /></Link>
            </div>
            <Link to="/tools/estimate" className="hidden sm:flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-4 md:mt-6">
              {t("Launch Tool")} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: GST Calculator */}
          <div className="group bg-zinc-50 p-5 sm:p-6 md:p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between sm:min-h-[280px] md:min-h-[320px] sm:col-span-2 lg:col-span-2">
            <div className="flex flex-row sm:flex-row gap-4 sm:gap-6 md:gap-8 items-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-zinc-900">
                <Percent size={28} />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-bold font-headline mb-1 sm:mb-3 text-zinc-900">{t("GST Calculator")}</h3>
                <p className="text-xs sm:text-sm md:text-base text-zinc-500 max-w-sm hidden sm:block">{t("Simplify your tax compliance with our regional GST calculator. Supports inclusive and exclusive tax values for rapid accounting.")}</p>
              </div>
            </div>
            <Link to="/tools/gst" className="flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-4 md:mt-6">
              {t("Open GST Engine")} <ArrowUpRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: Tax Calculator */}
          <div className="group bg-white p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="w-14 h-14 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-zinc-900">
                <Landmark size={28} />
              </div>
              <h3 className="text-2xl font-bold font-headline mb-3 text-zinc-900">{t("Tax Calculator")}</h3>
              <p className="text-sm text-zinc-500 leading-snug">{t("Accurate income tax projections based on current fiscal brackets.")}</p>
            </div>
            <Link to="/tools/tax" className="flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-6">
              {t("Launch Tool")} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: Discount Calculator */}
          <div className="group bg-white p-8 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col justify-between min-h-[320px]">
            <div>
              <div className="w-14 h-14 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-zinc-900">
                <Tag size={28} />
              </div>
              <h3 className="text-2xl font-bold font-headline mb-3 text-zinc-900">{t("Discount Calc")}</h3>
              <p className="text-sm text-zinc-500 leading-snug">{t("Quickly calculate markdowns and bulk pricing incentives.")}</p>
            </div>
            <Link to="/tools/discount" className="flex items-center text-sm font-bold tracking-tight text-zinc-900 hover:translate-x-1 transition-transform mt-6">
              {t("Launch Tool")} <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>

          {/* Tool Card: Currency Converter (Highlight) */}
          <div className="group bg-zinc-900 text-white p-6 sm:p-8 md:p-10 rounded-2xl transition-all duration-300 flex flex-col justify-between min-h-[240px] sm:min-h-[320px] col-span-1 sm:col-span-2 lg:col-span-4 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-8 h-full">
              <div className="max-w-xl">
                <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 md:mb-6">
                  {t("Real-Time Updates")}
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-headline mb-3 md:mb-4 tracking-tighter text-balance">
                  {t("Global Currency Engine")}
                </h3>
                <p className="text-sm sm:text-base md:text-lg opacity-80 font-body max-w-sm md:max-w-xl">
                  {t("Convert 160+ currencies with institutional-grade exchange rates. Built for cross-border commerce and digital nomads.")}
                </p>
              </div>
              <div className="flex items-center justify-start md:justify-end mt-2 md:mt-0 shrink-0">
                <Link to="/tools/currency" className="w-full sm:w-auto text-center bg-white text-zinc-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-xl">
                  {t("Start Converting")} <Globe size={18} />
                </Link>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -right-10 -bottom-10 opacity-10 text-white pointer-events-none">
              <Globe size={300} strokeWidth={1} />
            </div>
          </div>

        </div>
      </section>

      {/* Live Ledger Feature (Asymmetric Layout) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-32 lg:mt-40">
        <div className="grid grid-cols-12 items-center gap-8 md:gap-12 lg:gap-16">
          <div className="col-span-12 lg:col-span-5">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-black mb-4 md:mb-6 text-zinc-900 tracking-tighter leading-tight">
              {t("The Live Ledger Advantage.")}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-zinc-500 mb-6 md:mb-10 leading-relaxed">
              {t("Every tool in our directory integrates seamlessly with our flagship Live Ledger technology, allowing you to preview complex financial documents in real-time as you type.")}
            </p>
            
            <ul className="space-y-8">
              <li className="flex items-start gap-5">
                <div className="bg-zinc-100 p-2 rounded-lg text-zinc-900 mt-1 shrink-0">
                  <BadgeCheck size={24} />
                </div>
                <div>
                  <span className="block font-bold text-lg text-zinc-900 mb-1">{t("Bank-Grade Precision")}</span>
                  <span className="text-zinc-500 leading-relaxed">{t("Calculation engines audited for global tax compliance.")}</span>
                </div>
              </li>
              <li className="flex items-start gap-5">
                <div className="bg-zinc-100 p-2 rounded-lg text-zinc-900 mt-1 shrink-0">
                  <Zap size={24} />
                </div>
                <div>
                  <span className="block font-bold text-lg text-zinc-900 mb-1">{t("Zero-Latency Input")}</span>
                  <span className="text-zinc-500 leading-relaxed">{t("Experience instantaneous updates with no page reloads.")}</span>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="col-span-12 lg:col-span-7 bg-zinc-100 rounded-3xl p-1 pb-0 overflow-hidden shadow-2xl border border-zinc-200/50 mt-8 lg:mt-0">
            <div className="bg-white rounded-t-[23px] p-6 sm:p-8 md:p-12 border-b border-zinc-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between gap-6 mb-12">
                <div className="space-y-3">
                  <div className="w-24 sm:w-32 h-8 bg-zinc-100 rounded-lg"></div>
                  <div className="w-40 sm:w-48 h-4 bg-zinc-200 rounded-md"></div>
                </div>
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-zinc-100 rounded-2xl shrink-0"></div>
              </div>
              <div className="space-y-6 mb-12">
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-4 bg-zinc-100 rounded-md col-span-2"></div>
                  <div className="h-4 bg-zinc-100 rounded-md"></div>
                  <div className="h-4 bg-zinc-100 rounded-md"></div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  <div className="h-4 bg-zinc-100 rounded-md col-span-1 sm:col-span-2"></div>
                  <div className="h-4 bg-zinc-100 rounded-md"></div>
                  <div className="h-4 bg-zinc-100 rounded-md"></div>
                </div>
              </div>
              <div className="flex justify-end pt-8 border-t border-zinc-100">
                <div className="w-32 sm:w-40 h-10 sm:h-12 bg-zinc-900 rounded-xl inline-block"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
