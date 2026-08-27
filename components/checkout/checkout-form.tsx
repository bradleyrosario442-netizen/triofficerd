"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { provinces } from "@/lib/data/provinces";
import { site } from "@/lib/data/site";
import { submitOrder } from "@/lib/services/orders";
import { useCart } from "@/lib/store/cart-context";
import type { DeliveryMethod, Order, PaymentMethod } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";

const deliveryOptions: { value: DeliveryMethod; title: string; text: string }[] = [
  { value: "delivery", title: "Envío a domicilio", text: "Coordinamos la entrega en la dirección indicada." },
  { value: "pickup", title: "Retiro en tienda", text: "Retira en Alma Rosa I, Santo Domingo Este." },
];

const paymentOptions: { value: PaymentMethod; title: string; text: string }[] = [
  { value: "transfer", title: "Transferencia bancaria", text: "Te enviamos los datos al confirmar el pedido." },
  { value: "card_on_delivery", title: "Tarjeta contra entrega", text: "Pago con tarjeta al recibir el pedido." },
  { value: "cash", title: "Efectivo", text: "Pago en tienda o contra entrega." },
  { value: "credit_account", title: "Cuenta de crédito", text: "Sujeto a aprobación para clientes empresariales." },
];

interface FormState {
  firstName: string;
  lastName: string;
  company: string;
  rnc: string;
  email: string;
  phone: string;
  province: string;
  municipality: string;
  address: string;
  reference: string;
  notes: string;
}

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  company: "",
  rnc: "",
  email: "",
  phone: "",
  province: "",
  municipality: "",
  address: "",
  reference: "",
  notes: "",
};

