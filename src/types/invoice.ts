export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface BusinessDetails {
  name: string;
  email: string;
  phone: string;
  dialCode?: string;
  address: string;
  logoUrl?: string;
  website?: string;
  isoCode?: string;
}

export interface ClientDetails {
  name: string;
  email: string;
  address: string;
  phone: string;
  dialCode?: string;
  receivedBy?: string; // For Receipts
}

export interface Invoice {
  id?: string;
  userId?: string;
  type: "invoice" | "receipt" | "quotation" | "estimate";
  template: "modern" | "professional" | "creative";
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  country: string;
  isoCode?: string;
  businessDetails: BusinessDetails;
  clientDetails: ClientDetails;
  items: InvoiceItem[];
  taxRate: number;
  taxAmount: number;
  discount: number;
  shipping: number;
  subtotal: number;
  total: number;
  notes: string;
  terms: string;
  language: string;
  signature?: string;
  themeColor?: string;

  createdAt?: string;

  updatedAt?: string;

  // Professional Fields for specific types
  paymentMethod?: string;        // Receipt
  transactionId?: string;        // Receipt
  amountInWords?: string;        // Receipt
  balanceRemaining?: number;     // Receipt

  validityPeriod?: string;       // Quotation
  expectedStartDate?: string;    // Quotation/Estimate
  expectedEndDate?: string;      // Quotation
  timeframe?: string;            // Estimate
  contingencyClause?: string;    // Estimate
  disclaimer?: string;           // Estimate
}

export interface SentEmail {
  id?: string;
  userId: string;
  invoiceId: string;
  invoiceNumber: string;
  recipientEmail: string;
  subject: string;
  message: string;
  sentAt: string;
  invoiceData: Invoice;
}
