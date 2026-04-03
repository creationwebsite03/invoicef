import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import Layout from "./components/Layout";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy loading pages for better performance
const Home = React.lazy(() => import("./pages/Home"));
const InvoiceGenerator = React.lazy(() => import("./pages/InvoiceGenerator"));
import Dashboard from "./pages/Dashboard";
import MyInvoices from "./pages/MyInvoices";
const Tools = React.lazy(() => import("./pages/Tools"));
const About = React.lazy(() => import("./pages/About"));
const Clients = React.lazy(() => import("./pages/Clients"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));

// Grouping calculators that might be in the same file
const GSTCalculator = React.lazy(() => import("./pages/Calculators").then(module => ({ default: module.GSTCalculator })));
const TaxCalculator = React.lazy(() => import("./pages/Calculators").then(module => ({ default: module.TaxCalculator })));
const DiscountCalculator = React.lazy(() => import("./pages/Calculators").then(module => ({ default: module.DiscountCalculator })));
const CurrencyConverter = React.lazy(() => import("./pages/Calculators").then(module => ({ default: module.CurrencyConverter })));

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <Toaster position="top-right" richColors />
            <Analytics />
            <Layout>
              <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="text-center animate-pulse">
                    <div className="w-10 h-10 border-[3px] border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Loading Module...</p>
                  </div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tools" element={<Tools />} />
                  <Route path="/tools/invoice" element={<InvoiceGenerator />} />
                  <Route path="/tools/invoice/:id" element={<InvoiceGenerator />} />
                  <Route path="/tools/receipt" element={<InvoiceGenerator />} />
                  <Route path="/tools/receipt/:id" element={<InvoiceGenerator />} />
                  <Route path="/tools/quotation" element={<InvoiceGenerator />} />
                  <Route path="/tools/quotation/:id" element={<InvoiceGenerator />} />
                  <Route path="/tools/estimate" element={<InvoiceGenerator />} />
                  <Route path="/tools/estimate/:id" element={<InvoiceGenerator />} />
                  <Route path="/tools/gst" element={<GSTCalculator />} />
                  <Route path="/tools/tax" element={<TaxCalculator />} />
                  <Route path="/tools/discount" element={<DiscountCalculator />} />
                  <Route path="/tools/currency" element={<CurrencyConverter />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-invoices" element={<MyInvoices />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/free-invoice-generator" element={<InvoiceGenerator />} />
                  <Route path="/invoice-template-download" element={<InvoiceGenerator />} />
                  <Route path="/gst-invoice-india" element={<InvoiceGenerator />} />
                </Routes>
              </React.Suspense>
            </Layout>
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
