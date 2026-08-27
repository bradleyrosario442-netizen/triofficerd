import type { Metadata } from "next";
import { DocPage } from "@/components/ui/doc-page";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Condiciones de uso del sitio web de Tri Office, de las compras en línea y de las solicitudes de cotización.",
  alternates: { canonical: "/legal/terminos" },
};

export default function TerminosPage() {
  return (
    <DocPage
      title="Términos y condiciones"
      intro="Al utilizar este sitio, realizar un pedido o enviar una solicitud de cotización, aceptas las condiciones descritas a continuación."
      crumbs={[{ label: "Legal" }, { label: "Términos y condiciones" }]}
      updatedAt="19 de agosto de 2026"
      sections={[
        {
          heading: "Uso del sitio",
          paragraphs: [
            "El contenido del sitio se ofrece con fines informativos y comerciales. Procuramos que la información de productos, precios y disponibilidad esté actualizada, pero puede variar sin previo aviso.",
          ],
        },
        {
          heading: "Precios y disponibilidad",
          bullets: [
            `Los precios se expresan en pesos dominicanos (${site.currencySymbol}) y no incluyen ITBIS salvo indicación contraria.`,
            "El ITBIS y el costo de envío se calculan en el proceso de checkout.",
            "La disponibilidad mostrada es referencial y se confirma al procesar el pedido.",
            "Los productos marcados como “precio por cotización” dependen de la configuración y el volumen solicitado.",
          ],
        },
        {
          heading: "Pedidos",
          paragraphs: [
            "El envío del formulario de checkout registra una solicitud de pedido. El pedido se considera confirmado cuando un asesor valida disponibilidad, forma de pago y tiempo de entrega. Nos reservamos el derecho de cancelar un pedido cuando exista un error evidente de precio o inventario, informándolo al cliente.",
          ],
        },
        {
          heading: "Cotizaciones empresariales",
          paragraphs: [
            "La solicitud de cotización no constituye una orden de compra ni un compromiso de venta. Es una petición de propuesta comercial. Las condiciones, precios y plazos indicados en la cotización tienen la vigencia que se especifique en el documento emitido por Tri Office.",
          ],
        },
        {
          heading: "Devoluciones y garantía",
          paragraphs: [
            "Las devoluciones se evalúan caso por caso según el estado del producto y el motivo de la solicitud. Los equipos cuentan con la garantía del fabricante conforme a la política publicada en la sección de garantía.",
          ],
        },
        {
          heading: "Propiedad intelectual",
          paragraphs: [
            "Las marcas de terceros mencionadas en el catálogo pertenecen a sus respectivos titulares y se utilizan únicamente para identificar los productos comercializados. Su mención no implica una relación de representación exclusiva salvo que así se indique expresamente.",
          ],
        },
        {
          heading: "Contacto",
          paragraphs: [
            `Para consultas sobre estos términos escribe a ${site.email} o llama al ${site.phone}.`,
          ],
        },
      ]}
    />
  );
}
