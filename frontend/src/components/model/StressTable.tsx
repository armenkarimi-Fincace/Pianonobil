'use client';

import { Card, GateNote } from '@/components/shared/Blocks';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { Metrics } from '@/components/shared/Metrics';
import { OptionRow } from '@/components/shared/OptionRow';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { LineFigure } from '@/components/figures/LineFigure';
import { sgn } from '@/lib/format';
import { stressCount, useAppStore } from '@/store/useAppStore';

/**
 * Step 04 · The Stress Table. An institution is not judged by how it performs
 * when conditions are kind, so at least two shocks must be applied.
 */
export function StressTable() {
  const s = useAppStore();
  const R = s.build({ stress: true });
  const C = s.build({ stress: false });
  if (!R || !C) return null;

  const n = stressCount(s);
  const dbe = (R.be || 61) - (C.be || 61);
  const dy5 = R.cum[59] - C.cum[59];

  return (
    <>
      <Head
        title="The Stress Table"
        right={n + ' applied'}
        lede="An institution is not judged by how it performs when conditions are kind."
      />

      {s.sub !== 'effect' ? (
        <section>
          <div>
            {s.catalog.scenarios.map((sc) => (
              <OptionRow
                key={sc.k}
                title={sc.n}
                why={sc.d}
                pressed={!!s.stress[sc.k]}
                onSelect={() => s.toggleShock(sc.k)}
                details={[{ k: 'Status', v: s.stress[sc.k] ? 'Applied' : '—' }]}
              />
            ))}
          </div>
          <div style={{ textAlign: 'right', paddingTop: '16px' }}>
            <button type="button" className="btn q" onClick={() => s.act('clearShocks')}>
              Clear all
            </button>
          </div>
          {n < 2 ? (
            <GateNote>
              <strong>Apply at least two.</strong> A regulatory delay together with a demand
              shortfall is the ordinary case, not the pessimistic one. {n} applied.
            </GateNote>
          ) : null}
        </section>
      ) : null}

      <Metrics R={R} />

      <section>
        <SectionHeading title="Stressed against base" right="Cumulative position" />
        <Card lg>
          <LineFigure
            series={[
              { d: C.cum, c: '#8C8579', dash: true },
              { d: R.cum, c: '#5A1420', fill: true },
            ]}
            marks={[]}
            h={230}
          />
          <p className="fread">
            {n === 0
              ? 'No shocks applied. The two lines are identical, which is the only condition in which they ever will be.'
              : 'The dashed line is base conditions; the solid line is the same institution under the shocks you applied. The distance between them is the argument for the contingency reserve.'}
          </p>
          <div
            className="g3"
            style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--line-soft)' }}
          >
            <div>
              <div className="eyebrow q">Break-even moves</div>
              <div className="v num" style={{ fontSize: '22px', color: 'var(--maroon)', marginTop: '6px' }}>
                {dbe > 0 ? '+' + dbe + ' months' : dbe < 0 ? dbe + ' months' : 'unchanged'}
              </div>
            </div>
            <div>
              <div className="eyebrow q">Five-year position</div>
              <div className="v num" style={{ fontSize: '22px', color: 'var(--maroon)', marginTop: '6px' }}>
                {sgn(dy5)}
              </div>
            </div>
            <div>
              <div className="eyebrow q">Go-live moves to</div>
              <div className="v num" style={{ fontSize: '22px', color: 'var(--maroon)', marginTop: '6px' }}>
                month {R.goLive}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <Foot
        message={
          n >= 2
            ? 'Two or more shocks are applied. The Passage rehearses the first eighteen months, gate by gate.'
            : 'Apply at least two shocks before The Passage opens.'
        }
        label="Walk the passage"
        onAdvance={() => s.act('goPassage')}
        ready={n >= 2}
      />
      <Disclaimer />
    </>
  );
}