export function CheckoutForm() {
  const { items, totals, coupon, hydrated, deliveryMethod, setDeliveryMethod, clear } = useCart();
  const [form, setForm] = useState<FormState>(initialForm);
  const [payment, setPayment] = useState<PaymentMethod>("transfer");
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const municipalities = useMemo(
    () => provinces.find((province) => province.name === form.province)?.municipalities ?? [],
    [form.province],
  );

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = "Indica tu nombre.";
    if (!form.lastName.trim()) next.lastName = "Indica tu apellido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Correo electrónico no válido.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Teléfono no válido.";
    if (form.rnc && form.rnc.replace(/\D/g, "").length < 9) next.rnc = "El RNC debe tener al menos 9 dígitos.";
    if (deliveryMethod === "delivery") {
      if (!form.province) next.province = "Selecciona la provincia.";
      if (!form.municipality) next.municipality = "Selecciona el municipio.";
      if (!form.address.trim()) next.address = "Indica la dirección de entrega.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      document.querySelector<HTMLElement>("[data-error='true']")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setSubmitting(true);
    try {
      const created = await submitOrder({
        customer: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          company: form.company.trim() || undefined,
          rnc: form.rnc.trim() || undefined,
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        address: {
          province: deliveryMethod === "pickup" ? "Retiro en tienda" : form.province,
          municipality: deliveryMethod === "pickup" ? site.address.city : form.municipality,
          address: deliveryMethod === "pickup" ? site.address.street : form.address.trim(),
          reference: form.reference.trim() || undefined,
        },
        items,
        totals,
        deliveryMethod,
        paymentMethod: payment,
        notes: form.notes.trim() || undefined,
        couponCode: coupon?.code,
      });
      setOrder(created);
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fresh-50 text-fresh-600">
          <Icon name="check-circle" size={28} />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-ink">Pedido registrado</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Tu número de pedido es <span className="font-semibold text-ink">{order.id}</span>. Un asesor
          confirmará disponibilidad, forma de pago y tiempo de entrega por correo o teléfono.
        </p>
        <dl className="mt-6 space-y-2 rounded-lg bg-canvas p-4 text-left text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-muted">Total del pedido</dt>
            <dd className="font-semibold text-ink">{formatCurrency(order.totals.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Método de entrega</dt>
            <dd className="text-ink">
              {order.deliveryMethod === "pickup" ? "Retiro en tienda" : "Envío a domicilio"}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Método de pago</dt>
            <dd className="text-ink">
              {paymentOptions.find((option) => option.value === order.paymentMethod)?.title}
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <LinkButton href="/tienda">Seguir comprando</LinkButton>
          <LinkButton href="/contacto" variant="outline">
            Contactar a un asesor
          </LinkButton>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-xl bg-canvas" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-canvas px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-ink">No hay productos en tu carrito</h2>
        <p className="mx-auto mt-2 max-w-md text-[14px] text-muted">
          Agrega productos al carrito para completar el proceso de compra.
        </p>
        <LinkButton href="/tienda" className="mt-6">
          Ir a la tienda
          <Icon name="arrow-right" size={16} />
        </LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-8">
      <div className="space-y-6">
        <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Datos de contacto</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div data-error={Boolean(errors.firstName)}>
              <Field label="Nombre" htmlFor="firstName" required error={errors.firstName}>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  autoComplete="given-name"
                />
              </Field>
            </div>
            <div data-error={Boolean(errors.lastName)}>
              <Field label="Apellido" htmlFor="lastName" required error={errors.lastName}>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  autoComplete="family-name"
                />
              </Field>
            </div>
            <Field label="Empresa" htmlFor="company">
              <Input
                id="company"
                value={form.company}
                onChange={(event) => update("company", event.target.value)}
                autoComplete="organization"
              />
            </Field>
            <Field label="RNC" htmlFor="rnc" error={errors.rnc} hint="Para facturación con comprobante fiscal.">
              <Input
                id="rnc"
                value={form.rnc}
                onChange={(event) => update("rnc", event.target.value)}
                inputMode="numeric"
              />
            </Field>
            <div data-error={Boolean(errors.email)}>
              <Field label="Correo electrónico" htmlFor="email" required error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => update("email", event.target.value)}
                  autoComplete="email"
                />
              </Field>
            </div>
            <div data-error={Boolean(errors.phone)}>
              <Field label="Teléfono" htmlFor="phone" required error={errors.phone}>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  placeholder="(809) 000-0000"
                  autoComplete="tel"
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Método de entrega</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {deliveryOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                  deliveryMethod === option.value
                    ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20"
                    : "border-line hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option.value}
                  checked={deliveryMethod === option.value}
                  onChange={() => setDeliveryMethod(option.value)}
                  className="mt-0.5 h-4 w-4 accent-brand-700"
                />
                <span>
                  <span className="block text-[14px] font-medium text-ink">{option.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                    {option.text}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {deliveryMethod === "delivery" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div data-error={Boolean(errors.province)}>
                <Field label="Provincia" htmlFor="province" required error={errors.province}>
                  <Select
                    id="province"
                    value={form.province}
                    onChange={(event) => {
                      update("province", event.target.value);
                      update("municipality", "");
                    }}
                  >
                    <option value="">Selecciona una provincia</option>
                    {provinces.map((province) => (
                      <option key={province.name} value={province.name}>
                        {province.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div data-error={Boolean(errors.municipality)}>
                <Field label="Municipio" htmlFor="municipality" required error={errors.municipality}>
                  <Select
                    id="municipality"
                    value={form.municipality}
                    onChange={(event) => update("municipality", event.target.value)}
                    disabled={!form.province}
                  >
                    <option value="">
                      {form.province ? "Selecciona un municipio" : "Selecciona primero la provincia"}
                    </option>
                    {municipalities.map((municipality) => (
                      <option key={municipality} value={municipality}>
                        {municipality}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
              <div className="sm:col-span-2" data-error={Boolean(errors.address)}>
                <Field label="Dirección" htmlFor="address" required error={errors.address}>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    placeholder="Calle, número, sector"
                    autoComplete="street-address"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Referencia"
                  htmlFor="reference"
                  hint="Punto de referencia, edificio, piso o instrucciones de acceso."
                >
                  <Input
                    id="reference"
                    value={form.reference}
                    onChange={(event) => update("reference", event.target.value)}
                  />
                </Field>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex gap-3 rounded-lg bg-canvas p-4">
              <Icon name="map-pin" size={18} className="mt-0.5 shrink-0 text-brand-700" />
              <p className="text-[13px] leading-relaxed text-muted">
                Retiro en {site.address.street}, {site.address.sector}, {site.address.city}. Te
                avisamos cuando el pedido esté listo.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Método de pago</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {paymentOptions.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors ${
                  payment === option.value
                    ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20"
                    : "border-line hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={option.value}
                  checked={payment === option.value}
                  onChange={() => setPayment(option.value)}
                  className="mt-0.5 h-4 w-4 accent-brand-700"
                />
                <span>
                  <span className="block text-[14px] font-medium text-ink">{option.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                    {option.text}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-canvas p-3 text-[12.5px] leading-relaxed text-muted">
            <Icon name="info" size={15} className="mt-0.5 shrink-0 text-brand-600" />
            El cobro en línea con pasarela de pago se habilitará en una próxima fase. Por ahora el
            pedido se confirma con un asesor.
          </p>
        </section>

        <section className="rounded-xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[16px] font-semibold text-ink">Notas del pedido</h2>
          <div className="mt-4">
            <Field
              label="Instrucciones adicionales"
              htmlFor="notes"
              hint="Horario de recepción, contacto en sitio, requisitos de facturación."
            >
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => update("notes", event.target.value)}
              />
            </Field>
          </div>
        </section>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16px] font-semibold text-ink">Resumen del pedido</h2>

          <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1 scroll-thin">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas">
                  <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  <span className="absolute right-0 top-0 inline-flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-ink px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <Link
                    href={`/producto/${item.slug}`}
                    className="line-clamp-2 text-[13px] font-medium leading-snug text-ink hover:text-brand-700"
                  >
                    {item.name}
                  </Link>
                  <span className="mt-0.5 block text-[12px] text-muted">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium text-ink">{formatCurrency(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 ? (
              <div className="flex justify-between text-fresh-700">
                <dt>Descuento</dt>
                <dd className="font-medium">-{formatCurrency(totals.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-muted">ITBIS</dt>
              <dd className="font-medium text-ink">{formatCurrency(totals.tax)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Envío</dt>
              <dd className="font-medium text-ink">
                {totals.shipping === 0 ? "Gratis" : formatCurrency(totals.shipping)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="text-[15px] font-semibold text-ink">Total</dt>
              <dd className="text-xl font-semibold text-ink">{formatCurrency(totals.total)}</dd>
            </div>
          </dl>

          <Button type="submit" size="lg" fullWidth className="mt-5" disabled={submitting}>
            {submitting ? "Procesando…" : "Confirmar pedido"}
            {!submitting ? <Icon name="arrow-right" size={17} /> : null}
          </Button>

          <p className="mt-3 text-center text-[12px] leading-relaxed text-muted">
            Al confirmar aceptas nuestros{" "}
            <Link href="/legal/terminos" className="text-brand-700 underline-offset-2 hover:underline">
              términos y condiciones
            </Link>
            .
          </p>
        </div>
      </aside>
    </form>
  );
}
