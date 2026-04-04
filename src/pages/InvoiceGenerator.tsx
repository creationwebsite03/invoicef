import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  Plus,
  Trash2,
  Download,
  Share2,
  Image as ImageIcon,
  CheckCircle2,
  Save,
  Eraser,
  Eye,
  X,
  Building2,
  User,
  FileText,
  List,
  Calculator,
  Gavel,
  PenTool,
  Settings,
  Percent,
  Globe
} from "lucide-react";
import { toast } from "sonner";
import { auth, db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/error-handler";


import SEO from "../components/SEO";
import { useLanguage } from "../context/LanguageContext";
import { COUNTRIES, CURRENCIES, LANGUAGES } from "../constants/countries";
import { getExchangeRate } from "../services/currencyService";
import { Invoice, InvoiceItem } from "../types/invoice";

// Simple sanitization function to prevent XSS
const sanitize = (val: any): string => {
  if (val === undefined || val === null) return "";
  const str = String(val);
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m] || m));
};
import { cn } from "../lib/utils";
import i18n from "../lib/i18n";
import InvoiceTemplate from "../components/InvoiceTemplate";
import SignaturePad from "../components/SignaturePad";

const TEMPLATES = [
  { id: "professional", name: "Professional" },
  { id: "minimal", name: "Minimal" },
  { id: "executive", name: "Executive" },
  { id: "startup", name: "Startup" },
  { id: "bold", name: "Bold" },
];

