import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon, type IconGlyph } from "@/components/ui/icon";
import { Container } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Acceso de clientes de Tri Office.",
  robots: { index: false, follow: true },
};

const features: { icon: IconGlyph; title: string; text: string }[] = [
  { icon: "file-text", title: "Historial de pedidos", text: "Consulta pedidos anteriores y su estado." },
  { icon: "quote", title: "Cotizaciones", text: "Revisa las cotizaciones solicitadas y sus respuestas." },
  { icon: "heart", title: "Favoritos", text: "Guarda los productos que repones con frecuencia." },
  { icon: "refresh", title: "Recompra rápida", text: "Repite un pedido anterior en un clic." },
];

export default function CuentaPage() {
  return (
    <>
      <div className="border-b border-line bg-canvas">
        <Container className="py-8">
          <Breadcrumbs items={[{ label: "Mi cuenta" }]} />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink sm:text-[32px]">
            Mi cuenta
          </h1>
        </Container>
      </div>

      <Container className="py-10 sm:py-14">
        <div className="mx-auto max-w-2xl rounded-xl border border-line bg-white p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <Icon name="user" size={26} />
          </span>
          <h2 className="mt-5 text-xl font-semibold text-ink">Área de clientes en preparación</h2>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
            El acceso con usuario y contraseña se habilitará junto con la conexión a la base de datos.
            Mientras tanto, puedes comprar sin registrarte y solicitar cotizaciones empresariales.
          </p>

          <ul className="mt-7 grid gap-3 text-left sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-3 rounded-lg border border-line p-4">
                <Icon name={feature.icon} size={18} className="mt-0.5 shrink-0 text-brand-700" />
                <span>
                  <span className="block text-[13.5px] font-medium text-ink">{feature.title}</span>
                  <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">
                    {feature.text}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <LinkButton href="/tienda">Ir a la tienda</LinkButton>
            <LinkButton href="/cotizacion" variant="outline">
              Solicitar cotización
            </LinkButton>
          </div>
        </div>
      </Container>
    </>
  );
}
