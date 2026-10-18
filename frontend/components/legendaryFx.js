// Shiny purple background + effects for LEGENDARY stickers.
// Put className="legendary-fx" on a container and render <LegendaryStyle /> once on the page.
// (the container needs position: relative + overflow: hidden, the class adds both)

export const LEGENDARY_CSS = `
.legendary-fx {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  color: #ffffff !important;
  background:
    radial-gradient(circle at 25% 20%, rgba(255,255,255,0.35), transparent 45%),
    linear-gradient(135deg, #4a1d96 0%, #7c3aed 35%, #c084fc 55%, #6d28d9 75%, #3b0f80 100%) !important;
  background-size: 100% 100%, 220% 220% !important;
  animation: zw-legend-shift 6s ease-in-out infinite;
  box-shadow: 0 0 0 1px rgba(233,213,255,0.6), 0 0 18px rgba(168,85,247,0.55) !important;
}
/* light sweep */
.legendary-fx::before {
  content: "";
  position: absolute;
  inset: -20% -60%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%);
  transform: translateX(-60%);
  animation: zw-legend-sweep 3.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
/* twinkling sparkles */
.legendary-fx::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, #fff 0 1.5px, transparent 2.5px),
    radial-gradient(circle, #f5d0fe 0 1.2px, transparent 2.2px),
    radial-gradient(circle, #fff 0 1px, transparent 2px);
  background-size: 46px 46px, 61px 61px, 37px 37px;
  background-position: 6px 10px, 28px 34px, 15px 3px;
  animation: zw-legend-twinkle 2.4s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
  mix-blend-mode: screen;
}
.legendary-fx img { filter: drop-shadow(0 2px 6px rgba(20,0,50,0.5)); position: relative; z-index: 1; }
@keyframes zw-legend-shift { 0%,100% { background-position: 0 0, 0% 50%; } 50% { background-position: 0 0, 100% 50%; } }
@keyframes zw-legend-sweep { 0% { transform: translateX(-60%); } 60%,100% { transform: translateX(60%); } }
@keyframes zw-legend-twinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 0.9; } }
@media (prefers-reduced-motion: reduce) {
  .legendary-fx, .legendary-fx::before, .legendary-fx::after { animation: none; }
}
`;

export function LegendaryStyle() {
  return <style>{LEGENDARY_CSS}</style>;
}

export const isLegendary = (s) => String(s?.rarity || "").toLowerCase() === "legendary";
