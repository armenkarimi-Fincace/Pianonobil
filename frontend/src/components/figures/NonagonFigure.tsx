import type { Layer } from '@/lib/types';

const RAD = Math.PI / 180;

/**
 * The nine layers as a radar. In the Model Room the reach of each corner is
 * how heavy a configuration has been specified; in the Works Room it is the
 * grade the House assigns to what is run today, and short corners turn red.
 */
export function NonagonFigure({
  layers,
  /** layer key -> selected option id (Model Room) */
  sel,
  /** Set count shown in the centre; omitted in the Works variant. */
  centreCount,
  /** layer key -> grade 0..4 (Works Room). When present, the graded variant is drawn. */
  grades,
}: {
  layers: Layer[];
  sel?: Record<string, string>;
  centreCount?: number;
  grades?: Record<string, number>;
}) {
  const graded = !!grades;
  const N = layers.length;
  const cx = graded ? 290 : 250;
  const cy = graded ? 196 : 200;
  const R = graded ? 88 : 104;
  const viewBox = graded ? '0 0 580 376' : '0 0 500 382';
  const labelK = graded ? 1.3 : 1.26;

  const pt = (i: number, k: number): [number, number] => {
    const a = -90 + (i / N) * 360;
    return [cx + R * k * Math.cos(a * RAD), cy + R * k * Math.sin(a * RAD)];
  };

  const rings = [0.34, 0.56, 0.78, 1];

  const inner: string[] = [];
  for (let i = 0; i < N; i++) {
    let k: number;
    if (graded) {
      k = [0.22, 0.34, 0.56, 0.78, 1][grades![layers[i].key] ?? 0];
    } else {
      const id = sel?.[layers[i].key];
      k = 0.3;
      if (id) {
        for (let j = 0; j < layers[i].options.length; j++) {
          if (layers[i].options[j].id === id) {
            k = 0.42 + (j / (layers[i].options.length - 1 || 1)) * 0.58;
          }
        }
      }
    }
    inner.push(
      pt(i, k)
        .map((v) => v.toFixed(1))
        .join(','),
    );
  }

  return (
    <svg viewBox={viewBox} role="img" aria-label={graded ? 'Standing of the nine disciplines' : 'Nine layers'}>
      {rings.map((k, j) => (
        <polygon
          key={j}
          points={Array.from({ length: N }, (_, i) =>
            pt(i, k)
              .map((v) => v.toFixed(1))
              .join(','),
          ).join(' ')}
          fill="none"
          stroke="#EAE5DC"
          strokeWidth=".7"
        />
      ))}
      <polygon points={inner.join(' ')} fill="rgba(90,20,32,.08)" stroke="#5A1420" strokeWidth="1.3" />
      {layers.map((layer, i) => {
        const p = pt(i, 1);
        const l = pt(i, labelK);
        const weak = graded ? (grades![layer.key] ?? 0) <= 2 : false;
        const set = graded ? !weak : !!sel?.[layer.key];
        const anchor = l[0] > cx + 8 ? 'start' : l[0] < cx - 8 ? 'end' : 'middle';
        return (
          <g key={layer.key}>
            <line
              x1={cx}
              y1={cy}
              x2={p[0].toFixed(1)}
              y2={p[1].toFixed(1)}
              stroke="#EAE5DC"
              strokeWidth=".5"
            />
            <rect
              x={(p[0] - 4).toFixed(1)}
              y={(p[1] - 4).toFixed(1)}
              width="8"
              height="8"
              transform={`rotate(45 ${p[0].toFixed(1)} ${p[1].toFixed(1)})`}
              fill={set ? '#5A1420' : '#F9F8F5'}
              stroke={graded ? (weak ? '#8C3A28' : '#5A1420') : set ? '#5A1420' : '#8C8579'}
            />
            <text
              x={l[0].toFixed(1)}
              y={(l[1] + 4).toFixed(1)}
              textAnchor={anchor}
              fontFamily="Cormorant Garamond,Georgia,serif"
              fontSize={graded ? '12.5' : '13.5'}
              fill={graded ? (weak ? '#8C3A28' : '#1B1B1B') : set ? '#1B1B1B' : '#8C8579'}
            >
              {layer.name}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={graded ? 26 : 28} fill="#F9F8F5" stroke="#A9863C" />
      {graded ? (
        <text
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          fontFamily="Optima,Candara,sans-serif"
          fontSize="22"
          fill="#5A1420"
        >
          {N}
        </text>
      ) : (
        <>
          <text
            x={cx}
            y={cy + 2}
            textAnchor="middle"
            fontFamily="Optima,Candara,sans-serif"
            fontSize="24"
            fill="#5A1420"
          >
            {centreCount ?? 0}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            fontFamily="Optima,Candara,sans-serif"
            fontSize="8"
            letterSpacing="1.4"
            fill="#8C8579"
          >
            OF {N}
          </text>
        </>
      )}
    </svg>
  );
}
