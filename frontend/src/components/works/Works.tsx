'use client';

import { Card } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { MetricBand } from '@/components/shared/Metrics';
import { OptionRow } from '@/components/shared/OptionRow';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { DISRUPTION, money } from '@/lib/format';
import { curIndex, GRADE, gradeOf, worksFor, worksTotals } from '@/lib/works';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 03 · The Works. What you run today, set against what the House would
 * undertake. Leaving a discipline alone is a complete answer.
 */
export function Works() {
  const s = useAppStore();
  const layers = s.layers();

  let lay = layers.find((l) => l.key === s.sub);
  if (!lay) lay = layers[0];
  if (!lay) return null;
  const lk = lay.key;

  const T = worksTotals(layers, s.W.cur, s.W.sel);
  const ci = curIndex(layers, s.W.cur, lk);
  const g = gradeOf(layers, s.W.cur, lk);
  const w = worksFor(layers, s.W.cur, lk);
  const idx = layers.findIndex((l) => l.key === lk);
  const next = idx >= 0 && idx < layers.length - 1 ? layers[idx + 1] : null;

  return (
    <>
      <Head
        title={'The Works · ' + lay.name}
        right={GRADE[g]?.n}
        lede="What you run today, set against what the House would undertake."
      />

      <MetricBand
        cells={[
          { k: 'Works selected', v: String(T.count), d: 'across ' + T.discCount + ' disciplines' },
          { k: 'House fees', v: T.fee ? money(T.fee) : '—', d: 'design and implementation' },
          { k: 'Duration', v: T.months ? T.months + ' months' : '—', d: 'run in parallel where possible' },
          { k: 'Migration effort', v: T.mig ? T.mig + ' days' : '—', d: 'parallel running and cutover' },
        ]}
      />

      <section>
        <SectionHeading title="What you run today" right={lay.by} />
        <Card>
          <h3>{ci >= 0 ? lay.options[ci].name : 'Not declared'}</h3>
          <p className="note-t" style={{ marginTop: '12px' }}>
            {ci >= 0 ? lay.options[ci].why : ''}
          </p>
        </Card>
      </section>

      <section>
        <SectionHeading
          title="Available works"
          right={w.length ? 'Select any, or none' : 'Nothing proposed'}
        />
        <div>
          {!w.length ? (
            <Card>
              <p style={{ margin: 0 }}>
                This discipline is already at the strongest configuration the House offers. No work
                is proposed, and none will be invented.
              </p>
            </Card>
          ) : null}
          {w.map((x) => (
            <OptionRow
              key={x.id}
              title={`${x.from} → ${x.to}`}
              why={x.effect}
              pressed={s.W.sel[lk] === x.id}
              onSelect={() => s.toggleWork(lk, x.id)}
              details={[
                { k: 'House fee', v: money(x.fee) },
                { k: 'Duration', v: x.months + ' mo' },
                { k: 'Migration', v: x.mig ? x.mig + ' days' : 'none' },
                { k: 'Disruption', v: DISRUPTION[x.dis] },
              ]}
            />
          ))}
        </div>
      </section>

      {T.count ? (
        <section>
          <SectionHeading
            title="The engagement as it stands"
            right={money(T.fee) + ' · ' + T.months + ' months'}
          />
          <DataTable
            columns={[
              { head: 'Discipline', width: '24%' },
              { head: 'Work' },
              { head: 'Fee', width: '110px', right: true },
              { head: 'Duration', width: '90px', right: true },
              { head: 'Migration', width: '100px', right: true },
            ]}
          >
            {T.items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>
                  {it.w.from} → {it.w.to}
                </td>
                <td className="r num">{money(it.w.fee)}</td>
                <td className="r num">{it.w.months} mo</td>
                <td className="r num">{it.w.mig || '—'}</td>
              </tr>
            ))}
          </DataTable>
        </section>
      ) : null}

      <div className="foot">
        <span className="l">
          {T.count
            ? 'You may continue through the remaining disciplines, or proceed now — the works already selected are enough to state what the change interrupts.'
            : 'Select at least one work before The Interruption opens. You may also leave a discipline alone; that is a complete answer.'}
        </span>
        <span>
          {next ? (
            <button type="button" className="btn q" onClick={() => s.setSub(next.key)}>
              Continue to {next.name}
            </button>
          ) : null}
          <button
            type="button"
            className={'btn' + (T.count ? '' : ' off')}
            disabled={!T.count}
            onClick={() => s.act('wGoInterruption')}
          >
            {T.count ? 'What it interrupts' : 'Locked'}
          </button>
        </span>
      </div>
      <Disclaimer />
    </>
  );
}
