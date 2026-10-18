// Award rosette (scalloped badge + two ribbon tails) in four styles, used for the
// milestone badges on the Collectables page.
//   outline -> navy line art        solid -> navy filled
//   tint    -> blue line art, light fill   duo -> bright blue badge, dark navy centre + tails

const INK = "#1c3f7a"; // navy
const LINE_BLUE = "#2f6db5";
const LIGHT_FILL = "#bcd6f2";
const BRIGHT = "#2b9be0";
const DEEP = "#1e3a78";

// A circle whose edge ripples 12 times, like a rosette.
function scallopPath(cx, cy, radius, lobes = 12, depth = 2.6, steps = 144) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = radius + depth * Math.cos(lobes * a);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const BADGE = scallopPath(50, 44, 33);
const TAIL_LEFT = "M37 68 L24 108 L37 100 L47 112 L54 72 Z";
const TAIL_RIGHT = "M63 68 L76 108 L63 100 L53 112 L46 72 Z";

const VARIANTS = {
  outline: { tail: "#ffffff", tailStroke: INK, badge: "#ffffff", badgeStroke: INK, inner: "none", innerStroke: INK, sw: 3 },
  solid: { tail: INK, tailStroke: INK, badge: INK, badgeStroke: INK, inner: INK, innerStroke: "#ffffff", sw: 3 },
  tint: { tail: "#ffffff", tailStroke: LINE_BLUE, badge: LIGHT_FILL, badgeStroke: LINE_BLUE, inner: "#ffffff", innerStroke: LINE_BLUE, sw: 3 },
  duo: { tail: DEEP, tailStroke: DEEP, badge: BRIGHT, badgeStroke: BRIGHT, inner: DEEP, innerStroke: "#ffffff", sw: 2.5 },
};

export default function Rosette({ variant = "outline", size = 64, style }) {
  const v = VARIANTS[variant] ?? VARIANTS.outline;
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={Math.round((size * 120) / 100)}
      aria-hidden="true"
      style={{ display: "block", ...style }}
    >
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d={TAIL_LEFT} fill={v.tail} stroke={v.tailStroke} strokeWidth={v.sw} />
        <path d={TAIL_RIGHT} fill={v.tail} stroke={v.tailStroke} strokeWidth={v.sw} />
        <path d={BADGE} fill={v.badge} stroke={v.badgeStroke} strokeWidth={v.sw} />
        <circle cx="50" cy="44" r="23" fill={v.inner} stroke={v.innerStroke} strokeWidth={v.sw} />
      </g>
    </svg>
  );
}
