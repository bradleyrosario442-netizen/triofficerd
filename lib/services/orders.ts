import type {
  CartItem,
  CartTotals,
  Customer,
  DeliveryMethod,
  Order,
  PaymentMethod,
  QuoteItem,
  QuoteRequest,
  ShippingAddress,
} from "@/lib/types";

/* ==========================================================================
   Pedidos y cotizaciones.
   Estas funciones son el punto único de envío al backend. Hoy generan la
   referencia localmente; al conectar Supabase o una pasarela de pago solo
   cambia el cuerpo de `submitOrder` / `submitQuote`.
   ========================================================================== */

function reference(prefix: string): string {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${stamp}-${random}`;
}

export interface OrderDraft {
  customer: Customer;
  address: ShippingAddress;
  items: CartItem[];
  totals: CartTotals;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
}

export interface QuoteDraft {
  company: string;
  rnc?: string;
  contactName: string;
  email: string;
  phone: string;
  department?: string;
  message?: string;
  items: QuoteItem[];
}

/**
 * Registra el pedido.
 * Reemplazar por la llamada real (Supabase + pasarela) manteniendo la firma.
 */
export async function submitOrder(draft: OrderDraft): Promise<Order> {
  const order: Order = {
    id: reference("TO"),
    ...draft,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await new Promise((resolve) => setTimeout(resolve, 600));
  return order;
}

/** Registra la solicitud de cotización empresarial. */
export async function submitQuote(draft: QuoteDraft): Promise<QuoteRequest> {
  const quote: QuoteRequest = {
    id: reference("COT"),
    reference: reference("COT"),
    ...draft,
    createdAt: new Date().toISOString(),
    status: "received",
  };
  quote.reference = quote.id;
  await new Promise((resolve) => setTimeout(resolve, 600));
  return quote;
}

/** Mensaje de contacto general. */
export async function submitContactMessage(payload: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}): Promise<{ id: string }> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { id: reference("MSG") };
}
