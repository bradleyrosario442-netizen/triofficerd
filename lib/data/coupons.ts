import type { Coupon } from "@/lib/types";

/** Cupones de demostración. Migrables a una tabla `coupons`. */
export const coupons: Coupon[] = [
  {
    code: "OFICINA10",
    type: "percentage",
    value: 10,
    minimum: 5000,
    description: "10 % de descuento en compras desde RD$5,000",
  },
  {
    code: "ENVIOGRATIS",
    type: "fixed",
    value: 450,
    minimum: 3000,
    description: "Cubre el costo de envío estándar",
  },
  {
    code: "TECNO5",
    type: "percentage",
    value: 5,
    minimum: 0,
    description: "5 % de descuento en tu primera compra",
  },
];
