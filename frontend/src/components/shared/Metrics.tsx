import type { ReactNode } from 'react';
import { money } from '@/lib/format';
import type { BuildResult } from '@/lib/types';

export interface MetricCell {
  k: ReactNode;
  v: string;
  d: ReactNode;
  /** Tints the description line, as the committed-capital cell does. */
  tone?: 'pos' | 'neg';
}

/**
 * The metric band. The `.sm` class kicks in above thirteen characters exactly
 * as it did originally, which is what keeps long USD figures on one line.
 */
export function MetricBand({ cells }: { cells: MetricCell[] }) {
  return (
    <div className="metrics">
      {cells.map((c, i) => (
        <div key={i}>
          <div className="k">{c.k}</div>
          <div className={'v' + (String(c.v).length > 13 ? ' sm' : '')}>{c.v}</div>
          <div className={'d' + (c.tone ? ' ' + c.tone : '')}>{c.d}</div>
        </div>
      ))}
    </div>
  );
}

/** The six standing metrics derived from a build result. */
export function Metrics({ R }: { R: BuildResult | null }) {
  if (!R) return null;
  const cells: MetricCell[] = [
    { k: 'Structure requires', v: money(R.required), d: 'total capital the structure needs' },
    {
      k: 'You have committed',
      v: money(R.committed),
      d: R.gap >= 0 ? 'surplus ' + money(R.gap) : 'shortfall ' + money(-R.gap),
      tone: R.gap >= 0 ? 'pos' : 'neg',
    },
    { k: 'Time to permission', v: R.licMonths + ' months', d: 'go-live at month ' + R.goLive },
    { k: 'Steady revenue', v: money(R.steady) + '/mo', d: 'capacity ×' + R.capacity.toFixed(2) },
    { k: 'Monthly cost', v: money(R.opexM), d: 'at full complement' },
    {
      k: 'Break-even',
      v: R.be ? 'month ' + R.be : 'beyond 60 months',
      d: R.be ? 'month ' + (R.be - R.goLive) + ' of trading' : 'on these parameters',
    },
  ];
  return <MetricBand cells={cells} />;
}
