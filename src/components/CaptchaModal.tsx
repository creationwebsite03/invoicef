import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ShieldCheck,
  Puzzle,
  Hash,
  Layout,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  CreditCard,
  Briefcase,
  Layers,
  MousePointer2,
  Lock,
  RefreshCcw,
  X
} from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface CaptchaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoiceData?: any;
}

type CaptchaType = "image-select" | "puzzle" | "pattern" | "math";

const ICON_DATA = [
  { id: "inv1", icon: FileText, label: "Invoice", isCorrect: true },
  { id: "inv2", icon: Layers, label: "Document", isCorrect: true },
  { id: "other1", icon: TrendingDown, label: "Chart", isCorrect: false },
  { id: "inv3", icon: FileText, label: "Contract", isCorrect: true },
  { id: "other2", icon: ShoppingBag, label: "Bag", isCorrect: false },
  { id: "other3", icon: CreditCard, label: "Card", isCorrect: false },
  { id: "inv4", icon: Briefcase, label: "Portfolio", isCorrect: true },
  { id: "other4", icon: MousePointer2, label: "Pointer", isCorrect: false },
  { id: "inv5", icon: Hash, label: "ID", isCorrect: true },
];

export default function CaptchaModal({ isOpen, onClose, onSuccess, invoiceData }: CaptchaModalProps) {
  const { t } = useTranslation();
  const [captchaType, setCaptchaType] = useState<CaptchaType>("image-select");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [startTime, setStartTime] = useState(0);

  // States for different types
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [puzzlePos, setPuzzlePos] = useState(0);
  const [patternOrder, setPatternOrder] = useState<number[]>([]);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathProblem, setMathProblem] = useState({ question: "", answer: 0 });

  // Rate Limiting Logic (Client-side sync)
  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    const history = JSON.parse(localStorage.getItem("invoxa_download_history") || "[]");
    const oneMinuteAgo = now - 60000;
    const recentDownloads = history.filter((ts: number) => ts > oneMinuteAgo);

    if (recentDownloads.length >= 5) {
      return false;
    }
    return true;
  }, []);

  // Bot Detection Utility
  const isBotDetected = useCallback(() => {
    if (navigator.webdriver) return true;
    if (window.navigator?.languages?.length === 0) return true;
    
    // Check for missing common browser markers
    if (navigator.userAgent.includes("Headless")) return true;
    
    return false;
  }, []);

  const randomizeChallenge = useCallback(() => {
    const types: CaptchaType[] = ["image-select", "puzzle", "pattern", "math"];
    const random = types[Math.floor(Math.random() * types.length)];
    setCaptchaType(random);
    setFailed(false);
    setSelectedIcons([]);
    setPuzzlePos(0);
    setPatternOrder([]);
    setMathAnswer("");
    setStartTime(Date.now());

    if (random === "math") {
      const num1 = Math.floor(Math.random() * 50) + 10;
      const taxRate = 5;
      const result = (num1 * taxRate) / 100;
      setMathProblem({
        question: `If the subtotal is $${num1} and the tax rate is ${taxRate}%, what is the tax amount?`,
        answer: result
      });
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      randomizeChallenge();
    }
  }, [isOpen, randomizeChallenge]);

  const handleSubmit = async () => {
    // 1. Timing defense: Humans take > 1s typically
    const duration = Date.now() - startTime;
    if (duration < 1200) {
      setFailed(true);
      return;
    }

    // 2. Behavioral/Headless Check
    if (isBotDetected()) {
      setFailed(true);
      return;
    }

    // 3. Rate Limit check
    if (!checkRateLimit()) {
      toast.error(t("Rate limit reached. Please wait a minute."));
      return;
    }

    setLoading(true);

    let isCorrect = false;

    // Challenge Logic
    switch (captchaType) {
      case "image-select":
        const correctIds = ICON_DATA.filter(i => i.isCorrect).map(i => i.id);
        const selectedCorrect = selectedIcons.filter(id => correctIds.includes(id));
        const selectedIncorrect = selectedIcons.filter(id => !correctIds.includes(id));
        isCorrect = selectedCorrect.length >= 2 && selectedIncorrect.length === 0;
        break;
      case "puzzle":
        isCorrect = Math.abs(puzzlePos - 85) < 6; // Target spot at 85%
        break;
      case "pattern":
        isCorrect = JSON.stringify(patternOrder.slice(0, 3)) === JSON.stringify([0, 1, 2]);
        break;
      case "math":
        isCorrect = Math.abs(parseFloat(mathAnswer) - mathProblem.answer) < 0.01;
        break;
    }

    // Simulated back-end verification delay
    setTimeout(() => {
      if (isCorrect) {
        // Log to rate limiter
        const history = JSON.parse(localStorage.getItem("invoxa_download_history") || "[]");
        history.push(Date.now());
        localStorage.setItem("invoxa_download_history", JSON.stringify(history.slice(-10)));

        onSuccess();
        onClose();
      } else {
        setFailed(true);
        setLoading(false);
      }
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative border border-zinc-100"
      >
        <div className="p-8 pb-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-zinc-900 rounded-[1.25rem] flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black font-headline tracking-tight">{t("Security Check")}</h2>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-1">{t("Protecting your data")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-50 rounded-xl transition-colors">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        <div className="p-8 pt-4">
          <AnimatePresence mode="wait">
            {failed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-4"
              >
                <AlertCircle className="text-red-500 shrink-0" size={24} />
                <div>
                  <p className="text-sm font-black text-red-600 leading-tight">{t("Verification failed")}</p>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{t("Please try again")}</p>
                </div>
                <button onClick={randomizeChallenge} className="ml-auto p-2 hover:bg-red-100 rounded-xl transition-colors">
                  <RefreshCcw size={16} className="text-red-600" />
                </button>
              </motion.div>
            )}

            {/* Content for different types */}
            <div className="min-h-[220px]">
              {captchaType === "image-select" && (
                <div className="space-y-6">
                  <p className="text-sm font-bold text-zinc-600">{t("Select icon related to Invoices or Documents")}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {ICON_DATA.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setSelectedIcons(prev =>
                          prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id]
                        )}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center border-2 transition-all p-4",
                          selectedIcons.includes(item.id)
                            ? "border-zinc-900 bg-zinc-900 text-white shadow-xl shadow-zinc-900/20"
                            : "border-zinc-100 bg-zinc-50 hover:bg-zinc-100 text-zinc-400"
                        )}
                      >
                        <item.icon size={28} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {captchaType === "puzzle" && (
                <div className="space-y-8">
                  <p className="text-sm font-bold text-zinc-600">{t("Slide to complete the document puzzle")}</p>
                  <div className="h-24 bg-zinc-100 rounded-2xl relative overflow-hidden border border-zinc-200 p-4">
                    <div className="h-full w-full border-2 border-dashed border-zinc-200 rounded-lg flex items-center justify-between px-4">
                      <FileText size={32} className="text-zinc-200" />
                      <div className="w-12 h-12 bg-white/50 border-2 border-dashed border-zinc-300 rounded-lg"></div>
                    </div>
                    <motion.div
                      style={{ left: `${puzzlePos}%` }}
                      className="absolute top-1/2 -translate-y-1/2 -ml-8 w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center text-white shadow-2xl"
                    >
                      <Puzzle size={28} />
                    </motion.div>
                  </div>
                  <input
                    type="range" min="0" max="100" value={puzzlePos}
                    onChange={e => setPuzzlePos(parseInt(e.target.value))}
                    className="w-full accent-zinc-900 h-2 bg-zinc-100 rounded-full cursor-pointer"
                  />
                </div>
              )}

              {captchaType === "pattern" && (
                <div className="space-y-6">
                  <p className="text-sm font-bold text-zinc-600">{t("Click the top row from left to right")}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <button
                        key={i}
                        onClick={() => setPatternOrder(prev => [...prev, i])}
                        className={cn(
                          "aspect-square rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all",
                          patternOrder.includes(i) ? "bg-zinc-900 text-white border-zinc-900" : "bg-zinc-50 border-zinc-100"
                        )}
                      >
                        {patternOrder.indexOf(i) !== -1 ? patternOrder.indexOf(i) + 1 : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {captchaType === "math" && (
                <div className="space-y-6">
                  <p className="text-sm font-bold text-zinc-600">{mathProblem.question}</p>
                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={e => setMathAnswer(e.target.value)}
                    placeholder="Enter result..."
                    className="w-full px-6 py-5 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-zinc-900 transition-all font-black text-2xl tracking-tighter"
                  />
                </div>
              )}
            </div>
          </AnimatePresence>

          <div className="mt-10 flex flex-col gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-zinc-900 text-white py-4.5 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-xs shadow-2xl shadow-zinc-900/40 hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-[0.97] flex items-center justify-center gap-3"
            >
              {loading ? <div className="animate-spin w-5 h-5 border-3 border-white border-t-transparent rounded-full" /> : (
                <>
                  <Lock size={16} />
                  {t("Confirm Verification")}
                </>
              )}
            </button>
            <button
              onClick={randomizeChallenge}
              className="py-2 text-[10px] font-black uppercase tracking-widest text-zinc-300 hover:text-zinc-500 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw size={10} /> {t("New Challenge")}
            </button>
          </div>
        </div>

        <div className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-around opacity-20 filter grayscale pointer-events-none">
          <FileText size={16} />
          <MousePointer2 size={16} />
          <CreditCard size={16} />
          <Lock size={16} />
        </div>
      </motion.div>
    </div>
  );
}
