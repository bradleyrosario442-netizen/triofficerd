"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { QuantityInput } from "@/components/ui/quantity";
import { getBrandName } from "@/lib/services/catalog";
import { submitQuote } from "@/lib/services/orders";
import { useQuote } from "@/lib/store/quote-context";
import type { QuoteItem, QuoteRequest } from "@/lib/types";
import { formatCurrency } from "@/lib/utils/format";
import { whatsappForQuote } from "@/lib/utils/whatsapp";

interface FormState {
  company: string;
  rnc: string;
  contactName: string;
  email: string;
  phone: string;
  department: string;
  message: string;
}

const initialForm: FormState = {
  company: "",
  rnc: "",
  contactName: "",
  email: "",
  phone: "",
  department: "",
  message: "",
};

export function QuoteBuilder() {
  const { items, count, referenceTotal, hydrated, setQuantity, removeItem, setNote, clear } =
    useQuote();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ quote: QuoteRequest; items: QuoteItem[] } | null>(null);
  const [openNote, setOpenNote] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.company.trim()) next.company = "Indica el nombre de la empresa o institución.";
    if (!form.contactName.trim()) next.contactName = "Indica el nombre del contacto.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Correo electrónico no válido.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Teléfono no válido.";
    if (form.rnc && form.rnc.replace(/\D/g, "").length < 9) next.rnc = "El RNC debe tener al menos 9 dígitos.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0 || !validate()) return;

    setSubmitting(true);
    try {
      const snapshot = items;
      const quote = await submitQuote({
        company: form.company.trim(),
        rnc: form.rnc.trim() || undefined,
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim() || undefined,
        message: form.message.trim() || undefined,
        items: snapshot,
      });
      setSent({ quote, items: snapshot });
      clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="check-circle" size={28} />
        </span>
        <h2 className="mt-5 text-xl font-semibold text-ink">Solicitud enviada</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Registramos tu solicitud con la referencia{" "}
          <span className="font-semibold text-ink">{sent.quote.reference}</span>. Un asesor preparará
          la cotización con precios, disponibilidad y tiempo de entrega.
        </p>
        <dl className="mt-6 space-y-2 rounded-lg bg-canvas p-4 text-left text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-muted">Empresa</dt>
            <dd className="font-medium text-ink">{sent.quote.company}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Artículos solicitados</dt>
            <dd className="font-medium text-ink">{sent.items.length}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Contacto</dt>
            <dd className="font-medium text-ink">{sent.quote.email}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
          <LinkButton
            href={whatsappForQuote(sent.quote.reference, sent.items)}
            variant="whatsapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="whatsapp" size={17} />
            Dar seguimiento por WhatsApp
          </LinkButton>
          <LinkButton href="/tienda" variant="outline">
            Seguir explorando
          </LinkButton>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-xl bg-canvas" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
      {/* Lista de artículos */}
      <div>
        <div className="rounded-xl border border-line bg-white">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-[16px] font-semibold text-ink">Artículos a cotizar</h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {items.length > 0
                  ? `${items.length} producto(s) · ${count} unidades en total`
                  : "Aún no has agregado productos"}
              </p>
            </div>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={clear}
                className="text-[12.5px] font-medium text-muted transition-colors hover:text-red-600"
              >
                Vaciar lista
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-muted">
                <Icon name="quote" size={22} />
              </span>
              <p className="mt-4 text-[15px] font-medium text-ink">Tu lista de cotización está vacía</p>
              <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-muted">
                Agrega productos desde el catálogo con el botón <em>Solicitar cotización</em> y luego
                indica las cantidades que necesita tu empresa.
              </p>
              <LinkButton href="/tienda" className="mt-5">
                Explorar el catálogo
                <Icon name="arrow-right" size={16} />
              </LinkButton>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {items.map((item) => (
                <li key={item.productId} className="p-4 sm:p-5">
                  <div className="flex gap-3.5">
                    <Link
                      href={`/producto/${item.slug}`}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-line bg-canvas"
                    >
                      <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                        {getBrandName(item.brand)}
                      </p>
                      <Link
                        href={`/producto/${item.slug}`}
                        className="line-clamp-2 text-[14.5px] font-medium leading-snug text-ink hover:text-brand-700"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[12px] text-muted">
                        SKU: {item.sku}
                        {item.referencePrice !== null
                          ? ` · Referencia: ${formatCurrency(item.referencePrice)}`
                          : " · Precio por definir"}
                      </p>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3">
                        <QuantityInput
                          size="sm"
                          max={9999}
                          value={item.quantity}
                          onChange={(value) => setQuantity(item.productId, value)}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setOpenNote(openNote === item.productId ? null : item.productId)
                          }
                          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 hover:text-brand-900"
                        >
                          <Icon name="file-text" size={14} />
                          {item.note ? "Editar nota" : "Agregar nota"}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label={`Quitar ${item.name}`}
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </div>

                      {openNote === item.productId ? (
                        <textarea
                          value={item.note ?? ""}
                          onChange={(event) => setNote(item.productId, event.target.value)}
                          placeholder="Especificaciones, color, configuración o requisitos de entrega…"
                          className="mt-2.5 min-h-20 w-full rounded-lg border border-line px-3 py-2 text-[13px] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      ) : item.note ? (
                        <p className="mt-2 rounded-lg bg-canvas px-3 py-2 text-[12.5px] text-muted">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-canvas px-5 py-4">
            <div>
              <p className="text-[13px] text-muted">Referencia estimada (sin impuestos)</p>
              <p className="text-[18px] font-semibold text-ink">{formatCurrency(referenceTotal)}</p>
            </div>
            <p className="max-w-sm text-[12.5px] leading-relaxed text-muted">
              Es un cálculo con los precios publicados. El precio final por volumen lo confirma el
              asesor en la cotización.
            </p>
          </div>
        ) : null}
      </div>

      {/* Formulario */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-white p-5">
          <h2 className="text-[16px] font-semibold text-ink">Datos de la solicitud</h2>
          <p className="mt-1 text-[13px] text-muted">
            Completa los datos y un asesor responderá con la cotización.
          </p>

          <div className="mt-4 space-y-4">
            <Field label="Empresa o institución" htmlFor="company" required error={errors.company}>
              <Input
                id="company"
                value={form.company}
                onChange={(event) => update("company", event.target.value)}
                autoComplete="organization"
              />
            </Field>
            <Field label="RNC" htmlFor="quote-rnc" error={errors.rnc}>
              <Input
                id="quote-rnc"
                value={form.rnc}
                onChange={(event) => update("rnc", event.target.value)}
                inputMode="numeric"
              />
            </Field>
            <Field label="Nombre del contacto" htmlFor="contactName" required error={errors.contactName}>
              <Input
                id="contactName"
                value={form.contactName}
                onChange={(event) => update("contactName", event.target.value)}
                autoComplete="name"
              />
            </Field>
            <Field label="Correo electrónico" htmlFor="quote-email" required error={errors.email}>
              <Input
                id="quote-email"
                type="email"
                value={form.email}
                onChange={(event) => update("email", event.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field label="Teléfono" htmlFor="quote-phone" required error={errors.phone}>
              <Input
                id="quote-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                placeholder="(809) 000-0000"
                autoComplete="tel"
              />
            </Field>
            <Field label="Departamento" htmlFor="department" hint="Compras, administración, TI, etc.">
              <Input
                id="department"
                value={form.department}
                onChange={(event) => update("department", event.target.value)}
              />
            </Field>
            <Field label="Mensaje" htmlFor="message" hint="Plazos, condiciones de entrega o requisitos.">
              <Textarea
                id="message"
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
              />
            </Field>
          </div>

          <Button type="submit" size="lg" fullWidth className="mt-5" disabled={submitting || items.length === 0}>
            <Icon name="send" size={17} />
            {submitting ? "Enviando…" : "Enviar solicitud de cotización"}
          </Button>

          {items.length === 0 ? (
            <p className="mt-2 text-center text-[12px] text-muted">
              Agrega al menos un producto para enviar la solicitud.
            </p>
          ) : null}
        </form>
      </aside>
    </div>
  );
}
