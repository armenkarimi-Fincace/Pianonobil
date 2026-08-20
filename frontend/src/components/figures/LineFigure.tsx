import { money } from '@/lib/format';

export interface Series {
  d: number[];
  c: string;
  fill?: boolean;
  dash?: boolean;
  w?: number;
}

export interface Mark {
  i: number;
  t: string;
}

/**
 * The sixty-month projection. Ported from `figLine()` with the same viewBox,
 * padding, gridline count, tick positions and colour literals, so the drawing
 * is identical rather than merely similar.
 */
export function LineFigure({
  series,
  marks = [],
  h = 240,
}: {
  series: Series[];
  marks?: Mark[];
  h?: number;
}) {
  const W = 740;
  const pl = 64;
  const pr = 16;
  const pt = 16;
  const pb = 28;
  const n = series[0].d.length;

  let max = 0;
  let min = 0;
  for (const s of series) {
    for (const v of s.d) {
      if (v > max) max = v;
      if (v < min) min = v;
    }
  }
  if (max === min) max = min + 1;

  const X = (i: number) => pl + (i / (n - 1)) * (W - pl - pr);
  const Y = (v: number) => pt + (1 - (v - min) / (max - min)) * (h - pt - pb);

  const gridlines = [];
  for (let i = 0; i < 5; i++) {
    const y = pt + (i * (h - pt - pb)) / 4;
    gridlines.push(
      <g key={'g' + i}>
        <line x1={pl} y1={y.toFixed(1)} x2={W - pr} y2={y.toFixed(1)} stroke="#EAE5DC" strokeWidth=".8" />
        <text
          x={pl - 10}
          y={(y + 4).toFixed(1)}
          textAnchor="end"
          fontFamily="Optima,Candara,sans-serif"
          fontSize="10"
          fill="#8C8579"
        >
          {money(max - (i * (max - min)) / 4).replace('USD ', '')}
        </text>
      </g>,
    );
  }

  const ticks = [0, 11, 23, 35, 47, 59];

  return (
    <svg viewBox={`0 0 ${W} ${h}`} role="img" aria-label="Sixty-month projection">
      {gridlines}
      {min < 0 ? (
        <line x1={pl} y1={Y(0).toFixed(1)} x2={W - pr} y2={Y(0).toFixed(1)} stroke="#8C8579" strokeWidth=".9" />
      ) : null}
      {marks.map((m, i) => (
        <g key={'m' + i}>
          <line
            x1={X(m.i).toFixed(1)}
            y1={pt}
            x2={X(m.i).toFixed(1)}
            y2={h - pb}
            stroke="#A9863C"
            strokeWidth=".9"
            strokeDasharray="3 3"
          />
          <text
            x={(X(m.i) + 6).toFixed(1)}
            y={pt + 11}
            fontFamily="Optima,Candara,sans-serif"
            fontSize="9"
            letterSpacing="1.6"
            fill="#A9863C"
          >
            {m.t}
          </text>
        </g>
      ))}
      {series.map((s, i) => {
        let d = '';
        for (let j = 0; j < n; j++) d += (j ? 'L' : 'M') + X(j).toFixed(1) + ',' + Y(s.d[j]).toFixed(1) + ' ';
        return (
          <g key={'s' + i}>
            {s.fill ? (
              <path
                d={`${d}L${X(n - 1).toFixed(1)},${Y(min < 0 ? 0 : min).toFixed(1)} L${X(0).toFixed(1)},${Y(
                  min < 0 ? 0 : min,
                ).toFixed(1)} Z`}
                fill="#5A1420"
                opacity=".07"
              />
            ) : null}
            <path
              d={d}
              fill="none"
              stroke={s.c}
              strokeWidth={s.w || 1.6}
              strokeDasharray={s.dash ? '5 3' : undefined}
            />
          </g>
        );
      })}
      {ticks
        .filter((t) => t < n)
        .map((t, i) => (
          <text
            key={'t' + i}
            x={X(t).toFixed(1)}
            y={h - 8}
            textAnchor="middle"
            fontFamily="Optima,Candara,sans-serif"
            fontSize="10"
            fill="#8C8579"
          >
            M{t + 1}
          </text>
        ))}
    </svg>
  );
}
