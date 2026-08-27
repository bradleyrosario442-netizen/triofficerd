# Tri Office — Sitio institucional + tienda en línea

Plataforma web de Tri Office: sitio corporativo, catálogo, tienda en línea y
módulo de cotizaciones empresariales (B2B).

Construido con **Next.js 15 (App Router) · TypeScript · Tailwind CSS 4**.

---

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # compilación de producción
npm start        # servidor de producción
```

Para regenerar las imágenes placeholder del catálogo:

```bash
node scripts/generate-placeholders.mjs
```

---

## Arquitectura

La separación entre **datos**, **servicios**, **estado** y **UI** es
deliberada: la interfaz nunca lee el catálogo directamente.

```
app/                      Rutas (App Router)
  page.tsx                Inicio
  tienda/                 Catálogo con filtros por URL
  categoria/[category]/[subcategory]/
  producto/[slug]/
  carrito/  checkout/  cotizacion/
  empresas/ nosotros/ contacto/ marcas/ cuenta/
  ayuda/    legal/
  api/search/             Búsqueda global (servidor)
  sitemap.ts  robots.ts  not-found.tsx

components/
  layout/     Header, mega menú, navegación móvil, footer, botón WhatsApp
  home/       Secciones de la portada
  product/    Tarjeta, rejilla, carrusel compacto, galería, acciones, precio
  shop/       Filtros, barra de herramientas, chips activos, paginación
  cart/       Carrito lateral y página de carrito
  checkout/   Formulario de compra
  quote/      Constructor de cotización empresarial
  contact/ help/ ui/   Formularios y sistema de componentes base

lib/
  types.ts              Modelo de dominio (Product, Category, Order, QuoteRequest…)
  data/                 DATOS DE DEMOSTRACIÓN (se eliminan al conectar la BD)
  services/             Acceso a datos y reglas de negocio
    catalog.ts          Consultas de catálogo, filtros, orden y búsqueda
    pricing.ts          Subtotales, ITBIS, envío, cupones, descuentos
    orders.ts           Envío de pedidos, cotizaciones y mensajes
    shop-params.ts      Traducción entre la URL y el estado del catálogo
  store/                Estado de cliente (carrito, cotización, paneles de UI)
  utils/                Formato de moneda/fecha y enlaces de WhatsApp
