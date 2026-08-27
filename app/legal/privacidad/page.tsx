import type { Metadata } from "next";
import { DocPage } from "@/components/ui/doc-page";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo Tri Office recopila, utiliza y protege los datos personales de sus clientes en el sitio web.",
  alternates: { canonical: "/legal/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <DocPage
      title="Política de privacidad"
      intro="Esta política describe qué datos recopilamos a través del sitio, con qué finalidad los usamos y cómo puedes ejercer tus derechos sobre ellos."
      crumbs={[{ label: "Legal" }, { label: "Política de privacidad" }]}
      updatedAt="19 de agosto de 2026"
      sections={[
        {
          heading: "Datos que recopilamos",
          bullets: [
            "Datos de contacto: nombre, apellido, correo electrónico y teléfono.",
            "Datos de empresa: razón social, RNC y departamento, cuando se indican.",
            "Datos de entrega: provincia, municipio, dirección y referencias.",
            "Información del pedido o de la solicitud de cotización.",
            "Datos técnicos de navegación necesarios para el funcionamiento del sitio.",
          ],
        },
        {
          heading: "Finalidad del tratamiento",
          paragraphs: [
            "Utilizamos los datos para procesar pedidos y solicitudes de cotización, coordinar entregas, emitir comprobantes fiscales, dar seguimiento comercial y atender consultas de servicio postventa.",
          ],
        },
        {
          heading: "Conservación",
          paragraphs: [
            "Conservamos los datos durante el tiempo necesario para cumplir con la finalidad para la que fueron recopilados y con las obligaciones legales y fiscales aplicables en la República Dominicana.",
          ],
        },
        {
          heading: "Compartición con terceros",
          paragraphs: [
            "No vendemos datos personales. Podemos compartir la información estrictamente necesaria con proveedores de transporte para la entrega del pedido y con entidades bancarias o fiscales cuando la operación lo requiere.",
          ],
        },
        {
          heading: "Almacenamiento local en el navegador",
          paragraphs: [
            "El sitio guarda el contenido del carrito y de la lista de cotización en el almacenamiento local de tu navegador para que no se pierdan al recargar la página. Esta información permanece en tu dispositivo y puedes eliminarla borrando los datos del sitio.",
          ],
        },
        {
          heading: "Derechos del titular",
          paragraphs: [
            `Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a ${site.email} o llamando al ${site.phone}. Atenderemos tu solicitud en un plazo razonable.`,
          ],
        },
      ]}
    />
  );
}
