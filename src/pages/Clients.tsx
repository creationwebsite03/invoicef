import React from "react";
import { useTranslation } from "react-i18next";
import { Users, Plus } from "lucide-react";

export default function Clients() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 capitalize">{t("Clients")}</h1>
          <p className="text-on-surface-variant font-medium">
            {t("Manage your client relationships and billing details.")}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/10 hover:scale-[0.98] transition-all">
          <Plus size={20} /> {t("Add Client")}
        </button>
      </div>

      <div className="bg-white p-12 rounded-xl shadow-sm border border-outline-variant/10 text-center">
        <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
          <Users size={40} className="text-zinc-400" />
        </div>
        <h2 className="text-xl font-bold mb-2">{t("No clients yet")}</h2>
        <p className="text-on-surface-variant max-w-md mx-auto mb-8">
          {t("Start by adding your first client to streamline your invoice generation process.")}
        </p>
      </div>
    </div>
  );
}