```

### Principios aplicados

- **La UI no conoce el origen de los datos.** Todo pasa por `lib/services/*`.
- **Los filtros viven en la URL.** Cada combinación de categoría, marca, precio,
  disponibilidad, orden, vista y página es una dirección enlazable e indexable.
- **El catálogo no se envía al navegador.** La búsqueda se resuelve en
  `/api/search`; el listado se renderiza en el servidor.
- **Carrito y cotización son módulos distintos**, con estado, almacenamiento y
  flujo propios (ver más abajo).

---

## Carrito vs. cotización empresarial

| | Carrito | Cotización empresarial |
|---|---|---|
| Ruta | `/carrito` → `/checkout` | `/cotizacion` |
| Objetivo | Compra directa con precios publicados | Solicitud de propuesta por volumen |
| Precio | Definido, con ITBIS y envío calculados | Lo confirma un asesor |
| Resultado | Pedido `TO-…` | Solicitud `COT-…` + seguimiento por WhatsApp |
| Estado | `lib/store/cart-context.tsx` | `lib/store/quote-context.tsx` |

Ambos persisten en `localStorage` (`trioffice.cart.v1`, `trioffice.quote.v1`)
para que no se pierdan al recargar la página.

---

## Conectar la base de datos (Supabase)

Los datos de demostración están aislados en `lib/data/`. La migración consiste en:

1. Crear las tablas `categories`, `subcategories`, `brands`, `products`,
   `coupons`, `orders`, `quote_requests` siguiendo `lib/types.ts`.
2. Reimplementar las funciones de `lib/services/catalog.ts` contra Supabase
   **manteniendo las mismas firmas** (pueden volverse `async`; los componentes
   que las consumen ya son *server components*).
3. Sustituir el cuerpo de `submitOrder`, `submitQuote` y `submitContactMessage`
   en `lib/services/orders.ts` por las inserciones reales.
4. Borrar `lib/data/products.ts`, `lib/data/categories.ts`, `lib/data/brands.ts`,
   `lib/data/coupons.ts`, la carpeta `public/img/products/` y
   `scripts/generate-placeholders.mjs`.
5. Habilitar `remotePatterns` en `next.config.ts` para servir las imágenes desde
   Supabase Storage (ya está el comentario en su sitio).

Ningún componente de `components/` debería requerir cambios.

### Pasarela de pago

`/checkout` registra el pedido y devuelve un número de referencia. El punto de
integración es `submitOrder()`: allí se insertaría la creación de la intención de
pago antes de confirmar la orden. Los métodos de pago disponibles se declaran en
`components/checkout/checkout-form.tsx`.

---

## Despliegue en Netlify

El repositorio ya trae `netlify.toml`. En Netlify: **Add new site → Import an
existing project**, se elige este repositorio y la plataforma detecta Next.js e
instala su runtime sola. No hay que tocar el comando ni el directorio.

| Ajuste | Valor |
|---|---|
| Build command | `npm run build` |
| Publish directory | `.next` |
| Node | 22 |

Cada push a `main` publica una versión nueva; las ramas y los pull requests
generan sus propios *deploy previews*.

### Dominio

Mientras no haya dominio propio, `site.url` toma la variable `URL` que Netlify
inyecta, así que canónicas, `sitemap.xml` y JSON-LD apuntan al dominio del
despliegue. Al conectar el definitivo, se define `NEXT_PUBLIC_SITE_URL` en
**Site settings → Environment variables** (ver `.env.example`).

## Identidad visual

La paleta sale del logotipo: **azul `#0B33EE`**, **rojo `#F5003C`** y **verde `#35DD00`**.
Son tres colores saturados, así que el sistema los dosifica:

| Color | Uso |
|---|---|
| Azul (`brand-*`) | Acciones principales, navegación, enlaces y superficies oscuras |
| Rojo (`accent-*`) | Ofertas, descuentos, contador del carrito y avisos de urgencia |
| Verde (`fresh-*`) | Disponibilidad, envío gratis y confirmaciones |

El fondo permanece blanco o gris muy claro (`canvas`), y el tricolor completo solo
aparece en el logotipo y en los filetes de 4 px del hero y la franja empresarial.
Los tonos `-600`/`-700` se usan cuando hay texto encima, para mantener contraste AA.

---

## Contenido de demostración

- **78 productos** ficticios distribuidos en las 7 categorías, con SKU,
  especificaciones, disponibilidad, ofertas y productos "solo cotización".
- **Imágenes placeholder** en `public/img/products/`: ilustraciones vectoriales
  generadas localmente que ocupan el lugar de las fotografías definitivas.
- **Marcas**: `lib/data/brands.ts` define las marcas registradas. Mientras `logo`
  sea `null` se muestra el nombre en texto; no se publica ningún logotipo ni se
  declara ningún acuerdo comercial que no esté cargado explícitamente ahí.

---

## SEO

- Metadatos por página, Open Graph y canónicas.
- URLs limpias: `/categoria/tecnologia/laptops`, `/producto/[slug]`.
- JSON-LD de `Organization`, `LocalBusiness`, `Product`, `BreadcrumbList` y `FAQPage`.
- `sitemap.xml` generado desde el catálogo (192 URLs) y `robots.txt` que excluye
  carrito, checkout, cuenta y API.
- Encabezados jerárquicos y migas de pan en todas las vistas de catálogo.

## Accesibilidad y rendimiento

- Navegación por teclado en buscador (↑ ↓ Enter, `Ctrl/⌘ + K`), menús y paneles.
- `aria-label`, `aria-expanded` y roles en menús, diálogos y controles.
- Enlace "Saltar al contenido" y foco visible en todo el sitio.
- Respeta `prefers-reduced-motion`.
- Sin librerías de UI externas: los iconos y el sistema de diseño son propios.
- First Load JS ≈ 155 kB; 202 páginas prerenderizadas en la compilación.
