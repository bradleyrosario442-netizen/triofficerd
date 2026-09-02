import type { Category, IconName } from "@/lib/types";

/**
 * Taxonomía del catálogo.
 *
 * `sourceMap` traduce cada categoría de origen a la línea y subcategoría de
 * Tri Office, y fija la ilustración que usará el producto mientras no haya
 * fotografía. Es la única fuente: el árbol de categorías se deriva de aquí,
 * así que sumar una línea nueva es sumar una fila.
 */
export interface TaxonomyEntry {
  category: string;
  subcategory: string;
  subcategoryName: string;
  icon: string;
}

export const sourceMap: Record<string, TaxonomyEntry> = {
  // Tecnología
  Laptop: { category: "tecnologia", subcategory: "laptops", subcategoryName: "Laptops", icon: "laptop" },
  Desktop: { category: "tecnologia", subcategory: "desktops", subcategoryName: "Desktops", icon: "desktop" },
  Gaming: { category: "tecnologia", subcategory: "gaming", subcategoryName: "Gaming", icon: "case_pc" },
  Monitor: { category: "tecnologia", subcategory: "monitores", subcategoryName: "Monitores", icon: "monitor" },
  Teclados: { category: "tecnologia", subcategory: "teclados", subcategoryName: "Teclados", icon: "keyboard" },
  Mouse: { category: "tecnologia", subcategory: "mouse", subcategoryName: "Mouse", icon: "mouse" },
  "Audifono Con Microfono": { category: "tecnologia", subcategory: "audifonos", subcategoryName: "Audífonos y diademas", icon: "headset" },
  Bocina: { category: "tecnologia", subcategory: "bocinas", subcategoryName: "Bocinas", icon: "speaker" },
  "Camara Web": { category: "tecnologia", subcategory: "camaras-web", subcategoryName: "Cámaras web", icon: "webcam" },
  "Accesorios De Celular": { category: "tecnologia", subcategory: "accesorios-de-celular", subcategoryName: "Accesorios de celular", icon: "phone_accessory" },
  Celulares: { category: "tecnologia", subcategory: "celulares", subcategoryName: "Celulares", icon: "phone_accessory" },
  Smartwatch: { category: "tecnologia", subcategory: "smartwatch", subcategoryName: "Smartwatch", icon: "smartwatch" },
  "Tablet Y Accesorios": { category: "tecnologia", subcategory: "tablets", subcategoryName: "Tablets y accesorios", icon: "tablet" },
  Television: { category: "tecnologia", subcategory: "televisores", subcategoryName: "Televisores", icon: "tv" },
  "Memoria Usb": { category: "tecnologia", subcategory: "memorias-usb", subcategoryName: "Memorias USB", icon: "usb_drive" },
  "Disco Duro & Ssd": { category: "tecnologia", subcategory: "discos-y-ssd", subcategoryName: "Discos duros y SSD", icon: "hdd" },
  Almacenamiento: { category: "tecnologia", subcategory: "discos-y-ssd", subcategoryName: "Discos duros y SSD", icon: "hdd" },
  "Cpu / Procesadores": { category: "tecnologia", subcategory: "procesadores", subcategoryName: "Procesadores", icon: "cpu_chip" },
  "Tarjeta Madre": { category: "tecnologia", subcategory: "tarjetas-madre", subcategoryName: "Tarjetas madre", icon: "motherboard" },
  "Tarjeta De Video": { category: "tecnologia", subcategory: "tarjetas-de-video", subcategoryName: "Tarjetas de video", icon: "gpu" },
  "Power Supply": { category: "tecnologia", subcategory: "fuentes-de-poder", subcategoryName: "Fuentes de poder", icon: "psu" },
  Cases: { category: "tecnologia", subcategory: "cases", subcategoryName: "Cases", icon: "case_pc" },
  "Abanico Para Cpu": { category: "tecnologia", subcategory: "enfriamiento", subcategoryName: "Enfriamiento", icon: "fan" },
  "Joystick Y Game Pad": { category: "tecnologia", subcategory: "controles-de-juego", subcategoryName: "Controles de juego", icon: "joystick" },
  "Media Cd & Dvd": { category: "tecnologia", subcategory: "medios-opticos", subcategoryName: "Medios ópticos", icon: "disc" },
  "Software Y Licencias": { category: "tecnologia", subcategory: "software", subcategoryName: "Software y licencias", icon: "software" },
  Bateria: { category: "tecnologia", subcategory: "baterias", subcategoryName: "Baterías", icon: "battery" },
  "Bateria Para Laptop": { category: "tecnologia", subcategory: "baterias", subcategoryName: "Baterías", icon: "battery" },
  "Cargador Fuente": { category: "tecnologia", subcategory: "cargadores", subcategoryName: "Cargadores y fuentes", icon: "charger" },
  Soportes: { category: "tecnologia", subcategory: "soportes", subcategoryName: "Soportes", icon: "mount" },
  Ups: { category: "tecnologia", subcategory: "ups", subcategoryName: "UPS y respaldo", icon: "ups" },
  "Camaras De Seguridad": { category: "tecnologia", subcategory: "camaras-de-seguridad", subcategoryName: "Cámaras de seguridad", icon: "camera" },
  Nvr: { category: "tecnologia", subcategory: "nvr", subcategoryName: "NVR y grabadores", icon: "nvr" },
  Switch: { category: "tecnologia", subcategory: "switches", subcategoryName: "Switches", icon: "network_switch" },
  Router: { category: "tecnologia", subcategory: "routers", subcategoryName: "Routers", icon: "router" },
  "Controlador De Red": { category: "tecnologia", subcategory: "controladores-de-red", subcategoryName: "Controladores de red", icon: "network_switch" },
  "Adaptador De Red": { category: "tecnologia", subcategory: "adaptadores-de-red", subcategoryName: "Adaptadores de red", icon: "usb_drive" },
  "Tarjeta De Red": { category: "tecnologia", subcategory: "tarjetas-de-red", subcategoryName: "Tarjetas de red", icon: "gpu" },
  "Patch Cable": { category: "tecnologia", subcategory: "patch-cables", subcategoryName: "Patch cables", icon: "patch_cable" },
  "Patch Panel": { category: "tecnologia", subcategory: "patch-panels", subcategoryName: "Patch panels", icon: "patch_panel" },
  "Rollo Utp": { category: "tecnologia", subcategory: "cable-utp", subcategoryName: "Cable UTP", icon: "utp_roll" },
  Antena: { category: "tecnologia", subcategory: "antenas", subcategoryName: "Antenas", icon: "antenna" },
  Infraestructura: { category: "tecnologia", subcategory: "infraestructura", subcategoryName: "Infraestructura y rack", icon: "rack" },
  "Dell Emc": { category: "tecnologia", subcategory: "servidores", subcategoryName: "Servidores y almacenamiento", icon: "rack" },
  Transmision: { category: "tecnologia", subcategory: "transmision", subcategoryName: "Transmisión", icon: "antenna" },
  "Transmisión": { category: "tecnologia", subcategory: "transmision", subcategoryName: "Transmisión", icon: "antenna" },
  "De Computadora": { category: "tecnologia", subcategory: "accesorios-de-computadora", subcategoryName: "Accesorios de computadora", icon: "accessory" },
  "Senalizacion Y Video Proyeccion": { category: "tecnologia", subcategory: "proyeccion", subcategoryName: "Proyección y señalización", icon: "projector" },
  "Señalización Y Video Proyección": { category: "tecnologia", subcategory: "proyeccion", subcategoryName: "Proyección y señalización", icon: "projector" },
  Handheld: { category: "tecnologia", subcategory: "handheld", subcategoryName: "Terminales handheld", icon: "phone_accessory" },

  // Impresión
  Toner: { category: "impresion", subcategory: "toner", subcategoryName: "Tóner", icon: "toner" },
  Cartuchos: { category: "impresion", subcategory: "cartuchos", subcategoryName: "Cartuchos", icon: "cartridge" },
  "Botella De Tinta": { category: "impresion", subcategory: "botellas-de-tinta", subcategoryName: "Botellas de tinta", icon: "ink_bottle" },
  Inyeccion: { category: "impresion", subcategory: "impresoras-de-inyeccion", subcategoryName: "Impresoras de inyección", icon: "printer" },
  "Inyección": { category: "impresion", subcategory: "impresoras-de-inyeccion", subcategoryName: "Impresoras de inyección", icon: "printer" },
  Laserjet: { category: "impresion", subcategory: "impresoras-laser", subcategoryName: "Impresoras láser", icon: "printer" },
  Designjet: { category: "impresion", subcategory: "plotters", subcategoryName: "Plotters", icon: "printer" },
  Scanner: { category: "impresion", subcategory: "escaneres", subcategoryName: "Escáneres", icon: "scanner" },
  "Accesorio De Impresoras": { category: "impresion", subcategory: "accesorios-de-impresion", subcategoryName: "Accesorios de impresión", icon: "accessory" },
  Consumibles: { category: "impresion", subcategory: "consumibles", subcategoryName: "Consumibles", icon: "cartridge" },

  // Equipos de oficina
  "Caja Registradora": { category: "equipos-de-oficina", subcategory: "cajas-registradoras", subcategoryName: "Cajas registradoras", icon: "calculator" },
  "Aire Acondicionado": { category: "equipos-de-oficina", subcategory: "climatizacion", subcategoryName: "Climatización", icon: "air_conditioner" },
  Hospitality: { category: "equipos-de-oficina", subcategory: "hospitality", subcategoryName: "Hospitality", icon: "clock" },
  "Maquina De Coser": { category: "equipos-de-oficina", subcategory: "maquinas-de-coser", subcategoryName: "Máquinas de coser", icon: "sewing" },
  "Motores Y Bicicletas Electricas": { category: "equipos-de-oficina", subcategory: "movilidad-electrica", subcategoryName: "Movilidad eléctrica", icon: "ebike" },
  "Motores Y Bicicletas Eléctricas": { category: "equipos-de-oficina", subcategory: "movilidad-electrica", subcategoryName: "Movilidad eléctrica", icon: "ebike" },

  // Mobiliario
  Muebles: { category: "mobiliario", subcategory: "mobiliario-de-oficina", subcategoryName: "Mobiliario de oficina", icon: "desk" },

  // Escolares
  "Arte Y Manualidades": { category: "escolares", subcategory: "arte-y-manualidades", subcategoryName: "Arte y manualidades", icon: "crayons" },
  "Bultos Y Mochilas": { category: "escolares", subcategory: "bultos-y-mochilas", subcategoryName: "Bultos y mochilas", icon: "backpack" },
};

