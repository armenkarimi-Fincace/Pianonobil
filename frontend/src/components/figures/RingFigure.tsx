/** A count against a total. Never a percentage — a count can be audited. */
export function RingFigure({ v, total }: { v: number; total: number }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const f = total ? v / total : 0;
  return (
    <svg viewBox="0 0 136 136" style={{ width: '136px' }} role="img" aria-label={`${v} of ${total}`}>
      <circle cx="68" cy="68" r={R} fill="none" stroke="#DED8D0" strokeWidth="1.4" />
      <circle
        cx="68"
        cy="68"
        r={R}
        fill="none"
        stroke="#5A1420"
        strokeWidth="3"
        strokeDasharray={`${(C * f).toFixed(1)} ${C.toFixed(1)}`}
        transform="rotate(-90 68 68)"
      />
      <text x="68" y="70" textAnchor="middle" fontFamily="Optima,Candara,sans-serif" fontSize="30" fill="#5A1420">
        {v}
      </text>
      <text
        x="68"
        y="90"
        textAnchor="middle"
        fontFamily="Optima,Candara,sans-serif"
        fontSize="9"
        letterSpacing="1.8"
        fill="#8C8579"
      >
        OF {total}
      </text>
    </svg>
  );
}
