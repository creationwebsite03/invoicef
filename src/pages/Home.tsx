import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { motion } from "motion/react";
import SEO from "../components/SEO";
import {
  FileText,
  Receipt,
  FileSearch,
  Calculator,
  Percent,
  DollarSign,
  Globe,
  Tag,
  Zap,
  Download,
  ShieldCheck,
  ArrowRight
} from "lucide-react";

const TOOLS = [
  { icon: FileText, title: "Invoice Generator", desc: "Create, customize and send professional invoices in minutes.", link: "/tools/invoice" },
  { icon: Receipt, title: "Receipt Generator", desc: "Generate professional receipts for payments received instantly.", link: "/tools/receipt" },
  { icon: FileSearch, title: "Quotation Generator", desc: "Prepare accurate quotes and proposals for your prospective clients.", link: "/tools/quotation" },
  { icon: Calculator, title: "Estimate Generator", desc: "Give your clients a rough idea of costs with our simple tool.", link: "/tools/estimate" },
  { icon: Percent, title: "GST Calculator", desc: "Calculate goods and services tax for different regions automatically.", link: "/tools/gst" },
  { icon: DollarSign, title: "Tax Calculator", desc: "Estimate your income tax liabilities with our comprehensive tool.", link: "/tools/tax" },
  { icon: Tag, title: "Discount Calculator", desc: "Quickly calculate discounts and final prices for your sales.", link: "/tools/discount" },
  { icon: Globe, title: "Currency Converter", desc: "Convert between all global currencies with real-time rates.", link: "/tools/currency" },
];

