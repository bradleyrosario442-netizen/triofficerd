/**
 * Tri Office — Modelo de dominio
 * Estos tipos son la frontera entre la UI y la fuente de datos.
 * Al migrar a Supabase solo cambia la implementación de `lib/services/*`,
 * no los componentes.
 */

export type ProductAvailability = "in_stock" | "low_stock" | "out_of_stock" | "on_request";

export type ProductKind = "retail" | "corporate" | "consumable";

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  /** slug de categoría */
  category: string;
  /** slug de subcategoría */
  subcategory: string;
  /** slug de marca */
  brand: string;
  /** Precio en DOP. `null` cuando el precio depende del volumen. */
  price: number | null;
  previousPrice: number | null;
  stock: number;
  availability: ProductAvailability;
  images: string[];
  specifications: Specification[];
  features: string[];
  kind: ProductKind;
  featured: boolean;
  bestseller: boolean;
  isNew: boolean;
  sale: boolean;
  /** Solo cotización: oculta el precio y el botón de compra directa. */
  quoteOnly: boolean;
  unit?: string;
  createdAt: string;
}

export interface Subcategory {
  slug: string;
  name: string;
  description?: string;
}

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
  /** Se muestra en el mega menú y en la portada. */
  highlighted: boolean;
  subcategories: Subcategory[];
}

export interface Brand {
  slug: string;
  name: string;
  /** Ruta del logo cargado desde administración. `null` = se muestra el wordmark. */
  logo: string | null;
  categories: string[];
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  sku: string;
  image: string;
  unitPrice: number;
  quantity: number;
}

export interface QuoteItem {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  sku: string;
  image: string;
  /** Referencia informativa; el precio final lo confirma un asesor. */
  referencePrice: number | null;
  quantity: number;
  note?: string;
}

export interface Coupon {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minimum: number;
  description: string;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface Customer {
  firstName: string;
  lastName: string;
  company?: string;
  rnc?: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  province: string;
  municipality: string;
  address: string;
  reference?: string;
}

export type DeliveryMethod = "delivery" | "pickup";
export type PaymentMethod = "transfer" | "card_on_delivery" | "cash" | "credit_account";

export interface Order {
  id: string;
  customer: Customer;
  address: ShippingAddress;
  items: CartItem[];
  totals: CartTotals;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
  couponCode?: string;
  createdAt: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
}

export interface QuoteRequest {
  id: string;
  reference: string;
  company: string;
  rnc?: string;
  contactName: string;
  email: string;
  phone: string;
  department?: string;
  message?: string;
  items: QuoteItem[];
  createdAt: string;
  status: "received" | "in_review" | "sent" | "closed";
}

export interface SearchResults {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  total: number;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brands?: string[];
  query?: string;
}

/** El catálogo es de cotización: se ordena por nombre o marca, no por precio. */
export type SortKey = "relevance" | "name_asc" | "name_desc" | "brand";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export type IconName =
  | "cpu"
  | "printer"
  | "settings"
  | "sofa"
  | "clipboard"
  | "sparkles"
  | "backpack"
  | "box"
  | "truck"
  | "headset"
  | "file-text"
  | "shield";
