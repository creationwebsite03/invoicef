import React from "react";
import { motion } from "motion/react";
import { Shield, Zap, Globe, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-bl-[20rem] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-6xl md:text-7xl font-black font-headline tracking-tighter mb-8 leading-none">
              {t("Precision Billing for the Global Elite.")}
            </h1>
            <p className="text-xl text-on-surface-variant font-body leading-relaxed mb-12">
              {t("Invoice Generatorwas born from a simple observation: most invoicing tools are either too complex for freelancers or too rigid for global enterprises. We built the middle ground—a high-performance financial arsenal that balances architectural precision with effortless style.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: Shield, title: t("Institutional Grade"), desc: t("Security and precision that meets the highest corporate standards.") },
              { icon: Zap, title: t("Instant Execution"), desc: t("Draft, customize, and deploy professional billing in under 60 seconds.") },
              { icon: Globe, title: t("Borderless Commerce"), desc: t("Support for 160+ currencies and regional tax compliance out of the box.") },
              { icon: Users, title: t("Human Centric"), desc: t("Designed for the people behind the numbers, not just the spreadsheets.") }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="space-y-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-bold font-headline">{value.title}</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-zinc-900 rounded-[3rem] p-12 md:p-24 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mb-48"></div>
            <div className="max-w-2xl relative z-10">
              <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter mb-8">{t("Our Mission is to eliminate the friction of global trade.")}</h2>
              <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
                {t("We believe that financial tools should empower creativity, not stifle it. By automating the mundane aspects of billing and tax compliance, we give modern teams the freedom to focus on what they do best: building the future.")}
              </p>
              <p className="text-lg text-zinc-400 mb-12 leading-relaxed">
                {t("Our team of designers and engineers are dedicated to building a platform that doesn't just generate documents, but creates professional assets that help you win more business and get paid faster.")}
              </p>
              <div className="flex flex-wrap items-center gap-12">
                <div>
                  <p className="text-4xl font-black">500k+</p>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t("Invoices Created")}</p>
                </div>
                <div className="w-px h-12 bg-zinc-800 hidden md:block"></div>
                <div>
                  <p className="text-4xl font-black">120+</p>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t("Countries Supported")}</p>
                </div>
                <div className="w-px h-12 bg-zinc-800 hidden md:block"></div>
                <div>
                  <p className="text-4xl font-black">50k+</p>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t("Active Users")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