export default function InvoiceGenerator() {
  const { t, currentLanguage, selectedPhone, currency: globalCurrency } = useLanguage();
  const { user, loading } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const mobilePreviewRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPhone) {
      setInvoice(prev => {
        // We only want to update the dialCode automatically (to match the selected region),
        // but we STOP setting the actual value for'phone' here because the user
        // requested it to be in the placeholder and not 'written' (viva).
        return {
          ...prev,
          businessDetails: {
            ...prev.businessDetails,
            dialCode: currentLanguage.dialCode || prev.businessDetails.dialCode || "+1"
          }
        };
      });
    }
  }, [selectedPhone, currentLanguage.dialCode]);



  const getDocType = () => {
    const path = location.pathname;
    if (path.includes("receipt")) return { title: t("Receipt"), prefix: "REC", type: "receipt" as const };
    if (path.includes("quotation")) return { title: t("Quotation"), prefix: "QUO", type: "quotation" as const };
    if (path.includes("estimate")) return { title: t("Estimate"), prefix: "EST", type: "estimate" as const };
    return { title: t("Invoice"), prefix: "INV", type: "invoice" as const };
  };

  const docType = getDocType();


  const [invoice, setInvoice] = useState<Invoice>({
    type: docType.type,
    template: "professional",
    invoiceNumber: `${docType.prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    currency: "USD",
    country: "USA",
    isoCode: "us",
    businessDetails: { name: "", email: "", phone: "", address: "", dialCode: "+1", isoCode: "us" },
    clientDetails: { name: "", email: "", address: "", phone: "" },
    items: [{ id: "1", description: "", quantity: 0, price: 0 }],
    taxRate: 0,
    taxAmount: 0,
    discount: 0,
    shipping: 0,
    subtotal: 0,
    total: 0,
    notes: "",
    terms: "",
    language: "en",
    themeColor: localStorage.getItem("invoxa_themeColor") || "#0f172a"
  });

  // Persist themeColor to localStorage on every change — eliminates flash on refresh
  useEffect(() => {
    if (invoice.themeColor) {
      localStorage.setItem("invoxa_themeColor", invoice.themeColor);
    }
  }, [invoice.themeColor]);

  useEffect(() => {
    const el = previewContainerRef.current;
    const contentEl = previewRef.current;
    if (!el || !contentEl) return;

    let lastNaturalHeight = 0;
    let lastContainerWidth = 0;

    const applyScale = () => {
      if (!el || !contentEl) return;

      const containerWidth = el.offsetWidth;
      // Reset transform to measure natural height safely
      contentEl.style.transform = 'none';
      const naturalHeight = contentEl.scrollHeight;

      if (containerWidth === 0) return;

      // Guard: Only update if dimensions actually changed (prevents infinite loop)
      if (containerWidth === lastContainerWidth && Math.abs(naturalHeight - lastNaturalHeight) < 2) {
        const scale = Math.min(containerWidth / 794, 1);
        contentEl.style.transform = `scale(${scale})`;
        contentEl.style.transformOrigin = 'top left';
        return;
      }

      lastNaturalHeight = naturalHeight;
      lastContainerWidth = containerWidth;

      const scale = Math.min(containerWidth / 794, 1);
      const visualHeight = Math.ceil(naturalHeight * scale);

      contentEl.style.transform = `scale(${scale})`;
      contentEl.style.transformOrigin = 'top left';
      el.style.height = `${visualHeight}px`;
    };

    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(applyScale);
    });

    ro.observe(el);
    ro.observe(contentEl);

    applyScale();

    return () => ro.disconnect();
  }, [location.pathname, invoice.items.length, invoice.template]);





  const [showTax, setShowTax] = useState(true);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [lockEnglish, setLockEnglish] = useState(true);

  const [targetCurrency, setTargetCurrency] = useState(invoice.currency);

  // REAL-TIME SYNC: Global Currency Engine
  useEffect(() => {
    if (globalCurrency && !id) {
      const country = COUNTRIES.find(c => c.currency === globalCurrency);
      setInvoice(prev => ({
        ...prev,
        currency: globalCurrency,
        country: country?.name || prev.country,
        taxRate: country?.taxRate ?? prev.taxRate
      }));
    }
  }, [globalCurrency, id]);


  useEffect(() => {
    const fetchRate = async () => {
      if (invoice.currency !== targetCurrency) {
        const rate = await getExchangeRate(invoice.currency, targetCurrency);
        setExchangeRate(rate);
      } else {
        setExchangeRate(1);
      }
    };
    fetchRate();
  }, [invoice.currency, targetCurrency]);

  useEffect(() => {
    if (!id) {
      setInvoice(prev => ({
        ...prev,
        type: docType.type,
        invoiceNumber: `${docType.prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
      }));
    }
  }, [docType.prefix, docType.type, id]);

  useEffect(() => {
    const loadProfileSettings = async () => {
      if (user && !id) {
        setIsProfileLoading(true);
        try {
          const docRef = doc(db, `users/${user.uid}/settings`, "profile");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const profile = docSnap.data();
            setInvoice(prev => ({
              ...prev,
              businessDetails: {
                ...prev.businessDetails,
                name: profile.name || prev.businessDetails.name,
                email: profile.email || prev.businessDetails.email,
                phone: profile.phone || prev.businessDetails.phone,
                dialCode: profile.dialCode || prev.businessDetails.dialCode,
                address: profile.address || prev.businessDetails.address,
                website: profile.website || prev.businessDetails.website,
              },
              currency: profile.defaultCurrency || prev.currency,
              taxRate: profile.defaultTaxRate !== undefined ? profile.defaultTaxRate : prev.taxRate,
              signature: profile.signature || prev.signature
            }));
            if (profile.logoUrl) setLogo(profile.logoUrl);
            if (profile.signature) setSignature(profile.signature);
          }
        } catch (error: any) {
          if (error.code === 'permission-denied') {
            console.warn("Profile sync postponed: Permissions pending authentication state.");
          } else {
            console.error("Error loading business profile:", error);
          }
        } finally {
          setIsProfileLoading(false);
        }
      }
    };
    loadProfileSettings();
  }, [user, id]);

  useEffect(() => {
    const loadInvoice = async () => {
      if (id && user) {
        try {
          const docRef = doc(db, `users/${user.uid}/invoices`, id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as Invoice;
            setInvoice(data);
            if (data.businessDetails.logoUrl) setLogo(data.businessDetails.logoUrl);
            if (data.signature) setSignature(data.signature);
          }


        } catch (error) {
          console.error("Error loading invoice:", error);
        }
      }
    };
    loadInvoice();
  }, [id, user]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get("download") === "true" && invoice.id === id && id) {
      const timer = setTimeout(() => {
        downloadPDF();
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (queryParams.get("print") === "true" && invoice.id === id && id) {
      const timer = setTimeout(() => {
        window.print();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [invoice.id, id, location.search]);

  const [logo, setLogo] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);




  const getSanitizedInvoice = () => {
    return {
      ...invoice,
      businessDetails: {
        ...invoice.businessDetails,
        name: sanitize(invoice.businessDetails.name),
        email: sanitize(invoice.businessDetails.email),
        phone: sanitize(invoice.businessDetails.phone),
        address: sanitize(invoice.businessDetails.address),
        website: sanitize(invoice.businessDetails.website),
      },
      clientDetails: {
        ...invoice.clientDetails,
        name: sanitize(invoice.clientDetails.name),
        email: sanitize(invoice.clientDetails.email),
        phone: sanitize(invoice.clientDetails.phone),
        address: sanitize(invoice.clientDetails.address),
      },
      invoiceNumber: sanitize(invoice.invoiceNumber),
      notes: sanitize(invoice.notes || ""),
      terms: sanitize(invoice.terms || ""),
      items: invoice.items.map(item => ({
        ...item,
        description: sanitize(item.description)
      })),
      paymentMethod: sanitize(invoice.paymentMethod || ""),
      transactionId: sanitize(invoice.transactionId || ""),
      amountInWords: sanitize(invoice.amountInWords || ""),
      validityPeriod: sanitize(invoice.validityPeriod || ""),
      expectedStartDate: sanitize(invoice.expectedStartDate || ""),
      timeframe: sanitize(invoice.timeframe || ""),
      contingencyClause: sanitize(invoice.contingencyClause || ""),
      disclaimer: sanitize(invoice.disclaimer || ""),
    };


  };

  // Real-time Auto-save logic
  useEffect(() => {
    const hasContent = invoice.businessDetails.name ||
      invoice.clientDetails.name ||
      (invoice.items.length > 0 && invoice.items[0].description) ||
      invoice.total > 0;

    if (!hasContent) return;

    const currentId = id || draftId;

    const timer = setTimeout(async () => {
      // 1. Guest auto-save is DISABLED as per request. Only manual save for guests.
      if (!user) return;

      // 2. Logged-in auto-save to Firestore
      try {
        const sanitizedInvoice = getSanitizedInvoice();

        if (currentId) {
          const docRef = doc(db, `users/${user.uid}/invoices`, currentId);
          await updateDoc(docRef, {
            ...sanitizedInvoice,
            updatedAt: new Date().toISOString(),
          });
          setLastAutoSave(new Date().toLocaleTimeString());
        } else {
          // Check for duplicate invoice number if it's a new invoice
          const q = query(
            collection(db, `users/${user.uid}/invoices`),
            where("invoiceNumber", "==", invoice.invoiceNumber)
          );
          const querySnapshot = await getDocs(q);
          if (querySnapshot.empty) {
            const docRef = await addDoc(collection(db, `users/${user.uid}/invoices`), {
              ...sanitizedInvoice,
              userId: user.uid,
              createdAt: new Date().toISOString(),
              serverCreatedAt: serverTimestamp(),
            });
            setDraftId(docRef.id);
            localStorage.removeItem("invoxa_autosave");
            setLastAutoSave(new Date().toLocaleTimeString());
          }
        }
      } catch (error) {
        console.error("Auto-save failed", error);
      }
    }, 2500); // 2.5 seconds debounce

    return () => clearTimeout(timer);
  }, [invoice, logo, signature, id, draftId, user]);


  const restoreAutoSave = () => {
    const saved = localStorage.getItem("invoxa_autosave");
    if (saved) {
      try {
        const { invoice: savedInvoice, logo: savedLogo, signature: savedSignature } = JSON.parse(saved);
        setInvoice(savedInvoice);
        if (savedLogo) setLogo(savedLogo);
        if (savedSignature) setSignature(savedSignature);


        toast.success(t("Auto-save restored successfully!"));
      } catch (e) {
        console.error("Failed to restore auto-save", e);
      }
    }
  };

  const clearAutoSave = () => {
    localStorage.removeItem("invoxa_autosave");
    setLastAutoSave(null);
  };

  const clearSignature = () => {
    setSignature(null);
    setInvoice(prev => ({ ...prev, signature: undefined }));
  };

  useEffect(() => {
    const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const discountAmount = (subtotal * invoice.discount) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = showTax ? (discountedSubtotal * invoice.taxRate) / 100 : 0;
    const total = discountedSubtotal + taxAmount + invoice.shipping;

    setInvoice(prev => {
      if (prev.subtotal === subtotal && prev.taxAmount === taxAmount && prev.total === total) return prev;
      return { ...prev, subtotal, taxAmount, total };
    });
  }, [invoice.items, invoice.taxRate, invoice.discount, invoice.shipping, showTax]);



  const handleCountryChange = (countryName: string) => {
    const country = COUNTRIES.find(c => c.name === countryName);
    if (country) {
      setInvoice(prev => ({
        ...prev,
        country: countryName,
        isoCode: country.isoCode,
        currency: country.currency,
        taxRate: country.taxRate,
        businessDetails: {
          ...prev.businessDetails,
          dialCode: country.dialCode,
          isoCode: country.isoCode
        }
      }));
    }
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: Math.random().toString(36).substr(2, 9), description: "", quantity: 0, price: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    if (invoice.items.length > 1) {
      setInvoice(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setLogo(dataUrl);
        setInvoice(prev => ({
          ...prev,
          businessDetails: { ...prev.businessDetails, logoUrl: dataUrl }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialCodeChange = (detailsType: "businessDetails" | "clientDetails", dialCode: string) => {
    const country = COUNTRIES.find(c => c.dialCode === dialCode);
    const maxLength = (country as any)?.phoneLength || 15;

    setInvoice(prev => {
      const currentPhone = prev[detailsType].phone || "";
      const trimmedPhone = currentPhone.slice(0, maxLength);
      return {
        ...prev,
        [detailsType]: { ...prev[detailsType], dialCode, phone: trimmedPhone }
      };
    });
  };

  const handlePhoneChange = (detailsType: "businessDetails" | "clientDetails", value: string) => {
    const dialCode = invoice[detailsType].dialCode;
    const country = COUNTRIES.find(c => c.dialCode === dialCode);
    const maxLength = (country as any)?.phoneLength || 15;
    const digits = value.replace(/[^0-9]/g, '').slice(0, maxLength);

    setInvoice(prev => ({
      ...prev,
      [detailsType]: { ...prev[detailsType], phone: digits }
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const sanitizedInvoice = getSanitizedInvoice();
      const currentId = id || draftId;

      if (!user) {
        toast.error(t("Please login to save your documents."));
        setIsSaving(false);
        return;
      }

      // Check for duplicate invoice number if it's a new invoice
      if (!currentId) {
        const q = query(
          collection(db, `users/${user.uid}/invoices`),
          where("invoiceNumber", "==", invoice.invoiceNumber)
        );
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/invoices`);
          return;
        }
        if (!querySnapshot.empty) {
          toast.error(t("An invoice with this number already exists. Please use a unique number."));
          setIsSaving(false);
          return;
        }
      }

      if (currentId) {
        const docRef = doc(db, `users/${user.uid}/invoices`, currentId);
        try {
          await updateDoc(docRef, {
            ...sanitizedInvoice,
            updatedAt: new Date().toISOString(),
          });
          toast.success(t(`${docType.title} updated successfully!`));
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/invoices/${id}`);
        }
      } else {
        try {
          await addDoc(collection(db, `users/${user.uid}/invoices`), {
            ...sanitizedInvoice,
            userId: user.uid,
            createdAt: new Date().toISOString(),
            serverCreatedAt: serverTimestamp(),
          });
          toast.success(t(`${docType.title} saved successfully!`));
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}/invoices`);
        }
      }
    } catch (error) {
      console.error(`Error saving ${docType.title.toLowerCase()}:`, error);
      toast.error(t(`Failed to save ${docType.title.toLowerCase()}.`));
    } finally {
      setIsSaving(false);
    }
  };


  const downloadPDF = async () => {
    const targetRef = captureRef; // Always use the dedicated off-screen capture portal
    if (!targetRef.current) return;

    setIsSaving(true);
    const loadingToast = toast.loading(t("Preparing PDF..."));

    try {
      const [jsPDF, html2canvas] = await Promise.all([
        import("jspdf").then(m => m.default),
        import("html2canvas").then(m => m.default)
      ]);

      // Ensure 1.5s delay for full translation and complex SVG/Font rendering
      await new Promise(resolve => setTimeout(resolve, 1500));

      const canvas = await (html2canvas as any)(targetRef.current, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: 794,
        onclone: (clonedDoc: HTMLDocument) => {
          // Find the actual element meant for capturing
          const el = clonedDoc.querySelector('[data-pdf-capture]') as HTMLElement;
          if (el) {
            el.style.transform = "none";
            const templateWrap = el.querySelector('.relative.overflow-hidden') as HTMLElement;
            if (templateWrap) {
              const bgStyle = window.getComputedStyle(templateWrap).backgroundColor;
              el.style.backgroundColor = bgStyle;
            }
            el.style.width = "794px";
            el.style.minHeight = "1122px";
            el.style.height = "auto";
            el.style.margin = "0";
            el.style.padding = "0";
            el.style.display = "block";
            el.style.opacity = "1";
            el.style.visibility = "visible";
            el.style.imageRendering = "crisp-edges";

            // SMART COLOR CONVERSION: Convert ALL modern CSS colors to rgb() for html2canvas PDF safety
            const colorCanvas = document.createElement('canvas');
            colorCanvas.width = 1;
            colorCanvas.height = 1;
            const ctx = colorCanvas.getContext('2d', { willReadFrequently: true });

            // Detect any unsupported CSS color function
            const hasUnsupportedColor = (val: string) =>
              val.includes('oklch') ||
              val.includes('oklab') ||
              val.includes('oklab') ||
              val.includes(' lab(') ||
              val.includes(' lch(') ||
              (val.includes('color(') && !val.startsWith('#') && !val.startsWith('rgb'));

            const convertColor = (val: string) => {
              if (!ctx || !hasUnsupportedColor(val)) return val;
              try {
                ctx.clearRect(0, 0, 1, 1);
                ctx.fillStyle = val;
                ctx.fillRect(0, 0, 1, 1);
                const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
                if (a === 0) return 'transparent';
                return a < 255 ? `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})` : `rgb(${r}, ${g}, ${b})`;
              } catch (e) {
                // Fallback: white for light colors, black for dark
                return '#000000';
              }
            };

            const targetElements = [el, ...Array.from(el.querySelectorAll('*'))] as HTMLElement[];
            targetElements.forEach((node) => {
              const htmlNode = node as HTMLElement;
              const style = window.getComputedStyle(htmlNode);
              for (let i = 0; i < style.length; i++) {
                const prop = style[i];
                const value = style.getPropertyValue(prop);
                if (value && hasUnsupportedColor(value)) {
                  const safeColor = convertColor(value);
                  htmlNode.style.setProperty(prop, safeColor, 'important');
                }
              }
            });

          }

          // Force all ancestors to visible/auto for cloning safety
          let current: HTMLElement | null = el;
          while (current) {
            current.style.overflow = "visible";
            current.style.height = "auto";
            current.style.minHeight = "auto";
            current = current.parentElement;
          }
        }
      });

      const imgData = canvas.toDataURL("image/png", 1.0);

      if (imgData === "data:," || imgData === "data:;base64," || canvas.width === 0) {
        console.error("Canvas capture result:", { width: canvas.width, height: canvas.height, imgDataPrefix: imgData.substring(0, 20) });
        throw new Error("Canvas captured is empty");
      }

      const pdf = new (jsPDF as any)("p", "mm", "a4", true); // true = compress
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      const calculatedHeight = pdfWidth / ratio;

      let heightLeft = calculatedHeight;
      let position = 0;

      // Add the first page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, calculatedHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages only if there's significant content left (> 10mm buffer)
      while (heightLeft > 10) {
        position = heightLeft - calculatedHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, calculatedHeight);
        heightLeft -= pdfHeight;
      }


      pdf.save(`INVOXA_${docType.title}_${invoice.invoiceNumber}.pdf`);
      toast.dismiss(loadingToast);
      toast.success(t("PDF downloaded successfully!"));
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.dismiss(loadingToast);
      toast.error(t("Failed to generate PDF. Make sure all items are entered."));
    } finally {
      setIsSaving(false);
    }
  };



  const currencySymbol = CURRENCIES.find(c => c.code === invoice.currency)?.symbol || invoice.currency;
  const targetCurrencySymbol = CURRENCIES.find(c => c.code === targetCurrency)?.symbol || targetCurrency;
  const tInvoice = i18n.getFixedT(lockEnglish ? "en" : i18n.language);
  const hasMinimalContent = !!(
    invoice.businessDetails.name &&
    invoice.businessDetails.address &&
    invoice.clientDetails.name &&
    invoice.clientDetails.address &&
    invoice.items.length > 0 &&
    invoice.items[0].description &&
    invoice.items[0].quantity > 0 &&
    invoice.items[0].price > 0
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] antialiased pb-20">
      <SEO
        title={`${t(docType.type.charAt(0).toUpperCase() + docType.type.slice(1))} Designer`}
        description={`Create professional ${docType.type}s with INVOXA - the world's #1 free global billing designer for 2026. 100% accurate GST calculations, multicurrency support, and elite PDF exports.`}
        keywords={`free ${docType.type} generator, online ${docType.type} maker, professional ${docType.type} template, ${docType.type} pdf download, gst invoice software, 2026 small business tools`}
      />

      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-10 py-6 md:py-10">
        {!loading && !user && (
          <div className="mb-6 p-4 sm:p-5 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 select-none animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 shrink-0 rounded-full bg-amber-400 animate-pulse mt-1.5"></div>
              <div>
                <p className="text-white text-xs sm:text-sm font-bold leading-snug">
                  {t("Save your invoices — free, forever.")}
                </p>
                <p className="text-zinc-400 text-[10px] sm:text-xs leading-relaxed mt-0.5">
                  {t("Sign in to auto-save, access cloud sync & manage all documents from any device.")}
                </p>
              </div>
            </div>
            <button
              onClick={() => document.dispatchEvent(new CustomEvent("open-login-modal"))}
              className="shrink-0 px-4 py-2 bg-white text-zinc-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-zinc-100 active:scale-95 transition-all whitespace-nowrap"
            >
              {t("Sign In Free")}
            </button>
          </div>
        )}

        <header className="mb-6 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 uppercase leading-none">
              {t(docType.type.charAt(0).toUpperCase() + docType.type.slice(1))} <span className="text-zinc-400">DESIGNER</span>
            </h1>
            {docType.type === "invoice" && (
              <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-2 md:mt-3 max-w-xl leading-relaxed">
                Free professional <span className="text-zinc-800 font-semibold">invoice generator</span> — create GST-compliant, multi-currency invoices &amp; download <span className="text-zinc-800 font-semibold">print-ready PDFs</span> instantly.{invoice.clientDetails.name ? <> Billing <span className="text-zinc-900 font-bold underline decoration-zinc-200 underline-offset-4">{invoice.clientDetails.name}</span>.</> : " No signup required."}
              </p>
            )}
            {docType.type === "receipt" && (
              <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-2 md:mt-3 max-w-xl leading-relaxed">
                Free online <span className="text-zinc-800 font-semibold">receipt maker</span> — generate itemized payment receipts with tax breakdown, digital signature &amp; logo. <span className="text-zinc-800 font-semibold">Download PDF</span>{invoice.clientDetails.name ? <> for <span className="text-zinc-900 font-bold underline decoration-zinc-200 underline-offset-4">{invoice.clientDetails.name}</span>.</> : " in one click."}
              </p>
            )}
            {docType.type === "quotation" && (
              <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-2 md:mt-3 max-w-xl leading-relaxed">
                Free business <span className="text-zinc-800 font-semibold">quotation generator</span> — create itemized price quotes with validity date &amp; digital signature. <span className="text-zinc-800 font-semibold">Export PDF</span>{invoice.clientDetails.name ? <> for <span className="text-zinc-900 font-bold underline decoration-zinc-200 underline-offset-4">{invoice.clientDetails.name}</span>.</> : " in one click, no account needed."}
              </p>
            )}
            {docType.type === "estimate" && (
              <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-2 md:mt-3 max-w-xl leading-relaxed">
                Free project <span className="text-zinc-800 font-semibold">estimate generator</span> — break down labor, materials &amp; services into a professional <span className="text-zinc-800 font-semibold">cost estimate PDF</span>.{invoice.clientDetails.name ? <> For <span className="text-zinc-900 font-bold underline decoration-zinc-200 underline-offset-4">{invoice.clientDetails.name}</span>.</> : " Built for contractors &amp; freelancers."}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowPreviewModal(true)}
              className="lg:hidden flex-1 flex items-center justify-center gap-3 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
            >
              <Eye size={16} /> {t("Live Preview")}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Form Panel */}
          <div className="lg:col-span-7 space-y-10">
            {/* 1. Company Information */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 transition-all hover:shadow-xl hover:shadow-zinc-200/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-white">
                  <Building2 size={20} />
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase leading-none">{t("Origin Node")}</h2>
              </div>
              <div className="space-y-4">
                <input
                  className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                  placeholder={t("Company Name")}
                  value={invoice.businessDetails.name}
                  onChange={e => setInvoice(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, name: e.target.value } }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                    placeholder={t("Email")}
                    value={invoice.businessDetails.email}
                    onChange={e => setInvoice(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, email: e.target.value } }))}
                  />
                  <div className="flex gap-2">
                    <select
                      className="w-28 flex-shrink-0 bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm font-bold appearance-none cursor-pointer hover:bg-zinc-100 transition-colors"
                      value={invoice.businessDetails.dialCode || ""}
                      onChange={e => handleDialCodeChange("businessDetails", e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c.name} value={c.dialCode}>{c.isoCode.toUpperCase()} ({c.dialCode})</option>)}
                    </select>
                    <input
                      className="flex-1 min-w-0 bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                      placeholder={COUNTRIES.find(c => c.dialCode === invoice.businessDetails.dialCode)?.phoneSample || selectedPhone || t("Phone")}
                      value={invoice.businessDetails.phone}
                      onChange={e => handlePhoneChange("businessDetails", e.target.value)}
                      maxLength={COUNTRIES.find(c => c.dialCode === invoice.businessDetails.dialCode)?.phoneLength || 15}
                    />
                  </div>
                </div>
                <textarea
                  className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                  placeholder={t("Address")}
                  rows={2}
                  value={invoice.businessDetails.address}
                  onChange={e => setInvoice(prev => ({ ...prev, businessDetails: { ...prev.businessDetails, address: e.target.value } }))}
                />
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-outline-variant/30 rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors">
                  {logo ? (
                    <img src={logo} alt="Logo" className="h-20 object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="text-on-surface-variant mb-1" size={24} />
                      <span className="text-xs font-bold text-on-surface-variant">{t("Upload Company Logo")}</span>
                    </>
                  )}
                  <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                </label>
              </div>
            </section>

            {/* 2. Client Information */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-primary" size={24} />
                <h2 className="text-lg font-bold font-headline">{docType.type === 'receipt' ? t("Customer Information") : docType.type === 'quotation' || docType.type === 'estimate' ? t("Recipient Information") : t("Client Information")}</h2>
              </div>
              <div className="space-y-4">
                <input
                  className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                  placeholder={docType.type === 'receipt' ? t("Customer Name") : docType.type === 'quotation' || docType.type === 'estimate' ? t("Recipient Name") : t("Client Name")}
                  value={invoice.clientDetails.name}
                  onChange={e => setInvoice(prev => ({ ...prev, clientDetails: { ...prev.clientDetails, name: e.target.value } }))}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                    placeholder={t("Client Email")}
                    value={invoice.clientDetails.email}
                    onChange={e => setInvoice(prev => ({ ...prev, clientDetails: { ...prev.clientDetails, email: e.target.value } }))}
                  />
                  <div className="flex gap-2">
                    <select
                      className="w-28 flex-shrink-0 bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm font-bold appearance-none cursor-pointer hover:bg-zinc-100 transition-colors"
                      value={invoice.clientDetails.dialCode || ""}
                      onChange={e => handleDialCodeChange("clientDetails", e.target.value)}
                    >
                      {COUNTRIES.map(c => <option key={c.name} value={c.dialCode}>{c.isoCode.toUpperCase()} ({c.dialCode})</option>)}
                    </select>
                    <input
                      className="flex-1 min-w-0 bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                      placeholder={COUNTRIES.find(c => c.dialCode === invoice.clientDetails.dialCode)?.phoneSample || selectedPhone || (docType.type === 'receipt' ? t("Customer Phone") : t("Client Phone"))}
                      value={invoice.clientDetails.phone}
                      onChange={e => handlePhoneChange("clientDetails", e.target.value)}
                      maxLength={COUNTRIES.find(c => c.dialCode === invoice.clientDetails.dialCode)?.phoneLength || 15}
                    />
                  </div>

                </div>
                <textarea
                  className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                  placeholder={docType.type === 'receipt' ? t("Customer Address") : docType.type === 'quotation' || docType.type === 'estimate' ? t("Recipient Address") : t("Client Address")}
                  rows={2}
                  value={invoice.clientDetails.address}
                  onChange={e => setInvoice(prev => ({ ...prev, clientDetails: { ...prev.clientDetails, address: e.target.value } }))}
                />
              </div>
            </section>

            {/* Document Options Sidebar Toggles (moved to form for better UX) */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="text-zinc-900" size={24} />
                <h2 className="text-lg font-bold font-headline">{t("Advanced Settings")}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200 group">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm", showTax ? "bg-zinc-900 text-white" : "bg-white text-zinc-400 border border-zinc-200")}>
                      <Percent size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold block">{t("Show Tax")}</span>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black leading-none">{showTax ? t("Enabled") : t("Disabled")}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={showTax}
                    onChange={e => setShowTax(e.target.checked)}
                  />
                  <div className={cn("w-10 h-5 rounded-full relative transition-all shadow-inner", showTax ? "bg-zinc-900" : "bg-zinc-200")}>
                    <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm", showTax ? "left-6" : "left-1")} />
                  </div>
                </label>

              </div>
            </section>

            {/* 3. Invoice Details */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-primary" size={24} />
                <h2 className="text-lg font-bold font-headline">{docType.title} {t("Details")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{docType.title} #</label>
                  <input
                    className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                    value={invoice.invoiceNumber}
                    onChange={e => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Issue Date")}</label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                    value={invoice.issueDate}
                    onChange={e => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>

                {/* Receipt Specific Fields */}
                {docType.type === 'receipt' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Payment Method")}</label>
                      <select
                        className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                        value={invoice.paymentMethod || ""}
                        onChange={e => setInvoice(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      >
                        <option value="">{t("Select Method")}</option>
                        <option value="Cash">{t("Cash")}</option>
                        <option value="Bank Transfer">{t("Bank Transfer")}</option>
                        <option value="Credit Card">{t("Credit Card")}</option>
                        <option value="UPI">{t("UPI")}</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Quotation / Estimate Specific Fields */}
                {(docType.type === 'quotation' || docType.type === 'estimate') && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{docType.type === 'quotation' ? t("Valid Until") : t("Timeframe")}</label>
                      <input
                        className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                        placeholder={docType.type === 'quotation' ? "30 Days" : "2 Weeks"}
                        value={docType.type === 'quotation' ? (invoice.validityPeriod || "") : (invoice.timeframe || "")}
                        onChange={e => setInvoice(prev => ({ ...prev, [docType.type === 'quotation' ? 'validityPeriod' : 'timeframe']: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Expected Start Date")}</label>
                      <input
                        type="date"
                        className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                        value={invoice.expectedStartDate || ""}
                        onChange={e => setInvoice(prev => ({ ...prev, expectedStartDate: e.target.value }))}
                      />
                    </div>
                  </>
                )}
                {docType.type !== 'receipt' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Due Date")}</label>
                    <input
                      type="date"
                      className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                      value={invoice.dueDate}
                      onChange={e => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* 4. Items Table */}
            <section className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <List className="text-primary" size={24} />
                  <h2 className="text-lg font-bold font-headline">{t("Items & Services")}</h2>
                </div>
                <button
                  onClick={addItem}
                  className="text-xs font-bold uppercase tracking-widest text-primary hover:opacity-70 flex items-center gap-1"
                >
                  <Plus size={14} /> {t("Add Item")}
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-4">
                  {invoice.items.map((item, idx) => (
                    <div key={item.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-3 items-start md:items-center p-5 md:p-4 bg-surface-container-low rounded-xl relative group border border-zinc-100 md:border-transparent">
                      <div className="w-full md:col-span-6">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">{t("Description")}</label>
                        <input
                          className="w-full bg-white border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 rounded-xl p-3 text-sm font-bold"
                          placeholder={t("Item description...")}
                          value={item.description}
                          onChange={e => updateItem(item.id, "description", e.target.value)}
                        />
                      </div>

                      <div className="flex w-full gap-3 md:contents">
                        <div className="flex-1 md:col-span-2">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">{t("Qty")}</label>
                          <input
                            type="number"
                            min="0"
                            className="w-full bg-white border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 rounded-xl p-3 text-sm font-bold text-center"
                            placeholder="0"
                            value={item.quantity || ""}
                            onChange={e => updateItem(item.id, "quantity", Math.max(0, parseFloat(e.target.value) || 0))}
                          />
                        </div>
                        <div className="flex-[2] md:col-span-3">
                          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1.5 ml-1">{t("Price")}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">{currencySymbol}</span>
                            <input
                              type="number"
                              min="0"
                              className="w-full bg-white border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 rounded-xl p-3 pl-8 text-sm font-bold text-right"
                              placeholder="0"
                              value={item.price || ""}
                              step="0.01"
                              onChange={e => updateItem(item.id, "price", Math.max(0, parseFloat(e.target.value) || 0))}
                            />
                          </div>
                        </div>
                        <div className="flex shrink-0 items-end justify-end md:col-span-1 pt-6 md:pt-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-3 text-error hover:bg-error/10 rounded-xl transition-all border border-error/10 md:border-transparent"
                            title={t("Remove Item")}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Totals Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="text-primary" size={24} />
                <h2 className="text-lg font-bold font-headline">{t("Totals Section")}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Discount (%)")}</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 pl-10 text-sm"
                      placeholder="0"
                      value={invoice.discount || ""}
                      onChange={e => setInvoice(prev => ({ ...prev, discount: Math.max(0, parseFloat(e.target.value) || 0) }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Shipping")}</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                    placeholder="0"
                    value={invoice.shipping || ""}
                    onChange={e => setInvoice(prev => ({ ...prev, shipping: Math.max(0, parseFloat(e.target.value) || 0) }))}
                  />
                </div>
                {showTax && (
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1 ml-1">{t("Tax Rate (%)")}</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                      <input
                        type="number"
                        min="0"
                        className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 pl-10 text-sm"
                        placeholder="0"
                        value={invoice.taxRate || ""}
                        onChange={e => setInvoice(prev => ({ ...prev, taxRate: Math.max(0, parseFloat(e.target.value) || 0) }))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 6. Notes */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined notranslate text-primary">note</span>
                <h2 className="text-lg font-bold font-headline">{t("Notes")}</h2>
              </div>
              <textarea
                className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                rows={3}
                placeholder={t("Additional notes for the client...")}
                value={invoice.notes}
                onChange={e => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
              />
            </section>

            {/* 7. Terms & Conditions */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex items-center gap-3 mb-6">
                <Gavel className="text-primary" size={24} />
                <h2 className="text-lg font-bold font-headline">{t("Terms & Conditions")}</h2>
              </div>
              <textarea
                className="w-full bg-surface-container-low border-transparent focus:border-outline-variant focus:ring-0 rounded-lg p-3 text-sm"
                rows={3}
                placeholder={t("Payment terms, cancellation policy, etc...")}
                value={invoice.terms}
                onChange={e => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
              />
            </section>




            {/* Signature Section */}
            <section className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant/10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <PenTool className="text-primary" size={24} />
                <h2 className="text-lg font-bold font-headline">{t("Signature")}</h2>
              </div>
              <div>
                <SignaturePad
                  initialSignature={signature}
                  onSave={(data) => {
                    setSignature(data);
                    setInvoice(prev => ({ ...prev, signature: data || undefined }));
                  }}
                />
              </div>
            </section>

          </div>

          {/* Preview Panel (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-32 h-fit space-y-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold font-headline">{t("Live Preview")}</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  disabled={!hasMinimalContent}
                  className="p-2 bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  title={hasMinimalContent ? t("PDF") : t("Fill form to download")}
                >
                  <Download size={18} />
                </button>

              </div>
            </div>
            {/* Preview: responsive scale using ResizeObserver */}
            <div
              className={cn(
                "w-full rounded-xl shadow-lg border border-zinc-100 overflow-hidden",
                lockEnglish && "notranslate"
              )}
              ref={previewContainerRef}
              data-preview-container
              style={{ position: 'relative' }}
            >
              <div
                ref={previewRef}
                data-preview-inner
                style={{
                  transformOrigin: 'top left',
                  width: '794px',
                  position: 'relative',
                }}
              >
                <InvoiceTemplate
                  invoice={invoice}
                  logo={logo}
                  currencySymbol={currencySymbol}
                  showTax={showTax}
                  tInvoice={tInvoice}
                  includeWatermark={false}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden lg:flex flex-col gap-3 w-full">
              <div className="flex gap-3 w-full">
                <button
                  onClick={downloadPDF}
                  disabled={!hasMinimalContent}
                  className="flex-1 flex items-center justify-center gap-3 bg-zinc-900 text-white py-3.5 px-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10 hover:bg-zinc-800"
                >
                  <Download size={18} className="shrink-0" />
                  <span className="text-xs">{t("Download PDF")}</span>
                </button>
                {user && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-3 bg-primary text-white py-3.5 px-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-primary/10 hover:bg-primary/90"
                  >
                    {isSaving ? <span className="animate-spin text-sm shrink-0">...</span> : <Save size={18} className="shrink-0" />}
                    <span className="text-xs leading-tight text-center">{t("Save Progress")}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Summary & Settings Panel (Desktop) */}
            <div className="hidden lg:grid grid-cols-1 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                <h2 className="text-xl font-black font-headline tracking-tight mb-6">{t("Summary")}</h2>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-medium">{t("Subtotal")}</span>
                    <span className="font-bold text-zinc-900">{currencySymbol} {invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {showTax && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-medium">{t("Tax")} ({invoice.taxRate}%)</span>
                      <span className="font-bold text-zinc-900">{currencySymbol} {invoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.shipping > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-medium">{t("Shipping")}</span>
                      <span className="font-bold text-zinc-900">{currencySymbol} {invoice.shipping.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div className="flex justify-between items-center text-error">
                      <span className="font-medium">{t("Discount")} ({invoice.discount}%)</span>
                      <span className="font-bold">-{currencySymbol} {((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-5 border-t border-zinc-100 mt-2">
                    <span className="font-black text-xs uppercase tracking-widest text-zinc-400">{t("Total Amount")}</span>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-2xl text-zinc-900">{currencySymbol} {invoice.total.toFixed(2)}</span>
                      {exchangeRate !== 1 && (
                        <span className="text-[10px] font-bold text-primary mt-1 bg-primary/5 px-2 py-0.5 rounded-full">
                          ≈ {targetCurrencySymbol} {(invoice.total * exchangeRate).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                <h2 className="text-xs font-black uppercase tracking-widest mb-6 text-zinc-400">{t("Configuration")}</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t("Color Theme")}</label>
                    <div className="flex flex-wrap gap-2.5 mb-6">
                      {[
                        { id: "onyx", color: "#18181b", label: "Midnight Onyx" },
                        { id: "navy-grad", color: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", label: "Navy Gradient" },
                        { id: "emerald-grad", color: "linear-gradient(135deg, #064e3b 0%, #059669 100%)", label: "Emerald Gradient" },
                        { id: "slate-grad", color: "linear-gradient(135deg, #1e293b 0%, #334155 100%)", label: "Slate Gradient" },
                        { id: "ruby-grad", color: "linear-gradient(135deg, #4c0519 0%, #881337 100%)", label: "Ruby Gradient" },
                        { id: "gold-grad", color: "linear-gradient(135deg, #78350f 0%, #92400e 100%)", label: "Amber Gradient" },
                      ].map(tc => (
                        <button
                          key={tc.id}
                          onClick={() => setInvoice(prev => ({ ...prev, themeColor: tc.color }))}
                          title={tc.label}
                          className={cn(
                            "w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm",
                            invoice.themeColor === tc.color ? "border-zinc-900 ring-2 ring-zinc-100" : "border-transparent"
                          )}
                          style={{ background: tc.color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t("Template Style")}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TEMPLATES.filter(t => t.id !== 'creative').map(t => (
                        <button
                          key={t.id}
                          onClick={() => setInvoice(prev => ({ ...prev, template: t.id as any }))}
                          className={cn(
                            "py-2.5 px-3 text-[10px] font-black uppercase tracking-tight rounded-xl border-2 transition-all",
                            invoice.template === t.id
                              ? "border-zinc-900 bg-zinc-900 text-white"
                              : "border-zinc-100 hover:border-zinc-200 text-zinc-500"
                          )}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t("Currency")}</label>
                    <select
                      className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 rounded-xl p-3 text-xs font-bold text-zinc-900 transition-all"
                      value={invoice.currency}
                      onChange={e => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
                    >
                      {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Action Buttons (Below Form) */}
        <div className="lg:hidden flex flex-col gap-3 mt-8">
          <button
            onClick={downloadPDF}
            disabled={!hasMinimalContent}
            className="w-full flex items-center justify-center gap-3 bg-zinc-900 text-white py-4 px-4 rounded-2xl font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/10"
          >
            <Download size={18} className="shrink-0" />
            <span className="text-sm">{t("Download PDF")}</span>
          </button>
          {user && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-3 bg-primary text-white py-4 px-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-xl shadow-primary/10"
            >
              {isSaving ? <span className="animate-spin text-sm shrink-0">...</span> : <Save size={18} className="shrink-0" />}
              <span className="text-sm leading-tight text-center">{t("Save Progress")}</span>
            </button>
          )}
        </div>

        {/* Mobile/Tablet Summary & Settings (Below Form) */}
        <div className="lg:hidden space-y-6 mt-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <h2 className="text-xl font-black font-headline tracking-tight mb-6">{t("Summary")}</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">{t("Subtotal")}</span>
                <span className="font-bold text-zinc-900">{currencySymbol} {invoice.subtotal.toFixed(2)}</span>
              </div>
              {showTax && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">{t("Tax")} ({invoice.taxRate}%)</span>
                  <span className="font-bold text-zinc-900">{currencySymbol} {invoice.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {invoice.shipping > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">{t("Shipping")}</span>
                  <span className="font-bold text-zinc-900">{currencySymbol} {invoice.shipping.toFixed(2)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between items-center text-error">
                  <span className="font-medium">{t("Discount")} ({invoice.discount}%)</span>
                  <span className="font-bold">-{currencySymbol} {((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-5 border-t border-zinc-100 mt-2">
                <span className="font-black text-xs uppercase tracking-widest text-zinc-400">{t("Total Amount")}</span>
                <span className="font-black text-2xl text-zinc-900">{currencySymbol} {invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 text-zinc-400">{t("Configuration")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t("Color Theme")}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "onyx", color: "#18181b", label: "Midnight Onyx" },
                      { id: "emerald", color: "#059669", label: "Emerald Green" },
                      { id: "sapphire", color: "#2563eb", label: "Sapphire Blue" },
                      { id: "ruby", color: "#e11d48", label: "Ruby Red" },
                      { id: "gold", color: "#D4AF37", label: "Royal Gold" },
                      { id: "purple", color: "#9333ea", label: "Vibrant Purple" },
                    ].map(tc => (
                      <button
                        key={tc.id}
                        onClick={() => setInvoice(prev => ({ ...prev, themeColor: tc.color }))}
                        title={tc.label}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                          invoice.themeColor === tc.color ? "border-zinc-900 ring-2 ring-zinc-100" : "border-transparent"
                        )}
                        style={{ backgroundColor: tc.color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t("Template Style")}</label>

                  <div className="grid grid-cols-3 gap-2">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setInvoice(prev => ({ ...prev, template: t.id as any }))}
                        className={cn(
                          "py-2.5 px-3 text-[10px] font-black uppercase tracking-tight rounded-xl border-2 transition-all",
                          invoice.template === t.id
                            ? "border-zinc-900 bg-zinc-900 text-white"
                            : "border-zinc-100 hover:border-zinc-200 text-zinc-500"
                        )}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">{t("Currency")}</label>
                  <select
                    className="w-full bg-zinc-50 border-2 border-zinc-100 focus:border-zinc-900 focus:ring-0 rounded-xl p-3 text-xs font-bold text-zinc-900 transition-all"
                    value={invoice.currency}
                    onChange={e => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
                  >
                    {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Preview Modal for Mobile/Tablet */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-[100] bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center p-4 lg:hidden">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100">
              <h3 className="font-bold font-headline text-lg">{t("Invoice Preview")}</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 bg-zinc-50 flex justify-center min-h-0">
              <div className="origin-top transform scale-[0.42] xs:scale-[0.48] sm:scale-[0.60] md:scale-[0.85] w-full flex justify-center p-0" data-preview-container>
                <div ref={mobilePreviewRef} data-preview-inner className="w-[794px] bg-white shadow-2xl shrink-0">
                  <InvoiceTemplate
                    invoice={invoice}
                    logo={logo}
                    currencySymbol={currencySymbol}
                    showTax={showTax}
                    tInvoice={tInvoice} includeWatermark={false} />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 flex gap-4">
              <button
                onClick={downloadPDF}
                disabled={!hasMinimalContent}
                className="flex-[2] flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 active:scale-95 disabled:bg-zinc-100 disabled:text-zinc-400"
              >
                <Download size={18} /> {hasMinimalContent ? t("Download PDF") : t("Fill form")}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* SEO Optimized Content Section (Visible to Google, Clean for Users) */}
      <div className="mt-10 md:mt-20 border-t border-zinc-100 pt-8 md:pt-16 max-w-4xl mx-auto space-y-8 md:space-y-12 pb-10 md:pb-20 px-3 sm:px-6 md:px-0">
        <section>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-headline tracking-tighter mb-3 md:mb-6">{t("World's #1 Free Global Invoice Generator")}</h2>
          <p className="text-sm text-zinc-600 leading-relaxed mb-4">
            Welcome to the most advanced <strong>free invoice generator</strong> designed for the 2026 global economy.
            Whether you are a freelancer in India needing a <strong>GST invoice</strong>, or a startup in the US requiring
            professional <strong>online invoice PDF</strong> downloads, INVOXA is built for you. Our tool is
            completely free forever, ensuring you can manage your billing without any overhead.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold font-headline">{t("Free Invoice Templates 2026")}</h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              We provide access to high-fidelity <strong>invoice templates</strong> that are pre-configured for modern business standards.
              Each template is fully responsive, ensuring your clients can view your professional quotes or receipts on any device.
            </p>
          </section>
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg md:text-xl font-bold font-headline">{t("Global Currency & Tax Support")}</h3>
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
              INVOXA supports 50+ currencies including USD, EUR, INR, and GBP. Automatic tax calculations handle
              everything from VAT to GST smoothly, making it the perfect <strong>online billing software</strong>
              alternative for international contractors.
            </p>
          </section>
        </div>

        <section className="bg-zinc-50 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-zinc-100">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter mb-5 md:mb-8 font-headline">{t("Frequently Asked Questions (FAQ)")}</h2>
          <div className="space-y-5 md:space-y-8">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5 md:mb-2">{t("Is INVOXA really a free invoice generator?")}</h4>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Yes, INVOXA provides unlimited <strong>free invoice creation</strong> with no hidden costs, no mandatory signups, and NO CAPTCHA for downloads. You can create, download, and share as many invoices as you need.</p>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5 md:mb-2">{t("How do I save my invoices securely?")}</h4>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">INVOXA uses a secure <strong>Cloud Sync</strong> system. By creating a free account, all your invoices, client details, and business settings are instantly synced to our encrypted <strong>Firebase Firestore</strong> database, allowing you to access your billing data from any device in the world safely.</p>
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-900 mb-1.5 md:mb-2">{t("Can I generate a GST compliant invoice for India?")}</h4>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">Absolutely. By selecting India as your country, the system automatically enables <strong>GST invoice</strong> fields, allowing you to enter your Tax ID and calculate taxes according to Indian regulations with 100% accuracy.</p>
            </div>
          </div>
        </section>

        {/* Structured Data for SEO (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "Is this a free invoice generator?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, INVOXA is a professional-grade free invoice generator with unlimited PDF downloads and 100% accurate tax calculations."
              }
            }, {
              "@type": "Question",
              "name": "Does it support GST for India?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, INVOXA is fully optimized for GST Indian invoice generation with localized tax formatting and HSN support."
              }
            }]
          })}
        </script>
      </div>

      {/* Off-Screen Capture Area (Never Visible to User, Used for High-Quality PDF/Image Generation) */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "794px",
          overflow: "visible",
          pointerEvents: "none"
        }}
      >
        <div ref={captureRef} data-pdf-capture className="bg-white shadow-none border-none">
          <InvoiceTemplate
            invoice={invoice}
            logo={logo}
            currencySymbol={currencySymbol}
            showTax={showTax}
            tInvoice={tInvoice}
            isPDF={true}
            includeWatermark={false}
          />
        </div>
      </div>
    </div>
  );
}
