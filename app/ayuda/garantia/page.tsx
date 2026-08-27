import type { Metadata } from "next";
import { DocPage } from "@/components/ui/doc-page";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Garantía",
  description:
    "Condiciones de garantía de los equipos y productos comercializados por Tri Office, y el procedimiento para solicitarla.",
  alternates: { canonical: "/ayuda/garantia" },
};

export default function GarantiaPage() {
  return (
    <DocPage
      title="Garantía"
      intro="Los equipos comercializados por Tri Office cuentan con la garantía que otorga cada fabricante. Aquí explicamos el alcance y cómo tramitarla."
      crumbs={[{ label: "Ayuda" }, { label: "Garantía" }]}
      sections={[
        {
          heading: "Alcance",
          paragraphs: [
            "La garantía cubre defectos de fabricación bajo condiciones normales de uso, según el plazo y las condiciones que establece el fabricante de cada producto. El plazo aplicable se indica en la ficha del producto o en la documentación que acompaña al equipo.",
          ],
        },
        {
          heading: "Qué no cubre",
          bullets: [
            "Daños por mal uso, golpes, caídas o manipulación indebida.",
            "Daños por variaciones eléctricas, humedad o exposición a condiciones no recomendadas.",
            "Consumibles y piezas de desgaste natural.",
            "Equipos intervenidos por personal no autorizado por el fabricante.",
          ],
        },
        {
          heading: "Cómo solicitarla",
          bullets: [
            "Comunícate con nosotros indicando el número de pedido o factura.",
            "Describe el desperfecto y adjunta evidencia cuando sea posible.",
            "Coordinamos la revisión con el fabricante o el centro de servicio autorizado.",
            "Te informamos el resultado y el procedimiento de reparación, reemplazo o nota de crédito según corresponda.",
          ],
        },
        {
          heading: "Contacto para garantías",
          paragraphs: [
            `Puedes escribirnos a ${site.email} o llamarnos al ${site.phone} durante el horario comercial. También puedes usar el formulario de contacto indicando "Servicio postventa" como asunto.`,
          ],
        },
      ]}
    />
  );
}
