import React from "react";
import { useTranslation } from "react-i18next";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "../lib/utils";
import { COUNTRIES } from "../constants/countries";
import { Invoice } from "../types/invoice";

const getFlag = (dialCode?: string) => {
  if (!dialCode) return "";
  return COUNTRIES.find(c => c.dialCode === dialCode)?.flag || "";
};

interface InvoiceTemplateProps {
  invoice: Invoice;
  logo: string | null;
  currencySymbol: string;
  showTax: boolean;
  includeWatermark: boolean;
  isPDF?: boolean;
  tInvoice: (key: string) => string;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  logo,
  currencySymbol,
  showTax,
  includeWatermark,
  isPDF = false,
  tInvoice,
}) => {
  const { t } = useTranslation();

  const themeColor = invoice.themeColor || "#18181b";

  // Extract first hex color from themeColor (handles both plain hex and gradient strings)
  const extractFirstHex = (colorStr: string): string => {
    const match = colorStr.match(/#([a-f\d]{6}|[a-f\d]{3})\b/i);
    return match ? match[0] : "#18181b";
  };
  const baseHex = extractFirstHex(themeColor);

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    const full = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
    return {
      r: parseInt(full.substring(0, 2), 16),
      g: parseInt(full.substring(2, 4), 16),
      b: parseInt(full.substring(4, 6), 16),
    };
  };
  const { r, g, b } = hexToRgb(baseHex);

  // 30% theme color + 70% white = clearly visible tint on invoice background
  const pr = Math.round(r * 0.30 + 255 * 0.70);
  const pg = Math.round(g * 0.30 + 255 * 0.70);
  const pb = Math.round(b * 0.30 + 255 * 0.70);
  const pastelBg = `rgb(${pr}, ${pg}, ${pb})`;


  const docType = {
    title: tInvoice(invoice.type.charAt(0).toUpperCase() + invoice.type.slice(1)),
    color: "text-zinc-900", // Fallback, will apply style where needed
    bg: "bg-zinc-900",
    badge: invoice.type === "receipt" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
      invoice.type === "quotation" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
        invoice.type === "estimate" ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-zinc-50 text-zinc-700 border-zinc-100",
    stamp: invoice.type === "receipt" ? "PAID" :
      invoice.type === "quotation" ? "QUOTATION" :
        invoice.type === "estimate" ? "ESTIMATE" : null
  };


  const dateLabels = {
    issue: invoice.type === "receipt" ? tInvoice("Payment Date") :
      invoice.type === "quotation" ? tInvoice("Quote Date") :
        invoice.type === "estimate" ? tInvoice("Estimate Date") : tInvoice("Invoice Date"),
    due: invoice.type === "receipt" ? null :
      invoice.type === "quotation" ? tInvoice("Valid Until") :
        invoice.type === "estimate" ? tInvoice("Expiry Date") : tInvoice("Due Date")
  };

  return (
    <div
      className="shadow-xl rounded-sm pb-10 p-10 flex flex-col relative overflow-hidden w-[794px] mx-auto break-words antialiased text-zinc-900"
      id="invoice-preview"
      style={{
        width: '794px',
        backgroundColor: pastelBg,
        minHeight: '1122px'
      }}
    >

      {/* Watermark */}
      {includeWatermark && invoice.businessDetails.name && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none">
          <span className="text-9xl font-black tracking-widest">{invoice.businessDetails.name}</span>
        </div>
      )}



      {/* Template: Modern */}
      {invoice.template === "modern" && (
        <div className="flex flex-col flex-grow relative z-10 w-full">
          <div className="flex justify-between items-start mb-16 pb-12" style={{ borderBottom: `4px solid ${themeColor}` }}>
            <div className="flex flex-col gap-10 max-w-[45%]">
              {logo ? (
                <img src={logo} alt="Logo" className="h-20 w-fit object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-3xl font-black" style={{ background: themeColor }}>
                  {invoice.businessDetails.name ? invoice.businessDetails.name.charAt(0) : "I"}
                </div>
              )}
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-2 truncate">{tInvoice("Bill From")}</p>
                <h3 className={cn("font-black text-2xl tracking-tighter uppercase leading-none text-zinc-900 break-words [hyphens:auto]", !invoice.businessDetails.name && "text-zinc-700 italic")}>
                  {invoice.businessDetails.name || tInvoice("Company Name")}
                </h3>
                <p className={cn("text-xs leading-relaxed font-bold uppercase tracking-widest max-w-sm pt-2 break-words", !invoice.businessDetails.address ? "text-zinc-600 italic" : "text-zinc-700")}>
                  {invoice.businessDetails.address || tInvoice("Address")}
                </p>
                <div className="flex flex-col gap-1 pt-3 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest shrink-0">E:</span>
                    <span className={cn("text-[10px] font-bold truncate", !invoice.businessDetails.email ? "text-zinc-600 italic" : "text-zinc-700")}>
                      {invoice.businessDetails.email || tInvoice("Email")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest shrink-0">T:</span>
                    <span className={cn("text-[10px] font-bold truncate", !invoice.businessDetails.phone ? "text-zinc-600 italic" : "text-zinc-700")}>
                      {getFlag(invoice.businessDetails.dialCode)} {invoice.businessDetails.dialCode} {invoice.businessDetails.phone || tInvoice("Phone")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end flex-grow">
              <div className="relative mb-12">
                <h2 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase relative">
                  #{invoice.invoiceNumber}
                </h2>
                <p className="text-[9px] font-black uppercase text-zinc-700 tracking-[0.3em] mt-2">{docType.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-12 w-full max-w-sm mt-8 text-left">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-4 truncate">{tInvoice("Bill To")}</p>
                  <h5 className={cn("font-black text-lg uppercase tracking-tighter leading-none mb-2 text-zinc-900 break-words [hyphens:auto]", !invoice.clientDetails.name && "text-zinc-700 italic")}>
                    {invoice.clientDetails.name || tInvoice("Client Name")}
                  </h5>
                  <p className={cn("text-xs leading-relaxed font-medium break-words", !invoice.clientDetails.address ? "text-zinc-600 italic" : "text-zinc-600")}>
                    {invoice.clientDetails.address || tInvoice("Client Address")}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-4 min-w-0">
                    <p className={cn("text-xs font-bold truncate", !invoice.clientDetails.email ? "text-zinc-600 italic" : "text-zinc-800")}>
                      {invoice.clientDetails.email || tInvoice("Client Email")}
                    </p>
                    <p className={cn("text-xs font-bold truncate", !invoice.clientDetails.phone ? "text-zinc-600 italic" : "text-zinc-800")}>
                      {getFlag(invoice.clientDetails.dialCode)} {invoice.clientDetails.dialCode} {invoice.clientDetails.phone || tInvoice("Client Phone")}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-l-2 border-zinc-300 pl-4">
                    <p className="text-[9px] font-black uppercase text-zinc-700 tracking-widest mb-1">{dateLabels.issue}</p>
                    <p className="text-xs font-black text-zinc-900">{invoice.issueDate}</p>
                  </div>
                  {dateLabels.due && (
                    <div className="border-l-2 border-zinc-300 pl-4">
                      <p className="text-[9px] font-black uppercase text-zinc-700 tracking-widest mb-1">{dateLabels.due}</p>
                      <p className="text-xs font-black text-red-600">{invoice.dueDate}</p>
                    </div>
                  )}
                  {invoice.type === 'receipt' && invoice.paymentMethod && (
                    <div className="border-l-2 border-emerald-500 pl-4">
                      <p className="text-[9px] font-black uppercase text-emerald-700 tracking-widest mb-1">{tInvoice("Payment Method")}</p>
                      <p className="text-xs font-black text-emerald-700">{invoice.paymentMethod}</p>
                    </div>
                  )}
                  <div className="p-4 rounded-lg text-white" style={{ background: themeColor }}>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-1">{tInvoice("Total Amount")}</p>
                    <p className="text-xl font-black tracking-tighter tabular-nums">
                      {currencySymbol}{invoice.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow mb-12">
            <div className="rounded-2xl overflow-hidden border border-zinc-200/60 shadow-sm">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: `rgba(${r},${g},${b},0.12)`, borderBottom: `2px solid rgba(${r},${g},${b},0.25)` }}>
                    <th className="py-4 px-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest w-[10%] text-left whitespace-nowrap">#</th>
                    <th className="py-4 px-2 text-[9px] font-black text-zinc-800 uppercase tracking-widest w-[42%] break-words leading-tight">{tInvoice("Description of Goods / Services")}</th>
                    <th className="py-4 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-center w-[10%] break-words leading-tight">{tInvoice("Qty")}</th>
                    <th className="py-4 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-right w-[18%] break-words leading-tight">{tInvoice("Unit Price")}</th>
                    <th className="py-4 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-right w-[20%] break-words leading-tight">{tInvoice("Total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} className="group hover:bg-zinc-50 transition-colors" style={{ backgroundColor: 'white' }}>
                      <td className="py-4 px-4 text-xs font-black text-zinc-700 tabular-nums whitespace-nowrap">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-4 px-2">
                        <p className={cn("text-sm font-bold leading-tight", !item.description && "text-zinc-600 italic")}>
                          {item.description || tInvoice("Item description...")}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-sm font-bold text-zinc-600 text-center tabular-nums">{item.quantity}</td>
                      <td className="py-4 px-4 text-sm font-bold text-zinc-600 text-right tabular-nums whitespace-nowrap">{currencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-4 px-4 text-sm font-black text-zinc-900 text-right tabular-nums whitespace-nowrap">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-7 bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
              <div className="space-y-8">

                <div className="grid grid-cols-2 gap-8 pt-4">
                  {invoice.notes && (
                    <div>
                      <h6 className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mb-2">{tInvoice("Bank / UPI Payment")}</h6>
                      <div className="text-[10px] text-zinc-600 leading-relaxed font-bold whitespace-pre-wrap line-clamp-4 overflow-hidden">
                        {invoice.notes}
                      </div>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h6 className="text-[9px] font-black uppercase text-zinc-600 tracking-widest mb-2">{tInvoice("Terms & Conditions")}</h6>
                      <p className="text-[10px] text-zinc-700 leading-relaxed font-medium line-clamp-4 overflow-hidden">{invoice.terms}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 flex justify-start">
                <div className="w-48 relative border-b-2 border-zinc-200 pb-2 text-center">
                  {invoice.signature && (
                    <div className="absolute left-0 right-0 -top-20 flex justify-center">
                      <img src={invoice.signature} className="h-24 mix-blend-multiply opacity-80 object-contain pointer-events-none" />
                    </div>
                  )}
                  <p className="text-[9px] font-black uppercase text-zinc-600 tracking-widest italic">{tInvoice("Authorized Signatory")}</p>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 p-8 bg-zinc-900 rounded-[2.5rem] shadow-2xl text-white">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-700">
                  <span>{tInvoice("Subtotal")}</span>
                  <span className="text-zinc-200">{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
                </div>
                {showTax && (
                  <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-700">
                    <span>{tInvoice("Tax Amount")} ({invoice.taxRate}%)</span>
                    <span className="text-zinc-200">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-700">
                    <span>{tInvoice("Shipping")}</span>
                    <span className="text-zinc-200">{currencySymbol}{invoice.shipping.toFixed(2)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-red-400">
                    <span>{tInvoice("Discount")} ({invoice.discount}%)</span>
                    <span>-{currencySymbol}{((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="h-px bg-zinc-800 my-4" />
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1">{tInvoice("Invoice Grand Total")}</span>
                    <span className="text-4xl font-black tracking-tighter">{currencySymbol}{invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template: Professional */}
      {invoice.template === "professional" && (
        <>
          <div className="flex justify-between items-start mb-20 relative z-10">
            <div className="p-10 rounded-br-[3rem] -ml-14 -mt-14 pr-24 shadow-xl text-white flex flex-col gap-1 items-start" style={{ background: themeColor }}>
              <h4 className="text-5xl font-black tracking-tighter uppercase">{docType.title}</h4>
              <p className="text-sm opacity-70 mt-3 font-medium tracking-widest">NO. {invoice.invoiceNumber}</p>
            </div>

            <div className="text-right pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 mb-2">{tInvoice("Bill From")}</p>
              {logo && <img src={logo} alt="Logo" className="h-24 w-fit ml-auto mb-4 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />}
              <h3 className={cn("font-bold text-2xl tracking-tight text-zinc-900", !invoice.businessDetails.name && "text-zinc-700 italic")}>
                {invoice.businessDetails.name || tInvoice("Company Name")}
              </h3>
              <p className={cn("text-sm", !invoice.businessDetails.address ? "text-zinc-600 italic" : "text-zinc-700")}>
                {invoice.businessDetails.address || tInvoice("Address")}
              </p>
              <div className="flex flex-col items-end gap-0.5 mt-2">
                <span className={cn("text-xs font-medium", !invoice.businessDetails.email ? "text-zinc-600 italic" : "text-zinc-600")}>
                  {invoice.businessDetails.email || tInvoice("Email")}
                </span>
                <span className={cn("text-xs font-bold", !invoice.businessDetails.phone ? "text-zinc-600 italic" : "text-zinc-700")}>
                  {getFlag(invoice.businessDetails.dialCode)} {invoice.businessDetails.dialCode} {invoice.businessDetails.phone || tInvoice("Phone")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-20 relative z-10">
            {/* Bill To Card */}
            <div className="pl-6 py-5 pr-5 bg-white rounded-2xl shadow-md" style={{ borderLeft: `5px solid ${themeColor}` }}>
              <p className="text-[10px] font-black uppercase text-zinc-700 mb-3 tracking-widest">{tInvoice("Bill To")}</p>
              <h5 className={cn("font-black text-xl tracking-tight text-zinc-900", !invoice.clientDetails.name && "text-zinc-700 italic")}>
                {invoice.clientDetails.name || tInvoice("Client Name")}
              </h5>
              <p className={cn("text-sm mt-1.5", !invoice.clientDetails.address ? "text-zinc-600 italic" : "text-zinc-600")}>
                {invoice.clientDetails.address || tInvoice("Client Address")}
              </p>
              <div className="flex flex-col gap-1 mt-3">
                <p className={cn("text-xs font-medium", !invoice.clientDetails.email ? "text-zinc-600 italic" : "text-zinc-600")}>
                  {invoice.clientDetails.email || tInvoice("Client Email")}
                </p>
                <p className={cn("text-xs font-bold", !invoice.clientDetails.phone ? "text-zinc-600 italic" : "text-zinc-800")}>
                  {getFlag(invoice.clientDetails.dialCode)} {invoice.clientDetails.dialCode} {invoice.clientDetails.phone || tInvoice("Client Phone")}
                </p>
              </div>
            </div>

            {/* Details Card */}
            <div className="text-right bg-white p-5 rounded-2xl shadow-md" style={{ borderTop: `4px solid ${themeColor}` }}>
              <p className="text-[10px] font-black uppercase text-zinc-600 mb-3 tracking-widest">{tInvoice("Details")}</p>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-600">{dateLabels.issue}: <strong className="text-zinc-900">{invoice.issueDate}</strong></p>
                {dateLabels.due && <p className="text-zinc-600">{dateLabels.due}: <strong className="text-red-600">{invoice.dueDate}</strong></p>}
                {invoice.paymentMethod && <p className="text-zinc-600">{tInvoice("Method")}: <strong className="text-zinc-900">{invoice.paymentMethod}</strong></p>}
                {invoice.validityPeriod && <p className="text-zinc-600">{tInvoice("Valid")}: <strong className="text-zinc-900">{invoice.validityPeriod}</strong></p>}
                {invoice.expectedStartDate && <p className="text-zinc-600">{tInvoice("Starts")}: <strong className="text-zinc-900">{invoice.expectedStartDate}</strong></p>}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Table Section for Professional */}
      {invoice.template === "professional" && (
        <div className="flex-grow relative z-10">
          <div className="rounded-2xl overflow-hidden border border-zinc-200/60 shadow-sm">
            <table className="w-full text-left table-fixed" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: `rgba(${r},${g},${b},0.12)`, borderBottom: `2px solid rgba(${r},${g},${b},0.25)` }}>
                  <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest w-[10%] text-zinc-700 whitespace-nowrap">#</th>
                  <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest w-[37%] text-zinc-800">{tInvoice("Description")}</th>
                  <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-center w-[15%] text-zinc-800">{tInvoice("Qty")}</th>
                  <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-right w-[18%] text-zinc-800">{tInvoice("Unit Price")}</th>
                  <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-right w-[20%] text-zinc-800">{tInvoice("Total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} style={{ backgroundColor: 'white' }}>
                    <td className="py-6 px-4 text-[10px] font-bold text-zinc-700 tabular-nums whitespace-nowrap">{String(idx + 1).padStart(2, '0')}</td>
                    <td className={cn("py-6 px-4 text-sm font-bold", !item.description && "text-zinc-600 italic")}>
                      {item.description || tInvoice("Item description...")}
                    </td>
                    <td className="py-6 px-4 text-sm text-center text-zinc-700">{item.quantity}</td>
                    <td className="py-6 px-4 text-sm text-right text-zinc-700 whitespace-nowrap">{currencySymbol} {item.price.toFixed(2)}</td>
                    <td className="py-6 px-4 text-sm text-right font-bold text-zinc-900 whitespace-nowrap">{currencySymbol} {(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Section for Professional */}
      {invoice.template === "professional" && (
        <div className="mt-12 flex justify-between items-end relative z-10">
          <div className="w-1/2">
            {invoice.notes && (
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase text-zinc-600 mb-1">{tInvoice("Notes")}</p>
                <p className="text-xs text-zinc-700">{invoice.notes}</p>
              </div>
            )}
            <div className="mt-20 flex flex-col items-start pb-8">
              <div className="w-56 relative border-b-2 border-zinc-100 pb-2">
                {invoice.signature && (
                  <div className="absolute left-0 right-0 -top-20 flex justify-center">
                    <img src={invoice.signature} className="h-32 object-contain pointer-events-none" />
                  </div>
                )}
                <p className="text-xs italic text-zinc-600 text-center tracking-wide font-black uppercase">{tInvoice("Authorized Signatory")}</p>
              </div>
            </div>
          </div>
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-zinc-700">{tInvoice("Subtotal")}</span>
              <span className="tabular-nums">{currencySymbol} {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {showTax && (
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-700">{tInvoice("Tax")} ({invoice.taxRate}%)</span>
                <span className="tabular-nums">{currencySymbol} {invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.shipping > 0 && (
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-700">{tInvoice("Shipping")}</span>
                <span className="tabular-nums">{currencySymbol} {invoice.shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-xs font-medium text-red-600">
                <span className="font-bold">{tInvoice("Discount")} ({invoice.discount}%)</span>
                <span className="tabular-nums">-{currencySymbol} {((invoice.subtotal * invoice.discount) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between p-4 rounded-xl border-t-2 mt-4 items-center" style={{ borderColor: themeColor }}>
              <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">{tInvoice("Total")}</span>
              <span className="font-black text-2xl tabular-nums tracking-tighter">{currencySymbol} {invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TEMPLATE: MINIMAL ═══ */}
      {invoice.template === "minimal" && (
        <div className="flex flex-col flex-grow relative z-10">
          {/* Top bar */}
          <div className="flex justify-between items-start mb-16">
            <div>
              {logo
                ? <img src={logo} alt="Logo" className="h-12 mb-4 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                : <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white text-lg font-black" style={{ background: themeColor }}>{invoice.businessDetails.name?.charAt(0) || "I"}</div>}
              <h3 className={cn("text-xl font-black tracking-tight text-zinc-900", !invoice.businessDetails.name && "text-zinc-600 italic")}>{invoice.businessDetails.name || tInvoice("Company Name")}</h3>
              <p className={cn("text-xs mt-1", !invoice.businessDetails.address ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.businessDetails.address || tInvoice("Address")}</p>
              <p className={cn("text-xs", !invoice.businessDetails.email ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.businessDetails.email || tInvoice("Email")}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">{docType.title}</p>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">#{invoice.invoiceNumber}</h2>
              <div className="mt-3 text-xs text-zinc-700 space-y-1">
                <p>{dateLabels.issue}: <strong className="text-zinc-900">{invoice.issueDate}</strong></p>
                {dateLabels.due && <p>{dateLabels.due}: <strong className="text-red-500">{invoice.dueDate}</strong></p>}
              </div>
            </div>
          </div>

          {/* Thin divider */}
          <div className="h-[2px] mb-10 rounded-full" style={{ background: themeColor }} />

          {/* Bill To */}
          <div className="mb-10 pl-4" style={{ borderLeft: `3px solid ${themeColor}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">{tInvoice("Bill To")}</p>
            <h5 className={cn("text-lg font-black text-zinc-900", !invoice.clientDetails.name && "text-zinc-600 italic")}>{invoice.clientDetails.name || tInvoice("Client Name")}</h5>
            <p className={cn("text-xs", !invoice.clientDetails.address ? "text-zinc-600 italic" : "text-zinc-600")}>{invoice.clientDetails.address || tInvoice("Client Address")}</p>
            <p className={cn("text-xs", !invoice.clientDetails.email ? "text-zinc-600 italic" : "text-zinc-600")}>{invoice.clientDetails.email || tInvoice("Client Email")}</p>
          </div>

          {/* Table */}
          <div className="flex-grow mb-10">
            <div className="rounded-xl overflow-hidden border border-zinc-200/80">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: themeColor }}>
                    <th className="py-3 px-4 text-[9px] font-black text-white/70 uppercase tracking-widest w-[8%]">#</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest w-[44%]">{tInvoice("Description")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest text-center w-[12%]">{tInvoice("Qty")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest text-right w-[18%]">{tInvoice("Unit Price")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest text-right w-[18%]">{tInvoice("Total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: 'white' }}>
                      <td className="py-3 px-4 text-xs text-zinc-600 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                      <td className={cn("py-3 px-4 text-sm font-semibold", !item.description && "text-zinc-600 italic")}>{item.description || tInvoice("Item description...")}</td>
                      <td className="py-3 px-4 text-sm text-center text-zinc-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-right text-zinc-600 whitespace-nowrap">{currencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right font-bold text-zinc-900 whitespace-nowrap">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Subtotal")}</span><span className="font-bold text-zinc-900">{currencySymbol}{invoice.subtotal.toFixed(2)}</span></div>
              {showTax && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Tax")} ({invoice.taxRate}%)</span><span className="font-bold text-zinc-900">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span></div>}
              {invoice.shipping > 0 && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Shipping")}</span><span className="font-bold text-zinc-900">{currencySymbol}{invoice.shipping.toFixed(2)}</span></div>}
              {invoice.discount > 0 && <div className="flex justify-between text-xs text-red-500"><span>{tInvoice("Discount")} ({invoice.discount}%)</span><span>-{currencySymbol}{((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span></div>}
              <div className="h-px bg-zinc-200 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-zinc-700">{tInvoice("Total")}</span>
                <span className="text-2xl font-black tabular-nums" style={{ color: themeColor }}>{currencySymbol}{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && <p className="text-xs text-zinc-700 mb-2"><span className="font-black uppercase text-zinc-600">{tInvoice("Notes")}: </span>{invoice.notes}</p>}
          {invoice.terms && <p className="text-xs text-zinc-700"><span className="font-black uppercase text-zinc-600">{tInvoice("Terms")}: </span>{invoice.terms}</p>}
        </div>
      )}

      {/* ═══ TEMPLATE: EXECUTIVE ═══ */}
      {invoice.template === "executive" && (
        <div className="flex flex-col flex-grow relative z-10 -mx-10 -mt-10">
          {/* Full-width dark header */}
          <div className="px-12 py-10 mb-0 text-white" style={{ background: themeColor }}>
            <div className="flex justify-between items-start">
              <div>
                {logo
                  ? <div className="mb-4 inline-block bg-white/15 rounded-xl p-2"><img src={logo} alt="Logo" className="h-12 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>
                  : <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl font-black mb-4">{invoice.businessDetails.name?.charAt(0) || "I"}</div>}
                <h3 className={cn("text-2xl font-black tracking-tight", !invoice.businessDetails.name && "opacity-50 italic")}>{invoice.businessDetails.name || tInvoice("Company Name")}</h3>
                <p className={cn("text-xs mt-1 opacity-70", !invoice.businessDetails.address && "italic")}>{invoice.businessDetails.address || tInvoice("Address")}</p>
                <p className={cn("text-xs opacity-70", !invoice.businessDetails.email && "italic")}>{invoice.businessDetails.email || tInvoice("Email")}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">{docType.title}</p>
                <h2 className="text-4xl font-black tracking-tighter">#{invoice.invoiceNumber}</h2>
                <div className="mt-3 text-xs opacity-80 space-y-1">
                  <p>{dateLabels.issue}: <strong>{invoice.issueDate}</strong></p>
                  {dateLabels.due && <p>{dateLabels.due}: <strong className="text-red-200">{invoice.dueDate}</strong></p>}
                </div>
              </div>
            </div>
          </div>

          {/* Info row */}
          <div className="grid grid-cols-2 gap-6 px-12 py-8 mb-4" style={{ backgroundColor: `rgba(${r},${g},${b},0.06)` }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">{tInvoice("Bill To")}</p>
              <h5 className={cn("text-lg font-black text-zinc-900", !invoice.clientDetails.name && "text-zinc-600 italic")}>{invoice.clientDetails.name || tInvoice("Client Name")}</h5>
              <p className={cn("text-xs", !invoice.clientDetails.address ? "text-zinc-600 italic" : "text-zinc-600")}>{invoice.clientDetails.address || tInvoice("Client Address")}</p>
              <p className={cn("text-xs", !invoice.clientDetails.email ? "text-zinc-600 italic" : "text-zinc-600")}>{invoice.clientDetails.email || tInvoice("Client Email")}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">{tInvoice("Amount Due")}</p>
              <p className="text-3xl font-black tracking-tighter" style={{ color: themeColor }}>{currencySymbol}{invoice.total.toFixed(2)}</p>
              {invoice.paymentMethod && <p className="text-xs text-zinc-700 mt-1">{tInvoice("Method")}: {invoice.paymentMethod}</p>}
            </div>
          </div>

          {/* Table */}
          <div className="flex-grow px-12 mb-8">
            <div className="rounded-xl overflow-hidden border border-zinc-200/60 shadow-sm">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: `rgba(${r},${g},${b},0.12)`, borderBottom: `2px solid rgba(${r},${g},${b},0.3)` }}>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest w-[8%]">#</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest w-[44%]">{tInvoice("Description")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-center w-[12%]">{tInvoice("Qty")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-right w-[18%]">{tInvoice("Unit Price")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-right w-[18%]">{tInvoice("Total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: 'white' }}>
                      <td className="py-3 px-4 text-xs text-zinc-600 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                      <td className={cn("py-3 px-4 text-sm font-semibold", !item.description && "text-zinc-600 italic")}>{item.description || tInvoice("Item description...")}</td>
                      <td className="py-3 px-4 text-sm text-center text-zinc-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-right text-zinc-600 whitespace-nowrap">{currencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right font-bold text-zinc-900 whitespace-nowrap">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mt-6">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Subtotal")}</span><span className="font-bold text-zinc-900">{currencySymbol}{invoice.subtotal.toFixed(2)}</span></div>
                {showTax && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Tax")} ({invoice.taxRate}%)</span><span className="font-bold text-zinc-900">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span></div>}
                {invoice.shipping > 0 && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Shipping")}</span><span>{currencySymbol}{invoice.shipping.toFixed(2)}</span></div>}
                {invoice.discount > 0 && <div className="flex justify-between text-xs text-red-500"><span>{tInvoice("Discount")} ({invoice.discount}%)</span><span>-{currencySymbol}{((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span></div>}
                <div className="flex justify-between items-center p-4 rounded-xl text-white mt-2" style={{ background: themeColor }}>
                  <span className="text-xs font-black uppercase tracking-widest opacity-80">{tInvoice("Total Due")}</span>
                  <span className="text-xl font-black tabular-nums">{currencySymbol}{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && <p className="px-12 text-xs text-zinc-700 mb-2"><span className="font-black uppercase text-zinc-600">{tInvoice("Notes")}: </span>{invoice.notes}</p>}
        </div>
      )}

      {/* ═══ TEMPLATE: STARTUP ═══ */}
      {invoice.template === "startup" && (
        <div className="flex flex-col flex-grow relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-12 pb-8" style={{ borderBottom: `3px solid ${themeColor}` }}>
            <div className="flex items-center gap-4">
              {logo
                ? <img src={logo} alt="Logo" className="h-12 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" />
                : <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black" style={{ background: themeColor }}>{invoice.businessDetails.name?.charAt(0) || "I"}</div>}
              <div>
                <h3 className={cn("text-xl font-black tracking-tight text-zinc-900", !invoice.businessDetails.name && "text-zinc-600 italic")}>{invoice.businessDetails.name || tInvoice("Company Name")}</h3>
                <p className={cn("text-xs", !invoice.businessDetails.email ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.businessDetails.email || tInvoice("Email")}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-widest mb-2" style={{ background: themeColor }}>{docType.title}</div>
              <h2 className="text-2xl font-black text-zinc-900">#{invoice.invoiceNumber}</h2>
            </div>
          </div>

          {/* 3-col info cards */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">{tInvoice("Bill To")}</p>
              <h6 className={cn("text-sm font-black text-zinc-900", !invoice.clientDetails.name && "text-zinc-600 italic")}>{invoice.clientDetails.name || tInvoice("Client Name")}</h6>
              <p className={cn("text-[10px] mt-1", !invoice.clientDetails.address ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.clientDetails.address || tInvoice("Address")}</p>
            </div>
            <div className="p-4 rounded-2xl border border-zinc-200/80 bg-white">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-2">{tInvoice("Dates")}</p>
              <p className="text-[10px] text-zinc-600">{dateLabels.issue}: <strong className="text-zinc-900">{invoice.issueDate}</strong></p>
              {dateLabels.due && <p className="text-[10px] text-zinc-600">{dateLabels.due}: <strong className="text-red-500">{invoice.dueDate}</strong></p>}
            </div>
            <div className="p-4 rounded-2xl text-white" style={{ background: themeColor }}>
              <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-2">{tInvoice("Total Due")}</p>
              <p className="text-2xl font-black tabular-nums">{currencySymbol}{invoice.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-grow mb-8">
            <div className="rounded-2xl overflow-hidden border border-zinc-200/60 shadow-sm">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: themeColor }}>
                    <th className="py-3 px-4 text-[9px] font-black text-white/60 uppercase tracking-widest w-[8%]">#</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest w-[44%]">{tInvoice("Description")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest text-center w-[12%]">{tInvoice("Qty")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest text-right w-[18%]">{tInvoice("Rate")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-white uppercase tracking-widest text-right w-[18%]">{tInvoice("Amount")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: 'white' }}>
                      <td className="py-3 px-4 text-xs text-zinc-600 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                      <td className={cn("py-3 px-4 text-sm font-semibold", !item.description && "text-zinc-600 italic")}>{item.description || tInvoice("Item description...")}</td>
                      <td className="py-3 px-4 text-sm text-center text-zinc-600">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-right text-zinc-600 whitespace-nowrap">{currencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right font-bold text-zinc-900 whitespace-nowrap">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Subtotal")}</span><span className="font-bold text-zinc-800">{currencySymbol}{invoice.subtotal.toFixed(2)}</span></div>
                {showTax && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Tax")} ({invoice.taxRate}%)</span><span className="font-bold text-zinc-800">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span></div>}
                {invoice.discount > 0 && <div className="flex justify-between text-xs text-red-500"><span>{tInvoice("Discount")}</span><span>-{currencySymbol}{((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span></div>}
                <div className="flex justify-between text-base font-black pt-2 border-t border-zinc-200 items-center" style={{ color: themeColor }}>
                  <span className="uppercase tracking-widest text-[10px]">{tInvoice("Total")}</span>
                  <span className="text-xl">{currencySymbol}{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && <p className="text-xs text-zinc-700 bg-white rounded-xl px-4 py-3 border border-zinc-100"><span className="font-black uppercase text-zinc-600">{tInvoice("Notes")}: </span>{invoice.notes}</p>}
        </div>
      )}

      {/* ═══ TEMPLATE: BOLD ═══ */}
      {invoice.template === "bold" && (
        <div className="flex flex-col flex-grow relative z-10 -mx-10 -mt-10">
          {/* Split header */}
          <div className="flex mb-0">
            {/* Left: colored block */}
            <div className="w-2/5 px-10 py-10 text-white flex flex-col justify-between" style={{ background: themeColor, minHeight: '220px' }}>
              {logo
                ? <div className="mb-6 inline-block bg-white/15 rounded-xl p-2"><img src={logo} alt="Logo" className="h-12 object-contain" crossOrigin="anonymous" referrerPolicy="no-referrer" /></div>
                : <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl font-black mb-6">{invoice.businessDetails.name?.charAt(0) || "I"}</div>}
              <div>
                <h4 className="text-5xl font-black uppercase tracking-tighter leading-none">{docType.title}</h4>
                <p className="text-sm opacity-70 mt-2 font-mono">#{invoice.invoiceNumber}</p>
              </div>
            </div>
            {/* Right: white block with business info */}
            <div className="w-3/5 px-10 py-10 bg-white flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">{tInvoice("From")}</p>
                <h3 className={cn("text-xl font-black tracking-tight text-zinc-900", !invoice.businessDetails.name && "text-zinc-600 italic")}>{invoice.businessDetails.name || tInvoice("Company Name")}</h3>
                <p className={cn("text-xs mt-1", !invoice.businessDetails.address ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.businessDetails.address || tInvoice("Address")}</p>
                <p className={cn("text-xs", !invoice.businessDetails.email ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.businessDetails.email || tInvoice("Email")}</p>
              </div>
              <div className="flex gap-8 mt-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{dateLabels.issue}</p>
                  <p className="text-sm font-bold text-zinc-900">{invoice.issueDate}</p>
                </div>
                {dateLabels.due && <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600">{dateLabels.due}</p>
                  <p className="text-sm font-bold text-red-500">{invoice.dueDate}</p>
                </div>}
              </div>
            </div>
          </div>

          {/* Bill To + Amount row */}
          <div className="flex px-12 py-6 mb-4 gap-6" style={{ backgroundColor: `rgba(${r},${g},${b},0.08)` }}>
            <div className="flex-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">{tInvoice("Bill To")}</p>
              <h5 className={cn("text-base font-black text-zinc-900", !invoice.clientDetails.name && "text-zinc-600 italic")}>{invoice.clientDetails.name || tInvoice("Client Name")}</h5>
              <p className={cn("text-xs", !invoice.clientDetails.address ? "text-zinc-600 italic" : "text-zinc-700")}>{invoice.clientDetails.address || tInvoice("Client Address")}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">{tInvoice("Total Due")}</p>
              <p className="text-3xl font-black tracking-tighter" style={{ color: themeColor }}>{currencySymbol}{invoice.total.toFixed(2)}</p>
            </div>
          </div>

          {/* Table */}
          <div className="flex-grow px-12 mb-6">
            <div className="rounded-xl overflow-hidden border border-zinc-200/60 shadow-sm">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: `rgba(${r},${g},${b},0.12)`, borderBottom: `2px solid ${themeColor}` }}>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest w-[8%]">#</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest w-[42%]">{tInvoice("Description")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-center w-[12%]">{tInvoice("Qty")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-right w-[18%]">{tInvoice("Unit Price")}</th>
                    <th className="py-3 px-4 text-[9px] font-black text-zinc-800 uppercase tracking-widest text-right w-[20%]">{tInvoice("Total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={item.id} style={{ backgroundColor: 'white' }}>
                      <td className="py-3 px-4 text-xs text-zinc-600 font-bold">{String(idx + 1).padStart(2, '0')}</td>
                      <td className={cn("py-3 px-4 text-sm font-semibold", !item.description && "text-zinc-600 italic")}>{item.description || tInvoice("Item description...")}</td>
                      <td className="py-3 px-4 text-sm text-center text-zinc-700">{item.quantity}</td>
                      <td className="py-3 px-4 text-sm text-right text-zinc-700 whitespace-nowrap">{currencySymbol}{item.price.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-right font-black text-zinc-900 whitespace-nowrap">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-6">
              <div className="w-68 space-y-1.5 min-w-[260px]">
                <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Subtotal")}</span><span className="font-bold text-zinc-900">{currencySymbol}{invoice.subtotal.toFixed(2)}</span></div>
                {showTax && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Tax")} ({invoice.taxRate}%)</span><span className="font-bold">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span></div>}
                {invoice.shipping > 0 && <div className="flex justify-between text-xs text-zinc-700"><span>{tInvoice("Shipping")}</span><span>{currencySymbol}{invoice.shipping.toFixed(2)}</span></div>}
                {invoice.discount > 0 && <div className="flex justify-between text-xs text-red-500"><span>{tInvoice("Discount")} ({invoice.discount}%)</span><span>-{currencySymbol}{((invoice.subtotal * invoice.discount) / 100).toFixed(2)}</span></div>}
                <div className="flex justify-between items-center px-4 py-3 rounded-xl text-white mt-2" style={{ background: themeColor }}>
                  <span className="font-black uppercase tracking-widest text-[10px] opacity-80">{tInvoice("Grand Total")}</span>
                  <span className="text-xl font-black tabular-nums">{currencySymbol}{invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && <p className="px-12 text-xs text-zinc-700 mb-2"><span className="font-black uppercase text-zinc-600">{tInvoice("Notes")}: </span>{invoice.notes}</p>}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-zinc-200 text-center relative z-10">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700">Generated by Invoice-Generator.me</p>
      </div>

    </div>

  );
};

export default InvoiceTemplate;
