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
  tInvoice: (key: string) => string;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  logo,
  currencySymbol,
  showTax,
  includeWatermark,
  tInvoice,
}) => {
  const { t } = useTranslation();

  const themeColor = invoice.themeColor || "#18181b";

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
      className="bg-white shadow-xl rounded-sm min-h-[1123px] pb-20 p-12 flex flex-col relative overflow-hidden w-[794px] mx-auto break-words antialiased text-zinc-900"
      style={{ minHeight: '1123px', width: '794px' }}
    >

      {/* Watermark */}
      {includeWatermark && invoice.businessDetails.name && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none">
          <span className="text-9xl font-black tracking-widest">{invoice.businessDetails.name}</span>
        </div>
      )}



      {/* Template: Modern - Professional & Detailed Enhancement */}
      {invoice.template === "modern" && (
        <div className="flex flex-col h-full relative z-10 w-full">
          <div className="flex justify-between items-start mb-16 border-b-4 border-zinc-900 pb-12">
            <div className="flex flex-col gap-10 max-w-[45%]">
              {logo ? (
                <img src={logo} alt="Logo" className="h-20 w-fit object-contain grayscale" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-20 h-20 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-3xl font-black">
                  {invoice.businessDetails.name ? invoice.businessDetails.name.charAt(0) : "I"}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">{tInvoice("Bill From")}</p>
                <h3 className={cn("font-black text-2xl tracking-tighter uppercase leading-none", !invoice.businessDetails.name && "text-zinc-300 italic")}>
                  {invoice.businessDetails.name || tInvoice("Company Name")}
                </h3>
                <p className={cn("text-xs leading-relaxed font-bold uppercase tracking-widest max-w-sm pt-2", !invoice.businessDetails.address && "text-zinc-200 italic")}>
                  {invoice.businessDetails.address || tInvoice("Address")}
                </p>
                <div className="flex flex-col gap-1 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">E:</span>
                    <span className={cn("text-[10px] font-bold", !invoice.businessDetails.email && "text-zinc-300 italic")}>
                      {invoice.businessDetails.email || tInvoice("Email")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">T:</span>
                    <span className={cn("text-[10px] font-bold", !invoice.businessDetails.phone && "text-zinc-300 italic")}>
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
                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-[0.3em] mt-2">{docType.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-12 w-full max-w-sm mt-8 text-left">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">{tInvoice("Bill To")}</p>
                  <h5 className={cn("font-black text-lg uppercase tracking-tighter leading-none mb-2", !invoice.clientDetails.name && "text-zinc-300 italic")}>
                    {invoice.clientDetails.name || tInvoice("Client Name")}
                  </h5>
                  <p className={cn("text-xs leading-relaxed font-medium", !invoice.clientDetails.address && "text-zinc-200 italic")}>
                    {invoice.clientDetails.address || tInvoice("Client Address")}
                  </p>
                  <div className="flex flex-col gap-1.5 mt-4">
                    <p className={cn("text-xs font-bold text-zinc-900", !invoice.clientDetails.email && "text-zinc-200 italic")}>
                      {invoice.clientDetails.email || tInvoice("Client Email")}
                    </p>
                    <p className={cn("text-xs font-bold text-zinc-900", !invoice.clientDetails.phone && "text-zinc-200 italic")}>
                      {getFlag(invoice.clientDetails.dialCode)} {invoice.clientDetails.dialCode} {invoice.clientDetails.phone || tInvoice("Client Phone")}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="border-l-2 border-zinc-100 pl-4">
                    <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mb-1">{dateLabels.issue}</p>
                    <p className="text-xs font-black text-zinc-900">{invoice.issueDate}</p>
                  </div>
                  {dateLabels.due && (
                    <div className="border-l-2 border-zinc-100 pl-4">
                      <p className="text-[9px] font-black uppercase text-zinc-300 tracking-widest mb-1">{dateLabels.due}</p>
                      <p className="text-xs font-black text-red-600">{invoice.dueDate}</p>
                    </div>
                  )}
                  {invoice.type === 'receipt' && invoice.paymentMethod && (
                    <div className="border-l-2 border-emerald-500 pl-4">
                      <p className="text-[9px] font-black uppercase text-emerald-600/50 tracking-widest mb-1">{tInvoice("Payment Method")}</p>
                      <p className="text-xs font-black text-emerald-700">{invoice.paymentMethod}</p>
                    </div>
                  )}
                  <div className="bg-zinc-900 p-4 rounded-lg text-white">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-1">{tInvoice("Total Amount")}</p>
                    <p className="text-xl font-black tracking-tighter tabular-nums">
                      {currencySymbol}{invoice.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow mb-12">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-zinc-900">
                  <th className="py-4 px-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest w-[10%] text-left whitespace-nowrap">#</th>
                  <th className="py-4 px-2 text-[9px] font-black text-zinc-900 uppercase tracking-widest w-[42%]">{tInvoice("Description of Goods / Services")}</th>
                  <th className="py-4 px-4 text-[9px] font-black text-zinc-900 uppercase tracking-widest text-center w-[10%]">{tInvoice("Qty")}</th>
                  <th className="py-4 px-4 text-[9px] font-black text-zinc-900 uppercase tracking-widest text-right w-[18%]">{tInvoice("Unit Price")}</th>
                  <th className="py-4 px-4 text-[9px] font-black text-zinc-900 uppercase tracking-widest text-right w-[20%]">{tInvoice("Total")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className="group hover:bg-zinc-50 transition-colors">
                    <td className="py-6 px-4 text-xs font-black text-zinc-300 tabular-nums whitespace-nowrap">{String(idx + 1).padStart(2, '0')}</td>
                    <td className="py-6 px-2">
                      <p className={cn("text-sm font-bold leading-tight", !item.description && "text-zinc-300 italic")}>
                        {item.description || tInvoice("Item description...")}
                      </p>
                    </td>
                    <td className="py-6 px-4 text-sm font-bold text-zinc-600 text-center tabular-nums">{item.quantity}</td>
                    <td className="py-6 px-4 text-sm font-bold text-zinc-600 text-right tabular-nums whitespace-nowrap">{currencySymbol}{item.price.toFixed(2)}</td>
                    <td className="py-6 px-4 text-sm font-black text-zinc-900 text-right tabular-nums whitespace-nowrap">{currencySymbol}{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 lg:col-span-7 bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100">
              <div className="space-y-8">

                <div className="grid grid-cols-2 gap-8 pt-4">
                  {invoice.notes && (
                    <div>
                      <h6 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">{tInvoice("Bank / UPI Payment")}</h6>
                      <div className="text-[10px] text-zinc-600 leading-relaxed font-bold whitespace-pre-wrap line-clamp-4 overflow-hidden">
                        {invoice.notes}
                      </div>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h6 className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-2">{tInvoice("Terms & Conditions")}</h6>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium line-clamp-4 overflow-hidden">{invoice.terms}</p>
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
                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest italic">{tInvoice("Authorized Signatory")}</p>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 p-8 bg-zinc-900 rounded-[2.5rem] shadow-2xl text-white">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-500">
                  <span>{tInvoice("Subtotal")}</span>
                  <span className="text-zinc-200">{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
                </div>
                {showTax && (
                  <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-500">
                    <span>{tInvoice("Tax Amount")} ({invoice.taxRate}%)</span>
                    <span className="text-zinc-200">{currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {invoice.shipping > 0 && (
                  <div className="flex justify-between text-[10px] font-black tracking-widest uppercase text-zinc-500">
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
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1">{tInvoice("Invoice Grand Total")}</span>
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
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">{tInvoice("Bill From")}</p>
              {logo && <img src={logo} alt="Logo" className="h-16 ml-auto mb-4 object-contain" referrerPolicy="no-referrer" />}
              <h3 className={cn("font-bold text-2xl tracking-tight", !invoice.businessDetails.name && "text-zinc-300 italic")}>
                {invoice.businessDetails.name || tInvoice("Company Name")}
              </h3>
              <p className={cn("text-sm transition-colors", !invoice.businessDetails.address && "text-zinc-200 italic")}>
                {invoice.businessDetails.address || tInvoice("Address")}
              </p>
              <div className="flex flex-col items-end gap-0.5 mt-2">
                <span className={cn("text-xs font-medium", !invoice.businessDetails.email && "text-zinc-200 italic")}>
                  {invoice.businessDetails.email || tInvoice("Email")}
                </span>
                <span className={cn("text-xs font-bold", !invoice.businessDetails.phone && "text-zinc-200 italic")}>
                  {getFlag(invoice.businessDetails.dialCode)} {invoice.businessDetails.dialCode} {invoice.businessDetails.phone || tInvoice("Phone")}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-20 relative z-10">
            <div className="border-l-4 pl-8 py-2 bg-zinc-50 rounded-r-xl" style={{ borderColor: themeColor }}>
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-2 tracking-widest">{tInvoice("Bill To")}</p>

              <h5 className={cn("font-bold text-xl", !invoice.clientDetails.name && "text-zinc-300 italic")}>
                {invoice.clientDetails.name || tInvoice("Client Name")}
              </h5>
              <p className={cn("text-sm mt-2 transition-colors", !invoice.clientDetails.address && "text-zinc-200 italic")}>
                {invoice.clientDetails.address || tInvoice("Client Address")}
              </p>
              <div className="flex flex-col gap-1 mt-4">
                <p className={cn("text-sm font-medium text-zinc-600", !invoice.clientDetails.email && "text-zinc-200 italic")}>
                  {invoice.clientDetails.email || tInvoice("Client Email")}
                </p>
                <p className={cn("text-sm font-bold text-zinc-900", !invoice.clientDetails.phone && "text-zinc-200 italic")}>
                  {getFlag(invoice.clientDetails.dialCode)} {invoice.clientDetails.dialCode} {invoice.clientDetails.phone || tInvoice("Client Phone")}
                </p>
              </div>
            </div>
            <div className="text-right bg-zinc-50 p-6 rounded-xl border border-zinc-100">
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-4 tracking-widest">{tInvoice("Details")}</p>
              <div className="space-y-2 text-sm">
                <p>{dateLabels.issue}: <strong className="text-zinc-900">{invoice.issueDate}</strong></p>
                {dateLabels.due && <p>{dateLabels.due}: <strong className="text-error">{invoice.dueDate}</strong></p>}
                {invoice.paymentMethod && <p>{tInvoice("Method")}: <strong className="text-zinc-900">{invoice.paymentMethod}</strong></p>}
                {invoice.validityPeriod && <p>{tInvoice("Valid")}: <strong className="text-zinc-900">{invoice.validityPeriod}</strong></p>}
                {invoice.expectedStartDate && <p>{tInvoice("Starts")}: <strong className="text-zinc-900">{invoice.expectedStartDate}</strong></p>}
              </div>
            </div>
          </div>
        </>
      )}




      {/* Common Table Section for Professional */}
      {invoice.template === "professional" && (
        <div className="flex-grow relative z-10">
          <table className="w-full text-left table-fixed">
            <thead>
              <tr className="border-b-2" style={{
                borderColor: invoice.template === "professional" ? "#e4e4e7" : (invoice.template === "creative" ? "#18181b" : themeColor),
                backgroundColor: invoice.template === "professional" ? "#fafafa" : "transparent"
              }}>

                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest w-[10%] text-zinc-400 whitespace-nowrap">#</th>
                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest w-[37%]">{tInvoice("Description")}</th>
                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-center w-[15%]">{tInvoice("Qty")}</th>
                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-right w-[18%]">{tInvoice("Unit Price")}</th>
                <th className="py-4 px-4 text-[9px] font-black uppercase tracking-widest text-right w-[20%]">{tInvoice("Total")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {invoice.items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="py-6 px-4 text-[10px] font-bold text-zinc-300 tabular-nums whitespace-nowrap">{String(idx + 1).padStart(2, '0')}</td>
                  <td className={cn("py-6 px-4 text-sm font-bold", !item.description && "text-zinc-300 italic")}>
                    {item.description || tInvoice("Item description...")}
                  </td>
                  <td className="py-6 px-4 text-sm text-center">{item.quantity}</td>
                  <td className="py-6 px-4 text-sm text-right whitespace-nowrap">{currencySymbol} {item.price.toFixed(2)}</td>
                  <td className="py-6 px-4 text-sm text-right font-bold whitespace-nowrap">{currencySymbol} {(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Common Bottom Section for Professional */}
      {invoice.template === "professional" && (
        <div className="mt-12 flex justify-between items-end relative z-10">
          <div className="w-1/2">
            {invoice.notes && (
              <div className="mb-4">
                <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">{tInvoice("Notes")}</p>
                <p className="text-xs text-zinc-500">{invoice.notes}</p>
              </div>
            )}
            <div className="mt-20 flex flex-col items-start pb-8">
              <div className="w-56 relative border-b-2 border-zinc-100 pb-2">
                {invoice.signature && (
                  <div className="absolute left-0 right-0 -top-20 flex justify-center">
                    <img src={invoice.signature} className="h-32 object-contain pointer-events-none" />
                  </div>
                )}
                <p className="text-xs italic text-zinc-400 text-center tracking-wide font-black uppercase">{tInvoice("Authorized Signatory")}</p>
              </div>
            </div>



          </div>
          <div className="w-1/2 space-y-3">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-zinc-500">{tInvoice("Subtotal")}</span>
              <span className="tabular-nums">{currencySymbol} {invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {showTax && (
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-500">{tInvoice("Tax")} ({invoice.taxRate}%)</span>
                <span className="tabular-nums">{currencySymbol} {invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {invoice.shipping > 0 && (
              <div className="flex justify-between text-xs font-medium">
                <span className="text-zinc-500">{tInvoice("Shipping")}</span>
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

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-zinc-100 text-center relative z-10">
        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-300">Generated by INVOXA</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