export default function Home() {
  const { t } = useLanguage();
  
  return (
    <div className="overflow-hidden">
      <SEO 
        title="Invoice Generator | #1 Free Professional Online Billing Tool"
        description="Create professional PDF invoices in 30 seconds with Invoice Generator. The world's most trusted free invoice maker for freelancers and small businesses. No registration required."
        keywords="invoice generator, free invoice maker, online invoice generator, create invoice online, billing software, gst invoice generator, best invoice maker 2026"
      />
      {/* Hero Section */}
      <header className="pt-12 md:pt-20 pb-12 md:pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-headline font-extrabold tracking-tighter leading-[0.95] text-zinc-900 mb-5 md:mb-8 text-balance">
              {t("Free Online")} <span className="block mt-1 md:mt-2">{t("Invoice Generator")}</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-zinc-500 max-w-xl mb-8 md:mb-12 leading-relaxed font-medium">
              {t("Free invoice generator used by freelancers and businesses worldwide.")}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 md:gap-6">
              <Link
                to="/tools/invoice"
                className="w-full sm:w-auto text-center px-6 sm:px-8 md:px-10 py-4 md:py-5 bg-zinc-900 text-white rounded-full font-black text-base sm:text-lg md:text-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10"
              >
                {t("Create Invoice")}
              </Link>
              <Link
                to="/tools"
                className="w-full sm:w-auto text-center px-6 sm:px-8 md:px-10 py-4 md:py-5 bg-white border-2 border-zinc-100 text-on-surface rounded-full font-black text-base sm:text-lg md:text-xl hover:bg-zinc-50 transition-all shadow-lg shadow-zinc-200/50"
              >
                {t("Explore Tools")}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block lg:col-span-5 relative"
          >
            <div className="relative z-10 bg-white rounded-xl shadow-2xl p-10 border border-outline-variant/10 aspect-[3/4] flex flex-col gap-6 transform lg:translate-x-12 hover:scale-[1.02] transition-transform duration-500">
              <div className="flex justify-between items-start">
                <div className="h-12 w-32 bg-surface-container-low rounded-lg"></div>
                <div className="text-right">
                  <div className="h-4 w-24 bg-surface-container-low rounded ml-auto mb-2"></div>
                  <div className="h-6 w-32 bg-surface-container rounded ml-auto"></div>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="h-4 w-1/2 bg-surface-container-low rounded"></div>
                <div className="h-4 w-1/3 bg-surface-container-low rounded"></div>
              </div>
              <div className="mt-8 flex flex-col gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 py-3 border-b border-surface-container">
                    <div className="col-span-2 h-4 bg-surface-container-high rounded"></div>
                    <div className="h-4 bg-surface-container-high rounded"></div>
                    <div className="h-4 bg-surface-container-high rounded"></div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t-4 border-primary">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Total Due</div>
                  <div className="text-3xl font-bold text-primary">$0,000.00</div>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-surface-container-high rounded-full blur-3xl opacity-50 -z-10"></div>
          </motion.div>
        </div>
      </header>

      {/* Trust Section */}
      <section className="py-12 md:py-24 bg-surface-container-low border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-12">
            {[
              { label: t("Invoices Generated"), value: "100,000+" },
              { label: t("Global Currencies"), value: "160+" },
              { label: t("100% Free Forever"), value: "Free" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col items-center text-center hover:shadow-xl hover:shadow-zinc-500/5 transition-all duration-300"
              >
                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 mb-2 md:mb-3 tracking-tighter">{stat.value}</span>
                <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="mb-10 md:mb-20 text-center md:text-left">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-headline font-bold text-zinc-900 mb-3 md:mb-6 tracking-tighter">{t("Popular Billing Tools")}</h2>
          <p className="text-sm sm:text-base md:text-lg text-zinc-500 max-w-2xl leading-relaxed">{t("Access our curated directory of high-precision tools designed to streamline your billing and taxes.")}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {TOOLS.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group bg-white p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-200 hover:border-zinc-300 transition-all duration-300 flex flex-row sm:flex-col gap-4 sm:gap-0 hover:shadow-xl hover:shadow-zinc-500/5"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 bg-zinc-50 flex items-center justify-center rounded-xl sm:rounded-2xl sm:mb-6 md:mb-8 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                <tool.icon size={24} />
              </div>
              <div className="flex flex-col flex-1 sm:flex-none min-w-0">
                <h3 className="text-lg sm:text-lg md:text-xl font-bold mb-2 md:mb-3 font-headline text-zinc-900 leading-[1.1] break-words [hyphens:auto]">{t(tool.title)}</h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 mb-6 md:mb-8 flex-grow leading-relaxed min-h-[3em] line-clamp-3 sm:line-clamp-none break-words">{t(tool.desc)}</p>
                <Link to={tool.link} className="flex items-center gap-2 font-bold text-zinc-900 group-hover:gap-4 transition-all text-[11px] mt-auto uppercase tracking-widest">
                  {t("Open Tool")} <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-24 bg-white border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
            {[
              { icon: Zap, title: t("Fast invoice creation"), desc: t("Our streamlined interface allows you to finish your first invoice in under a minute.") },
              { icon: Download, title: t("Download PDF instantly"), desc: t("Get a perfectly formatted, high-resolution PDF ready to send to your clients.") },
              { icon: Globe, title: t("Global currency support"), desc: t("Bill your clients in USD, EUR, GBP, JPY, and over 150 other global currencies.") },
              { icon: ShieldCheck, title: t("Multi language support"), desc: t("Choose from multiple languages for your labels to cater to international clients.") }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col gap-4">
                <feature.icon className="text-primary" size={32} />
                <h4 className="font-bold text-lg">{feature.title}</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-10 md:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-headline font-extrabold text-primary mb-3 md:mb-4">{t("How it works")}</h2>
          <p className="text-sm sm:text-base md:text-lg text-on-surface-variant">{t("Three simple steps to professional billing.")}</p>
        </div>
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-16">
          <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-surface-container-highest -z-10"></div>
          {[
            { step: 1, title: t("Enter business details"), desc: t("Add your logo, business name, address, and client information once.") },
            { step: 2, title: t("Add products and prices"), desc: t("List your services or goods, set quantities, and specify your tax rates.") },
            { step: 3, title: t("Download invoice PDF"), desc: t("Preview your invoice and download the PDF or send it directly via email.") }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary text-on-primary flex items-center justify-center text-3xl font-black mb-8 shadow-xl shadow-primary/10">
                {item.step}
              </div>
              <h3 className="text-xl font-bold mb-4">{item.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SEO Optimized Content Section */}
      <section className="bg-zinc-50 py-12 md:py-24 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 space-y-10 md:space-y-16">
          <div className="prose prose-zinc prose-sm max-w-none">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-headline tracking-tighter mb-4 md:mb-8 text-zinc-900">{t("The World's Most Trusted Free Invoice Generator")}</h2>
            <p className="text-sm md:text-base text-zinc-600 leading-relaxed mb-4 md:mb-6">
              Invoice Generator is the architectural standard for modern business transactions. Our <strong>free invoice maker</strong> 
              is designed to provide freelancers, small business owners, and global enterprises with a 
              professional-grade tool to generate, manage, and download high-resolution PDF invoices instantly. 
              With no registration required, you can create a <strong>GST invoice for India</strong>, a 
              VAT-compliant receipt for Europe, or a standard business invoice for the USA in under 30 seconds.
            </p>
            <p className="text-zinc-600 leading-relaxed">
              Our 100% free platform supports 160+ currencies and real-time tax calculations, making it the 
              premier <strong>online billing software</strong> alternative for contractors and digital nomads. 
              Whether you need to prepare professional quotes, estimates, or sales receipts, Invoice Generator 
              delivers institutional-grade precision with every document.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-12">
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-headline text-zinc-900">{t("Free Invoice Templates 2026")}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Choose from a variety of aesthetic, print-ready <strong>invoice templates</strong>. Each design 
                is fully responsive, ensuring your clients receive a professional document whether they view 
                it on a desktop or a mobile device. Every template is customizable with your brand logo 
                and digital signature.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg md:text-xl font-bold font-headline text-zinc-900">{t("GST & VAT Tax Compliance")}</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                Stay compliant with global tax regulations. Our <strong>GST calculator India</strong> 
                automatically handles tax inclusive and exclusive calculations, while our multi-lingual 
                labels allow you to generate <strong>VAT invoices</strong> tailored specifically to your 
                regional business requirements.
              </p>
            </div>
          </div>

          <div className="pt-8 md:pt-16 border-t border-zinc-200">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black font-headline tracking-tighter mb-6 md:mb-10 text-zinc-900">{t("Frequently Asked Questions")}</h2>
            <div className="space-y-5 md:space-y-8">
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5 md:mb-2">{t("Is Invoice Generator completely free?")}</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Yes, Invoice Generator is a 100% <strong>free invoice generator</strong>. We provide unlimited access to our PDF creation tools, tax calculators, and digital signature features with no hidden costs and no subscription fees.</p>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5 md:mb-2">{t("Can I download my invoices as PDF without an account?")}</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Absolutely. You can generate and download high-quality <strong>PDF invoices</strong> without ever creating an account. Your data is automatically saved to your browser's local storage for your convenience.</p>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5 md:mb-2">{t("Does it support GST billing for India?")}</h4>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Yes, Invoice Generator is fully optimized for Indian businesses. You can easily generate <strong>GST compliant invoices</strong>, including HSN codes and GSTIN details, using our specialized Indian business localization.</p>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-zinc-200 opacity-0 pointer-events-none absolute -z-50 overflow-hidden h-0 w-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-8">{t("Popular Search Terms for SEO Indexing")}</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {[
                "Free Invoice Generator", "GST Invoice India", "Tax Invoice PDF", "Receipt Maker Online",
                "Quotation Maker Free", "Proforma Invoice Maker", "Self Employed Invoices",
                "VAT Invoice Generator", "Business Receipt Maker", "Sales Quote Generator",
                "Bill Maker Free", "Commercial Invoice PDF", "Digital Receipt Generator",
                "invoce generator", "gst invoe maker", "recipt maker free", "bill maker oneline",
                "professional bill generator", "freelance billing software", "small business invoice pdf",
                "create bill online india", "gst tax calculator india", "best invoice marker",
                "simple invoicing solution", "cloud billing app", "safe invoice storage",
                "digital signature on invoice", "custom logo invoice generator", "print ready invoice maker",
                "invoice templates for word", "invoice excel alternative", "easy billing software",
                "instant invoice download", "no login invoice generator", "free quote generator",
                "estimate maker for contractors", "service business billing", "product sales receipt",
                "international invoicing tool", "multi language billing", "multi currency invoice maker",
                "dollar to inr invoice", "euro invoice generator", "gbp receipt maker",
                "uae vat invoice", "saudi tax invoice", "uk vat receipt", "australia gst invoice",
                "canada hst bill", "australia tax invoice", "singapore gst receipt", "malaysia sst bill",
                "usa sales tax invoice", "germany vat bill", "france tva receipt", "spain iva invoice",
                "italy iva bill", "netherlands btw receipt", "switzerland mwst invoice",
                "brazil nota fiscal", "mexico factura generator", "argentina factura bill",
                "chile factura receipt", "colombia factura invoice", "peru factura bill",
                "south africa vat receipt", "nigeria vat invoice", "kenya vat bill",
                "ghana vat receipt", "egypt vat invoice", "turkey kdv bill", "russia vat receipt",
                "china fapiao generator", "japan tax invoice", "south korea tax bill",
                "thailand vat receipt", "vietnam vat invoice", "indonesia vat bill",
                "philippines vat receipt", "pakistan sales tax invoice", "bangladesh vat bill",
                "sri lanka vat receipt", "nepal vat invoice", "bhutan sales tax bill"
              ].map((tag, i) => (
                <span key={i} className="text-xs font-bold text-zinc-400 hover:text-zinc-900 cursor-default transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
