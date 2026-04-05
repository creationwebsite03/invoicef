import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShieldCheck, ArrowRight, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signIn();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          {/* Backdrop with advanced blur and slight tint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md transition-all duration-500"
          />

          {/* Modal Container */}
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-[90vw] sm:max-w-[400px] bg-white border border-zinc-100 rounded-[2rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
          >
            {/* Unique Floating Glow */}
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-zinc-100/50 blur-[60px] rounded-full"></div>

            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-950 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="p-6 sm:p-10 flex flex-col items-center">
              {/* Unique Minimalist Icon */}
              <div className="mb-8 relative group">
                <img 
                  src="/favicon.png" 
                  alt="Invoice Generator Logo" 
                  className="w-16 h-16 transition-transform group-hover:rotate-12 duration-500 shadow-xl rounded-[1.5rem]" 
                />
              </div>

              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">
                  {t("Welcome to Invoice Generator")}
                </h2>
                <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-[0.15em] mx-auto opacity-70">
                  {t("Secured by Google Cloud")}
                </p>
              </div>

              <div className="w-full space-y-4">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full h-14 bg-white border border-zinc-200 text-zinc-950 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 flex-shrink-0" />
                  <span>{loading ? t("Connecting...") : t("Continue with Google")}</span>
                </button>

                <div className="h-px w-8 bg-zinc-100 mx-auto"></div>
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-950 underline decoration-zinc-100 underline-offset-4">Privacy</span>
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-950 underline decoration-zinc-100 underline-offset-4">Terms</span>
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest cursor-pointer hover:text-zinc-950 underline decoration-zinc-100 underline-offset-4">Security</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
