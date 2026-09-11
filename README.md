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

## Cotización, no carrito

El catálogo no publica precios, así que no hay compra directa ni checkout. Cada
producto ofrece dos caminos:

| | WhatsApp | Lista de cotización |
|---|---|---|
| Dónde | Botón **COTIZAR** en tarjeta y ficha | Botón **Agregar a mi cotización** en la ficha |
| Para qué | Consultar un producto puntual | Armar un requerimiento de varias líneas |
| Resultado | Chat con el producto y su número de parte | Solicitud `COT-…` con los datos de la empresa |

La lista persiste en `localStorage` (`trioffice.quote.v1`) para que no se pierda
al recargar. El módulo de carrito y checkout sigue en el repositorio, sin
enlaces en la interfaz, listo para el día en que haya precios publicados.

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

## El catálogo

La fuente es `data/products.json`, que produce `scripts/import-catalog.mjs`.
Cada entrada tiene cuatro campos y ninguno más:

```json
{
  "brand": "HP",
  "name": "IMPRESORA LASERJET M111W PRINTER",
  "model": "7MD68A",
  "sourceCategory": "Laserjet"
}
```

**No existe campo de precio ni de descripción.** El importador solo tiene
expresiones para esos cuatro datos, así que precios, textos comerciales,
promociones e inventario no pueden llegar al archivo. En el destino, cada
producto se construye con `price: null` y `quoteOnly: true`.

El campo `model` se valida antes de publicarse. Unas veces trae el código real
con anotaciones pegadas —`210-BCTG (I7,256SSD)***`— y basta limpiarlo; otras
trae el código de almacén del proveedor —`NYS-PD-600G4-I5-8-2-2`— o texto
descriptivo, que no identifica al producto ante ningún fabricante y no se
publica. Resultado: 2.646 productos (92,5 %) muestran número de parte; los 216
restantes no muestran ninguno.

`lib/data/taxonomy.ts` traduce cada categoría de origen a la línea y
subcategoría de Tri Office, y fija qué ilustración usa el producto. Es la única
fuente: el árbol de categorías se deriva de ese mapa.

### Imágenes

Mientras no haya fotografías, cada producto muestra la ilustración vectorial
que corresponde a su tipo.

**La vía normal es el panel** (`/admin/fotos`, ver más abajo): se arrastra la
carpeta y listo, sin tocar el repositorio ni volver a desplegar. Lo que sigue es
la alternativa desde el repositorio; si un producto tiene fotos en ambos
lados, mandan las del panel.

Para cargar fotos desde el repositorio:

1. Deja los archivos en `public/img/fotos/`, nombrados con el **número de parte
   del fabricante** o con el identificador del producto. Mayúsculas, guiones y
   guiones bajos son indiferentes:

   ```
   7MD68A.webp        → HP Impresora LaserJet M111w
   W1105A.webp        → HP Tóner 105A
   hp-7md68a.webp     → también funciona
   ```

   **Varias fotos del mismo producto**: se añade `-1`, `-2`, `-3`. La primera
   es la que sale en las tarjetas del catálogo; el resto aparece como
   miniaturas en la ficha, que ya sabe mostrarlas.

   ```
   7MD68A-1.webp      → frontal, portada del producto
   7MD68A-2.webp      → lateral
   7MD68A-3.webp      → detalle del panel
   ```

   El sufijo se distingue del número de parte porque primero se prueba el
   nombre completo: `TL-SF1005D.webp` resuelve al switch TP-Link y
   `TL-SF1005D-2.webp` a su segunda foto.

2. Ejecuta `npm run imagenes`.

El script asocia cada archivo con su producto, escribe `data/product-images.json`
y reporta los que no encontraron pareja. Los productos sin foto siguen con su
ilustración, así que se pueden cargar de a poco.

**El collage de la portada** funciona igual: los archivos van en
`public/img/hero/fotos/`, de dos a cuatro, **con fondo transparente** (PNG o
WebP). El número inicial del nombre define el orden. Si la carpeta está vacía se
usan las ilustraciones.

