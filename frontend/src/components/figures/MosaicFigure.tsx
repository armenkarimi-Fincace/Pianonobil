import type { Pool } from '@/lib/types';

/**
 * The capital pools as squares whose area is their share of the commitment.
 * Two of the six are hatched rather than filled: they are held, not spent.
 */
export function MosaicFigure({ pools }: { pools: Pool[] }) {
  return (
    <>
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="hx" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill="#FFFDF9" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="#5A1420" strokeWidth="1.4" opacity=".4" />
          </pattern>
          <pattern id="px" width="7" height="7" patternUnits="userSpaceOnUse">
            <rect width="7" height="7" fill="#FFFDF9" />
            <line x1="0" y1="0" x2="0" y2="7" stroke="#DED8D0" strokeWidth="1" />
            <line x1="0" y1="0" x2="7" y2="0" stroke="#DED8D0" strokeWidth="1" />
          </pattern>
        </defs>
      </svg>
      <div className="flex flex-wrap items-end gap-7">
        {pools.map((p, i) => {
          const side = Math.max(34, Math.sqrt(p.share) * 13);
          const d = p.drawn / 100;
          const s = Number(side.toFixed(0));
          return (
            <div
              key={i}
              className="flex flex-col items-center"
              style={{ width: Math.max(side, 92) + 'px' }}
            >
              <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} role="img" aria-label={p.n}>
                <rect width={s} height={s} fill={p.held ? 'url(#px)' : 'url(#hx)'} stroke="#DED8D0" />
                {p.held ? null : (
                  <rect
                    y={(side * (1 - d)).toFixed(1)}
                    width={s}
                    height={(side * d).toFixed(1)}
                    fill="#5A1420"
                  />
                )}
                <rect width={s} height={s} fill="none" stroke="#8C8579" strokeWidth=".8" />
              </svg>
              <div className="num mt-[10px] text-[15px] text-maroon">{p.share}%</div>
              <div className="mt-[3px] text-center font-garamond text-[13.5px] leading-[1.35] text-stone">
                {p.n}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
