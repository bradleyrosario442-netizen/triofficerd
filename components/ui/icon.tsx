import type { SVGProps } from "react";

/**
 * Set de iconos de línea propio (24x24, trazo 1.6).
 * Se mantiene local para no cargar una librería completa por 40 glifos.
 */
const paths = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  cart: (
    <>
      <path d="M3 4h2l2.2 11a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 2-1.6L21 8H6" />
      <circle cx="10" cy="20" r="1.2" />
      <circle cx="18" cy="20" r="1.2" />
    </>
  ),
  user: <><circle cx="12" cy="8" r="3.5" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></>,
  menu: <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  close: <><path d="M6 6l12 12M18 6L6 18" /></>,
  "chevron-down": <><path d="m6 9 6 6 6-6" /></>,
  "chevron-up": <><path d="m6 15 6-6 6 6" /></>,
  "chevron-right": <><path d="m9 6 6 6-6 6" /></>,
  "chevron-left": <><path d="m15 6-6 6 6 6" /></>,
  "arrow-right": <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
  "arrow-left": <><path d="M20 12H5" /><path d="m11 18-6-6 6-6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  trash: <><path d="M4 7h16" /><path d="M9 7V5h6v2" /><path d="M6 7l1 13h10l1-13" /><path d="M10 11v6M14 11v6" /></>,
  phone: (
    <path d="M6 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L15.5 12l4 1.5V17a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z" />
  ),
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
  "map-pin": <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z" /><circle cx="12" cy="10" r="2.6" /></>,
  whatsapp: (
    <>
      <path d="M20 11.8A7.9 7.9 0 0 1 8.2 18.9L4 20l1.2-4.1A7.9 7.9 0 1 1 20 11.8z" />
      <path d="M9.2 9.4c.4 2.4 2.4 4.4 4.8 4.8l.9-1.2 1.7.8a3.6 3.6 0 0 1-4-.4 8 8 0 0 1-2.6-2.6 3.6 3.6 0 0 1-.4-4l.8 1.7z" />
    </>
  ),
  check: <><path d="m5 12.5 4.5 4.5L19 7.5" /></>,
  "check-circle": <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></>,
  filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
  sliders: <><path d="M4 8h10M18 8h2M4 16h4M12 16h8" /><circle cx="16" cy="8" r="2" /><circle cx="10" cy="16" r="2" /></>,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  list: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  star: <path d="m12 4 2.3 4.9 5.2.7-3.8 3.7.9 5.3L12 16.1 7.4 18.6l.9-5.3L4.5 9.6l5.2-.7z" />,
  truck: (
    <>
      <path d="M3 6h11v10H3z" />
      <path d="M14 9h4l3 3v4h-7" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  shield: <><path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6z" /><path d="m9 12 2 2 4-4" /></>,
  headset: (
    <>
      <path d="M5 13v-1a7 7 0 0 1 14 0v1" />
      <rect x="3" y="13" width="4" height="6" rx="1.6" />
      <rect x="17" y="13" width="4" height="6" rx="1.6" />
      <path d="M19 19v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
    </>
  ),
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  "file-text": <><path d="M6 3h7l5 5v13H6z" /><path d="M13 3v5h5" /><path d="M9 13h6M9 17h4" /></>,
  quote: <><path d="M5 5h9M5 10h9M5 15h5" /><path d="M17 12v7M13.5 15.5h7" /></>,
  heart: <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8.4 3.8 3.8 0 0 1 19 10.8C19 15.6 12 20 12 20z" />,
  building: (
    <>
      <path d="M4 21V6l7-3v18" />
      <path d="M11 10h9v11" />
      <path d="M14.5 14h2M14.5 17.5h2M7 9.5h1M7 13h1M7 16.5h1" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3.2 3.2 0 0 1 0 6.4" />
      <path d="M17 14.4A6 6 0 0 1 21 19" />
    </>
  ),
  award: <><circle cx="12" cy="9" r="5" /><path d="m8.5 13.5-1 6.5 4.5-2.4 4.5 2.4-1-6.5" /></>,
  zap: <path d="M13 3 5.5 13H11l-1 8 8-10.5h-5.5z" />,
  box: <><path d="m12 3 8 4v10l-8 4-8-4V7z" /><path d="m4 7 8 4 8-4" /><path d="M12 11v10" /></>,
  sparkles: (
    <>
      <path d="m12 4 1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
      <path d="M18 15.5 18.8 18l2.2.8-2.2.8L18 22l-.8-2.4-2.2-.8 2.2-.8z" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3" />
    </>
  ),
  printer: (
    <>
      <path d="M7 9V4h10v5" />
      <rect x="4" y="9" width="16" height="7" rx="2" />
      <path d="M7 14h10v6H7z" />
    </>
  ),
  sofa: (
    <>
      <path d="M4 12V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M3 12a2 2 0 0 1 4 0v3h10v-3a2 2 0 0 1 4 0v6H3z" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9z" />
      <path d="M9 12h6M9 16h4" />
    </>
  ),
  backpack: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <path d="M9 10a3 3 0 0 1 6 0" />
      <path d="M9 15h6v4H9z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.2M12 18.8V21M4.2 7.5l1.9 1.1M17.9 15.4l1.9 1.1M4.2 16.5l1.9-1.1M17.9 8.6l1.9-1.1" />
    </>
  ),
  refresh: <><path d="M20 11a8 8 0 0 0-14-4.5L4 9" /><path d="M4 5v4h4" /><path d="M4 13a8 8 0 0 0 14 4.5L20 15" /><path d="M20 19v-4h-4" /></>,
  tag: <><path d="M3 12V4h8l9 9-8 8z" /><circle cx="7.5" cy="7.5" r="1.4" /></>,
  external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
  send: <><path d="M21 4 3 11l7 3 3 7z" /><path d="m10 14 4-4" /></>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none" /></>,
  facebook: <path d="M14.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5H17.5V4.9A21 21 0 0 0 15.1 4.8c-2.4 0-4 1.4-4 4v2.2H8.7v3h2.4v7z" />,
  instagram: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r=".9" fill="currentColor" stroke="none" /></>,
  linkedin: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 10.5V17M8 7.6v.1M12 17v-3.6a2 2 0 0 1 4 0V17" /></>,
} as const;

export type IconGlyph = keyof typeof paths;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconGlyph;
  size?: number;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
