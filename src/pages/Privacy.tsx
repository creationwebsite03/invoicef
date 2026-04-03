import React from 'react';
import { useTranslation } from "react-i18next";

export default function Privacy() {
  const { t } = useTranslation();
  
  return (
    <div className="max-w-4xl mx-auto px-8 py-20 text-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-primary mb-8">{t("Privacy Policy")}</h1>
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-outline-variant/10 space-y-8">

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">1. Information We Collect</h2>
          <p className="text-zinc-600 leading-relaxed">
            When you use INVOXA, we collect information that you provide securely. This includes your business details, client details, and invoice records if you choose to create an account and save them to our secure cloud database. Guest users' data is processed entirely locally on their device.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">2. How We Use Your Information</h2>
          <p className="text-zinc-600 leading-relaxed">
            The information you provide is strictly used to generate the required financial documents (invoices, receipts, estimates) and sync them across your devices if you are logged in. We do not sell, rent, or trade your personal or business information to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">3. Data Security</h2>
          <p className="text-zinc-600 leading-relaxed">
            Your data is stored using industry-standard Firebase infrastructure with strict security rules. All communication between your device and our servers is encrypted using standard SSL/TLS protocols.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">4. Cookies and Local Storage</h2>
          <p className="text-zinc-600 leading-relaxed">
            INVOXA uses local storage to remember your preferences (like your preferred language and theme) and to keep your session active. We do not use intrusive tracking cookies.
          </p>
        </section>
      </div>
    </div>
  );
}
