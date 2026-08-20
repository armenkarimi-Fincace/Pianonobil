import type { Gate } from '@/lib/types';

/** The six gates as a spine. `cur` is the number of gates already passed. */
export function SpineFigure({ cur, gates }: { cur: number; gates: Gate[] }) {
  const W = 740;
  const pad = 54;
  const step = (W - pad * 2) / 5;

  return (
    <svg viewBox={`0 0 ${W} 80`} role="img" aria-label="Six gates">
      <line x1={pad} y1="42" x2={W - pad} y2="42" stroke="#DED8D0" strokeWidth="1" />
      {cur > 0 ? (
        <line
          x1={pad}
          y1="42"
          x2={(pad + (cur - 1) * step).toFixed(1)}
          y2="42"
          stroke="#5A1420"
          strokeWidth="1.6"
        />
      ) : null}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = pad + i * step;
        const done = i < cur;
        const now = i === cur;
        return (
          <g key={i}>
            {now ? (
              <>
                <circle cx={x.toFixed(1)} cy="42" r="8" fill="#F9F8F5" stroke="#5A1420" strokeWidth="1.5" />
                <circle cx={x.toFixed(1)} cy="42" r="3.4" fill="#5A1420" />
              </>
            ) : (
              <circle
                cx={x.toFixed(1)}
                cy="42"
                r={done ? 6 : 4.5}
                fill={done ? '#5A1420' : '#F9F8F5'}
                stroke="#5A1420"
                strokeWidth="1"
              />
            )}
            <text
              x={x.toFixed(1)}
              y="22"
              textAnchor="middle"
              fontFamily="Optima,Candara,sans-serif"
              fontSize="10"
              letterSpacing="1.6"
              fill={done || now ? '#A9863C' : '#8C8579'}
            >
              {i + 1}
            </text>
            <text
              x={x.toFixed(1)}
              y="66"
              textAnchor="middle"
              fontFamily="Cormorant Garamond,Georgia,serif"
              fontSize="14"
              fill="#5A544E"
            >
              {gates[i][1].split(' ')[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