/** Cabeceras de línea. El orden define el de la navegación. */
const lines: {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: IconName;
}[] = [
  {
    slug: "tecnologia",
    name: "Tecnología",
    tagline: "Equipos y conectividad",
    description:
      "Cómputo, redes, seguridad electrónica, audio y accesorios para equipar puestos de trabajo completos.",
    icon: "cpu",
  },
  {
    slug: "impresion",
    name: "Impresión",
    tagline: "Equipos y consumibles",
    description:
      "Impresoras, escáneres, tóner, cartuchos y tinta para sostener el volumen de impresión de la operación.",
    icon: "printer",
  },
  {
    slug: "equipos-de-oficina",
    name: "Equipos de oficina",
    tagline: "Máquinas de apoyo",
    description:
      "Equipamiento de punto de venta, climatización y máquinas de apoyo para áreas administrativas.",
    icon: "settings",
  },
  {
    slug: "mobiliario",
    name: "Mobiliario",
    tagline: "Equipamiento de espacios",
    description: "Escritorios, sillas y almacenamiento para armar o renovar espacios de trabajo.",
    icon: "sofa",
  },
  {
    slug: "escolares",
    name: "Escolares",
    tagline: "Útiles y didácticos",
    description: "Materiales de arte, manualidades y bultos para centros educativos, colmados y hogares.",
    icon: "backpack",
  },
];

/** Árbol de categorías derivado del mapa: una sola fuente de verdad. */
export const categories: Category[] = lines.map((line) => {
  const subs = new Map<string, string>();
  for (const entry of Object.values(sourceMap)) {
    if (entry.category === line.slug) subs.set(entry.subcategory, entry.subcategoryName);
  }
  return {
    ...line,
    highlighted: true,
    subcategories: [...subs].map(([slug, name]) => ({ slug, name })),
  };
});
