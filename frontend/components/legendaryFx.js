// Shiny purple background + effects for LEGENDARY stickers.
// Put className="legendary-fx" on a container and render <LegendaryStyle /> once on the page.
// (the container needs position: relative + overflow: hidden, the class adds both)

const LEGENDARY_CSS = `
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

// Sparkly golden background + effects for EPIC stickers (same recipe as legendary, in gold).
// Put className="epic-fx" on a container; <LegendaryStyle /> below also supplies this CSS.
const EPIC_CSS = `
.epic-fx {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  color: #4a3000 !important;
  background:
    radial-gradient(circle at 25% 20%, rgba(255,255,255,0.55), transparent 45%),
    linear-gradient(135deg, #b8860b 0%, #f5c542 30%, #fff1a8 50%, #e0a800 70%, #a16d00 100%) !important;
  background-size: 100% 100%, 220% 220% !important;
  animation: zw-epic-shift 6s ease-in-out infinite;
  box-shadow: 0 0 0 1px rgba(255,236,150,0.85), 0 0 18px rgba(245,180,30,0.6) !important;
}
/* light sweep */
.epic-fx::before {
  content: "";
  position: absolute;
  inset: -20% -60%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.7) 50%, transparent 60%);
  transform: translateX(-60%);
  animation: zw-epic-sweep 3.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
/* twinkling sparkles */
.epic-fx::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, #fff 0 1.6px, transparent 2.6px),
    radial-gradient(circle, #fffbe0 0 1.3px, transparent 2.3px),
    radial-gradient(circle, #fff 0 1px, transparent 2px);
  background-size: 44px 44px, 59px 59px, 35px 35px;
  background-position: 8px 12px, 30px 36px, 17px 5px;
  animation: zw-epic-twinkle 2.2s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
.epic-fx img { filter: drop-shadow(0 2px 6px rgba(90,55,0,0.45)); position: relative; z-index: 1; }
@keyframes zw-epic-shift { 0%,100% { background-position: 0 0, 0% 50%; } 50% { background-position: 0 0, 100% 50%; } }
@keyframes zw-epic-sweep { 0% { transform: translateX(-60%); } 60%,100% { transform: translateX(60%); } }
@keyframes zw-epic-twinkle { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .epic-fx, .epic-fx::before, .epic-fx::after { animation: none; }
}
`;

// Shiny red background + gloss sweep for RARE stickers (no sparkle dots, so it reads differently from epic).
// Put className="rare-fx" on a container; <LegendaryStyle /> below also supplies this CSS.
const RARE_CSS = `
.rare-fx {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  color: #ffffff !important;
  background:
    radial-gradient(circle at 25% 18%, rgba(255,255,255,0.5), transparent 42%),
    linear-gradient(135deg, #7f1d1d 0%, #dc2626 32%, #fca5a5 50%, #b91c1c 70%, #7f1d1d 100%) !important;
  background-size: 100% 100%, 220% 220% !important;
  animation: zw-rare-shift 6s ease-in-out infinite;
  box-shadow: 0 0 0 1px rgba(254,202,202,0.7), 0 0 16px rgba(220,38,38,0.5) !important;
}
/* glossy light sweep */
.rare-fx::before {
  content: "";
  position: absolute;
  inset: -20% -60%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%);
  transform: translateX(-60%);
  animation: zw-rare-sweep 3.6s ease-in-out infinite;
  pointer-events: none;
  z-index: 2;
}
.rare-fx img { filter: drop-shadow(0 2px 6px rgba(60,0,0,0.5)); position: relative; z-index: 1; }
@keyframes zw-rare-shift { 0%,100% { background-position: 0 0, 0% 50%; } 50% { background-position: 0 0, 100% 50%; } }
@keyframes zw-rare-sweep { 0% { transform: translateX(-60%); } 60%,100% { transform: translateX(60%); } }
@media (prefers-reduced-motion: reduce) {
  .rare-fx, .rare-fx::before { animation: none; }
}
`;

export function LegendaryStyle() {
  return <style>{LEGENDARY_CSS + EPIC_CSS + RARE_CSS}</style>;
}

export const isRare = (s) => String(s?.rarity || "").toLowerCase() === "rare";
export const isEpic = (s) => String(s?.rarity || "").toLowerCase() === "epic";
export const isLegendary = (s) => String(s?.rarity || "").toLowerCase() === "legendary";