Formato recomendado: WebP, 1000 × 1000 px, bajo 150 KB.

#### De dónde salen las fotos

Aproximadamente la mitad del catálogo son marcas internacionales —HP, Epson,
Lenovo, Dell, Canon, Brother, Logitech, TP-Link— con ficha en los catálogos de
contenido del sector. Con el número de parte ya cargado, un servicio como Icecat
las entrega con licencia de uso para revendedores.

La otra mitad son marcas de distribuidor o regionales que no publican ficha:
ahí la vía es el paquete de medios del propio distribuidor o fotografía propia.
No se descargan imágenes de terceros sin esa autorización.

---

## Panel de administración

En `/admin`. Sirve para subir fotos —una por una o miles de golpe—, crear
productos, retirarlos del sitio y corregir nombre, marca, número de parte,
categoría y descripción. También permite destacar productos en la portada.
Cada cambio se publica al guardarlo: no hace falta volver a desplegar.

### Activarlo

El panel viene cerrado. Para abrirlo, desde la carpeta del proyecto y en
PowerShell o CMD:

```
npm run admin:clave
```

Pide la contraseña dos veces sin mostrarla (mínimo 12 caracteres) y guarda en
Netlify, solo para producción, dos variables: `ADMIN_PASSWORD_HASH` —el hash
scrypt, nunca la contraseña— y `ADMIN_SESSION_SECRET`, una clave aleatoria
para firmar las sesiones. Después hay que volver a desplegar (**Deploys →
Trigger deploy**) para que el sitio las lea. Repetirlo cambia la contraseña y
cierra todas las sesiones abiertas.

Para probar en local: `npm run admin:clave -- --local`, que las escribe en
`.env.local`. En local los datos se guardan en `.data/`, así que nada de lo que
se haga ahí llega al sitio publicado.

### Dónde viven los datos

En **Netlify Blobs**, el almacén del propio sitio: no hay base de datos ni
cuenta aparte. `data/products.json` no se modifica nunca; el panel guarda por
encima solo lo que cambió (`lib/admin/overlay.ts`) y el sitio combina las dos
capas al leer (`lib/services/catalog.ts`). Por eso:

- Retirar un producto importado es reversible (**Productos → Eliminados →
  Restaurar**). Los creados en el panel sí se borran del todo, con sus fotos.
- «Revertir a los datos importados» descarta las ediciones de un producto.
- Volver a escribir el valor original de un campo deshace ese cambio.

Si se vuelve a importar el catálogo con `npm run catalog`, los identificadores
deben seguir siendo los mismos para que las ediciones sigan en su producto:
salen de marca + número de parte, así que solo cambian si cambia uno de los dos.

Blobs no está disponible durante `next build`. El plugin local
`netlify/plugins/catalogo-snapshot` corre antes y copia los cambios a
`data/.snapshot/`, para que las páginas estáticas nazcan con ellos. Si no
puede leerlos, detiene el deploy en vez de publicar un sitio sin lo hecho en el
panel; la versión anterior sigue en línea.

### Fotos

El navegador endereza cada foto, la reduce a 1600 px (y a 480 px para
tarjetas y miniaturas) y la convierte a WebP antes de subirla. Netlify corta
las peticiones de más de 6 MB y su optimizador no procesa imágenes servidas
por una función, así que hacerlo en el servidor no era opción. Cada foto se
guarda con un nombre único, así que se cachea un año sin riesgo de servir una
vieja.

La subida masiva empareja por nombre con el mismo criterio que
`npm run imagenes` —número de parte o id, `-1`/`-2` para varias, y también el
`(2)` que pone Windows al duplicar— y muestra antes de subir cuáles no tienen
producto. Por defecto reemplaza las fotos que ya tenía cada producto. Máximo
12 por producto.

---

## Seguridad

### Superficie real

No hay cuentas de clientes ni base de datos. Los formularios de contacto,
cotización y checkout no llegan a ningún servidor: `lib/services/orders.ts`
genera la referencia en el navegador.

