import type { Metadata } from "next";
import { DocPage } from "@/components/ui/doc-page";
import { site } from "@/lib/data/site";
import { formatCurrency } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Envíos y entregas",
  description:
    "Condiciones de envío, retiro en tienda, cobertura y tiempos de entrega de los pedidos de Tri Office.",
  alternates: { canonical: "/ayuda/envios" },
};

export default function EnviosPage() {
  return (
    <DocPage
      title="Envíos y entregas"
      intro="Cómo coordinamos la entrega de los pedidos, la cobertura disponible y las condiciones de despacho."
      crumbs={[{ label: "Ayuda" }, { label: "Envíos" }]}
      sections={[
        {
          heading: "Cobertura",
          paragraphs: [
            "Realizamos entregas en el Gran Santo Domingo y coordinamos despachos hacia el interior del país. Para destinos fuera del área metropolitana, el costo y el tiempo de entrega se confirman al procesar el pedido según el volumen y el destino.",
          ],
        },
        {
          heading: "Costo de envío",
          bullets: [
            `Envío estándar dentro del Gran Santo Domingo: ${formatCurrency(site.standardShipping)}.`,
            `Envío gratis en pedidos desde ${formatCurrency(site.freeShippingThreshold)}.`,
            "Pedidos de mobiliario o alto volumen: el costo se cotiza según las dimensiones y el acceso al lugar de entrega.",
            "Retiro en tienda: sin costo.",
          ],
        },
        {
          heading: "Tiempos de entrega",
          paragraphs: [
            "Los productos disponibles en almacén se despachan dentro de los días laborables siguientes a la confirmación del pedido. Los productos bajo pedido, el mobiliario configurable y los artículos personalizados tienen un tiempo de preparación que se informa en la cotización.",
          ],
        },
        {
          heading: "Retiro en tienda",
          paragraphs: [
            `Puedes retirar tu pedido en ${site.address.street}, ${site.address.sector}, ${site.address.city}. Te avisamos por teléfono o correo cuando esté listo. El horario de retiro corresponde al horario comercial publicado.`,
          ],
        },
        {
          heading: "Recepción del pedido",
          bullets: [
            "Verifica la mercancía al momento de la entrega.",
            "Reporta cualquier faltante o daño visible en el momento de la recepción.",
            "Para entregas en empresas, indica el contacto y el horario de recepción en las notas del pedido.",
          ],
        },
      ]}
    />
  );
}
