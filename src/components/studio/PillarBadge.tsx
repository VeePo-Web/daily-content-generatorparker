import { PILLAR_STYLES, type Pillar } from "../../types/content";

export default function PillarBadge({ pillar }: { pillar: string }) {
  const style = PILLAR_STYLES[pillar as Pillar] ?? { bg: "#334155", text: "#94a3b8" };
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {pillar}
    </span>
  );
}