Lo que ejecuta código en el servidor: `/api/search` (público), `/fotos/*`
(público, solo lectura) y el panel, `/admin` y `/api/admin/*`, que es la única
parte con sesión y con escritura.

### Panel de administración

- **Contraseña**: solo existe su hash scrypt (N = 2¹⁵), en una variable de
  Netlify marcada como secreta. Nada en el repositorio. Sin las dos variables
  el panel no abre: no hay contraseña por defecto.
- **Sesión**: cookie `__Host-` firmada con HMAC-SHA256, `HttpOnly`, `Secure`,
  `SameSite=Strict`, de 8 horas. La firma incluye una huella del hash, así que
  cambiar la contraseña invalida las sesiones abiertas.
- **Cada endpoint comprueba sesión y origen** (`lib/admin/http.ts`); las
  páginas llaman a `requireAdmin()` antes de leer datos. No depende de un
  middleware que se pueda saltar.
- **Intentos**: 5 fallos en 15 minutos bloquean esa IP 15 minutos. El contador
  vive en Blobs, no en memoria, así que vale entre instancias. La IP no se
  guarda, solo una huella firmada.
- **Subidas**: el formato se decide por los primeros bytes, no por la
  extensión ni por lo que declara el navegador. Solo WebP, JPEG y PNG —SVG no,
  que puede llevar código—. Ids y nombres de archivo se validan con listas
  cerradas antes de formar cualquier ruta.
- **Textos**: se limpian caracteres de control y se limitan en longitud. React
  los escapa al pintar y el JSON-LD pasa por `jsonLd()`. Probado con
  `<script>` e `<img onerror>` en la descripción.
- `/admin` lleva `noindex`, `no-store` y está excluido en `robots.txt`.

Queda fuera de alcance: un ataque de fuerza bruta repartido entre miles de IP.
Lo frena la lentitud de scrypt y una contraseña larga; para más, Netlify Rate
Limiting o un WAF.

### Cabeceras

`next.config.ts` emite las cabeceras para el runtime y `netlify.toml` las repite
para los archivos que sirve la CDN sin pasar por él. **Ambas listas deben
mantenerse iguales.**

CSP, HSTS (solo producción), `X-Frame-Options: DENY`, `nosniff`,
`Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`.

`script-src` admite `'unsafe-inline'` a conciencia: el App Router entrega el
árbol de React en bloques en línea y bloquearlos rompe la hidratación. La
alternativa —un nonce por petición desde un middleware— obliga a renderizar
todo bajo demanda y costaría las 91 páginas estáticas. El razonamiento completo
está en el comentario de `next.config.ts`. Si algún día se publica contenido de
usuario, hay que pasar al nonce.

### JSON-LD

`lib/utils/json-ld.ts` escapa `<`, `>`, `&`, U+2028 y U+2029 antes de inyectar
datos estructurados en un `<script>`. `JSON.stringify` no lo hace, y los textos
del catálogo vienen de una fuente externa: un nombre de producto con `</script>`
bastaría para ejecutar código en cada visita. **Todo JSON-LD debe pasar por esta
función, nunca por `JSON.stringify` directo.**

### /api/search

Tres topes: 80 caracteres de consulta, 10 términos y 60 peticiones por minuto
por IP. Sin ellos, una consulta larga cuyos términos coincidan con casi todo
obliga a recorrer los 2.862 productos una vez por término.

El limitador vive en la memoria del proceso: en Netlify cada instancia tiene el
suyo, así que frena el abuso de un cliente pero **no sustituye a un limitador en
el borde**. Para protección real ante un ataque distribuido hace falta Netlify
Rate Limiting o un WAF por delante.

### Dependencias

`npm audit` limpio. `postcss` se fija con `overrides` a `^8.5.28`: Next 15
arrastra 8.4.31, que tiene avisos de XSS y lectura de archivos vía
`sourceMappingURL`. No son explotables aquí —PostCSS solo procesa CSS propio en
compilación— pero el override los cierra sin subir a Next 16, que es un cambio
mayor.

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
