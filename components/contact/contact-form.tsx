"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { submitContactMessage } from "@/lib/services/orders";

const subjects = [
  "Consulta de productos",
  "Cotización empresarial",
  "Estado de un pedido",
  "Facturación",
  "Servicio postventa",
  "Otro",
];

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  subject: subjects[0],
  message: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);

  const update = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) next.name = "Indica tu nombre.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Correo electrónico no válido.";
    if (form.message.trim().length < 10) next.message = "Cuéntanos un poco más (mínimo 10 caracteres).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const result = await submitContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
        subject: form.subject,
        message: form.message.trim(),
      });
      setReference(result.id);
      setForm(initialForm);
    } finally {
      setSubmitting(false);
    }
  };

  if (reference) {
    return (
      <div className="rounded-xl border border-line bg-white p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-fresh-50 text-fresh-600">
          <Icon name="check-circle" size={26} />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-ink">Mensaje enviado</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Recibimos tu mensaje con la referencia{" "}
          <span className="font-semibold text-ink">{reference}</span>. Te responderemos al correo
          indicado durante el horario laboral.
        </p>
        <Button variant="outline" className="mt-5" onClick={() => setReference(null)}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-line bg-white p-5 sm:p-6">
      <h2 className="text-[16px] font-semibold text-ink">Escríbenos</h2>
      <p className="mt-1 text-[13.5px] text-muted">
        Completa el formulario y un asesor te responderá a la brevedad.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="contact-name" required error={errors.name}>
          <Input
            id="contact-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field label="Empresa" htmlFor="contact-company">
          <Input
            id="contact-company"
            value={form.company}
            onChange={(event) => update("company", event.target.value)}
            autoComplete="organization"
          />
        </Field>
        <Field label="Correo electrónico" htmlFor="contact-email" required error={errors.email}>
          <Input
            id="contact-email"
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Teléfono" htmlFor="contact-phone">
          <Input
            id="contact-phone"
            type="tel"
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            autoComplete="tel"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Asunto" htmlFor="contact-subject" required>
            <Select
              id="contact-subject"
              value={form.subject}
              onChange={(event) => update("subject", event.target.value)}
            >
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Mensaje" htmlFor="contact-message" required error={errors.message}>
            <Textarea
              id="contact-message"
              value={form.message}
              onChange={(event) => update("message", event.target.value)}
              placeholder="Cuéntanos qué necesitas: productos, cantidades, plazos…"
            />
          </Field>
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-5" disabled={submitting}>
        <Icon name="send" size={17} />
        {submitting ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
