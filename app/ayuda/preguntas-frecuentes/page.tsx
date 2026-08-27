import type { Metadata } from "next";
import { FaqList, type FaqItem } from "@/components/help/faq-list";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre pedidos, cotizaciones empresariales, formas de pago, envíos y facturación en Tri Office.",
  alternates: { canonical: "/ayuda/preguntas-frecuentes" },
};

const faqs: FaqItem[] = [
  {
    question: "¿Cuál es la diferencia entre el carrito y la cotización empresarial?",
    answer:
      "El carrito es para compras directas con precios publicados y pago al confirmar el pedido. La cotización empresarial es una solicitud: agregas los productos y cantidades que necesitas y un asesor responde con precios por volumen, disponibilidad y condiciones de entrega.",
  },
  {
    question: "¿Necesito registrarme para comprar?",
    answer:
      "No. Puedes completar el checkout como invitado indicando tus datos de contacto y entrega. El área de clientes con historial de pedidos se habilitará en una próxima fase.",
  },
  {
    question: "¿Emiten comprobante fiscal?",
    answer:
      "Sí. Indica el RNC de la empresa en el checkout o en la solicitud de cotización y emitimos el comprobante fiscal correspondiente.",
  },
  {
    question: "¿Cuáles son las formas de pago disponibles?",
    answer:
      "Actualmente trabajamos con transferencia bancaria, pago en efectivo, tarjeta contra entrega y cuenta de crédito para clientes empresariales aprobados. El cobro en línea con pasarela de pago se habilitará más adelante.",
  },
  {
    question: "¿Hacen entregas fuera de Santo Domingo?",
    answer:
      "Sí, coordinamos despachos al interior del país. El costo y el tiempo de entrega se confirman según el destino y el volumen del pedido.",
  },
  {
    question: "¿Puedo pedir productos que no aparecen en el catálogo?",
    answer:
      "Sí. El catálogo en línea muestra una parte de lo que podemos suministrar. Envíanos tu requerimiento por el formulario de cotización o por WhatsApp y te confirmamos disponibilidad.",
  },
  {
    question: "¿Qué hago si un producto llega con desperfecto?",
    answer:
      "Comunícate con nosotros dentro del plazo indicado en la política de garantía, con el número de pedido y evidencia del desperfecto. Coordinamos la revisión con el fabricante o el reemplazo según corresponda.",
  },
  {
    question: "¿Manejan compras recurrentes?",
    answer:
      "Sí. Para insumos de reposición constante, como papelería, consumibles de impresión y limpieza, podemos programar entregas periódicas según el consumo de la empresa.",
  },
];

export default function PreguntasFrecuentesPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="border-b border-line bg-canvas">
        <Container className="py-8 sm:py-10">
          <Breadcrumbs items={[{ label: "Ayuda" }, { label: "Preguntas frecuentes" }]} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-[36px]">
            Preguntas frecuentes
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
            Lo que más nos consultan sobre pedidos, cotizaciones, pagos y entregas.
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:gap-12">
          <div className="max-w-3xl">
            <FaqList items={faqs} />
          </div>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-xl border border-line bg-canvas p-5">
              <h2 className="text-[15px] font-semibold text-ink">¿No encuentras tu respuesta?</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                Llámanos al {site.phone} o escríbenos y un asesor te atiende directamente.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <LinkButton href="/contacto" size="sm" fullWidth>
                  Contactar
                  <Icon name="arrow-right" size={15} />
                </LinkButton>
                <LinkButton href="/cotizacion" variant="outline" size="sm" fullWidth>
                  Solicitar cotización
                </LinkButton>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
