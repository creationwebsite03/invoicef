import React from 'react';
import { useTranslation } from "react-i18next";

export default function Terms() {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-8 py-20 text-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-primary mb-8">{t("Terms of Service")}</h1>
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-outline-variant/10 space-y-8">

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">1. Acceptance of Terms</h2>
          <p className="text-zinc-600 leading-relaxed">
            By accessing and using Invoice Generatorto generate financial documents, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">2. Service Usage</h2>
          <p className="text-zinc-600 leading-relaxed">
            Invoice Generatorprovides professional financial utility tools. The documents generated are meant for professional and legal billing. However, Invoice Generatoris not a substitute for certified accounting or legal advice. You are solely responsible for ensuring the mathematical and legal accuracy of your generated documents based on your local jurisdiction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">3. User Accounts</h2>
          <p className="text-zinc-600 leading-relaxed">
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 font-headline text-zinc-900">4. Intellectual Property</h2>
          <p className="text-zinc-600 leading-relaxed">
            The service and its original content, features, completely distinct brand imagery, and functionality are and will remain the exclusive property of Invoice Generatorand its licensors.
          </p>
        </section>
      </div>
    </div>
  );
}
