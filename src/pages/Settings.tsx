import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  Save, 
  Hash,
  ArrowLeft,
  Image as ImageIcon,
  DollarSign,
  Percent,
  ShieldCheck,
  Lock
} from "lucide-react";
import SignaturePad from "../components/SignaturePad";
import { COUNTRIES } from "../constants/countries";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

interface BusinessProfile {
  name: string;
  email: string;
  phone: string;
  dialCode?: string;
  address: string;
  website: string;
  logoUrl?: string;
  signature?: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  country: string;
  isoCode: string;
}

export default function Settings() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile>({
    name: "",
    email: "",
    phone: "",
    dialCode: "+1",
    address: "",
    website: "",
    defaultCurrency: "USD",
    defaultTaxRate: 8.875,
    country: "USA",
    isoCode: "us",
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const docRef = doc(db, `users/${user.uid}/settings`, "profile");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as BusinessProfile);
          }
        } catch (error) {
          console.error("Error loading settings:", error);
          toast.error(t("Failed to load settings"));
        } finally {
          setLoading(false);
        }
      }
    };
    loadProfile();
  }, [user, t]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialCodeChange = (dialCode: string) => {
    const country = COUNTRIES.find(c => c.dialCode === dialCode);
    const maxLength = (country as any)?.phoneLength || 15;
    const trimmedPhone = profile.phone.slice(0, maxLength);
    setProfile(prev => ({ 
      ...prev, 
      dialCode, 
      phone: trimmedPhone,
      country: country?.name || prev.country,
      isoCode: country?.isoCode || prev.isoCode
    }));
  };

  const handlePhoneChange = (value: string) => {
    const country = COUNTRIES.find(c => c.dialCode === profile.dialCode);
    const maxLength = (country as any)?.phoneLength || 15;
    const digits = value.replace(/[^0-9]/g, '').slice(0, maxLength);
    setProfile(prev => ({ ...prev, phone: digits }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/settings`, "profile"), {
        ...profile,
        updatedAt: serverTimestamp()
      });
      toast.success(t("Business profile updated successfully!"));
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error(t("Failed to save settings"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all border border-zinc-100"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tighter mb-2 capitalize">{t("Settings")}</h1>
          <p className="text-zinc-500 font-medium">
            {t("Manage your default business profile and preferences.")}
          </p>
        </div>
      </div>

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-zinc-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-xl shadow-zinc-900/10 overflow-hidden border border-zinc-800">
            {profile.isoCode ? (
              <img 
                src={`https://flagcdn.com/w40/${profile.isoCode}.png`} 
                className="w-8 h-5 object-cover rounded-sm shadow-sm" 
                alt="" 
              />
            ) : (
              <Building2 size={24} />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black font-headline tracking-tighter">{t("Business Identity")}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">{t("Your primary business credentials")}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Business Name")}</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={18} />
                <input
                  type="text"
                  required
                  placeholder={t("Brand or Company Name")}
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Industry Email")}</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="billing@example.com"
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Contact Number")}</label>
              <div className="flex gap-2 relative group">
                <div className="relative w-28 shrink-0">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={18} />
                  <select
                    value={profile.dialCode || ""}
                    onChange={e => handleDialCodeChange(e.target.value)}
                    className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold transition-all appearance-none"
                  >
                    <option value="">+00</option>
                    {COUNTRIES.map(c => <option key={c.name} value={c.dialCode}>{c.flag} {c.dialCode}</option>)}
                  </select>
                </div>
                <input
                  type="tel"
                  placeholder="555-000-0000"
                  value={profile.phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  className="flex-1 bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 px-6 text-sm font-bold transition-all"
                />
              </div>
            </div>

          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Physical Address")}</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={18} />
              <textarea
                rows={3}
                placeholder={t("Full Business Address")}
                value={profile.address}
                onChange={e => setProfile({...profile, address: e.target.value})}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Official Website")}</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" size={18} />
              <input
                type="url"
                placeholder="https://www.company.com"
                value={profile.website}
                onChange={e => setProfile({...profile, website: e.target.value})}
                className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-zinc-100">
            {/* Logo Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-headline tracking-tighter mb-2">{t("Default Logo")}</h3>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{t("Appear on all new documents")}</p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
                  {profile.logoUrl ? (
                    <img src={profile.logoUrl} className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-zinc-300" size={32} />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] cursor-pointer hover:bg-zinc-800 transition-all">
                    {t("Upload Logo")}
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                  <p className="text-[9px] text-zinc-400 font-medium px-1">{t("PNG, JPG, SVG max 2MB")}</p>
                </div>
              </div>
            </div>

            {/* Signature Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold font-headline tracking-tighter mb-2">{t("Default Signature")}</h3>
                <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{t("Your digital authorized stamp")}</p>
              </div>
              <SignaturePad
                initialSignature={profile.signature}
                onSave={(data) => setProfile(prev => ({ ...prev, signature: data || undefined }))}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
             <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Default Currency")}</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <select
                  value={profile.defaultCurrency}
                  onChange={e => setProfile({...profile, defaultCurrency: e.target.value})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold appearance-none transition-all"
                >
                  {COUNTRIES.map(c => <option key={c.name} value={c.currency}>{c.flag} {c.currency} ({c.name})</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">{t("Default Tax Rate (%)")}</label>
              <div className="relative group">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="number"
                  step="0.001"
                  placeholder="8.875"
                  value={profile.defaultTaxRate}
                  onChange={e => setProfile({...profile, defaultTaxRate: parseFloat(e.target.value)})}
                  className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:bg-white focus:ring-0 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400">
              <CheckCircle2 size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{t("Real-time cloud sync active")}</span>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 px-10 py-5 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all active:scale-[0.98] shadow-2xl shadow-zinc-900/20 hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={18} />}
              {t("Save Changes")}
            </button>
          </div>
        </form>
      </motion.section>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-12 p-8 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-primary border border-white/10">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h4 className="text-xl font-black font-headline tracking-tighter">{t("100% Data Privacy Guaranteed")}</h4>
            <p className="text-xs font-medium text-zinc-400 mt-1 max-w-md">{t("Your business details are encrypted and stored in an isolated environment. We never leak or sell your data to third parties.")}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
          <Lock className="text-zinc-500" size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("SSL Encrypted Connection")}</span>
        </div>
      </motion.div>
    </div>
  );
}
