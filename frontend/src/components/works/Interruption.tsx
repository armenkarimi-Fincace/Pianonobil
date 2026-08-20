'use client';

import { Card, GateNote, QuietBlock } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { MetricBand } from '@/components/shared/Metrics';
import { DISRUPTION } from '@/lib/format';
import { worksTotals } from '@/lib/works';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 04 · The Interruption. A principal building a new institution asks what
 * it costs; one who already holds an institution asks what it costs while it is
 * being changed.
 */
export function Interruption() {
  const s = useAppStore();
  const layers = s.layers();
  const T = worksTotals(layers, s.W.cur, s.W.sel);

  const head = (
    <Head
      title="The Interruption"
      right={T.mig + ' days of parallel running'}
      lede="A principal building a new institution asks what it costs. A principal who already holds one asks what it costs while it is being changed."
    />
  );

  if (!T.count) {
    return (
      <>
        {head}
        <GateNote>No works selected. Return to The Works.</GateNote>
        <Disclaimer />
      </>
    );
  }

  const sequenced = [...T.items].sort((a, b) => a.w.mig - b.w.mig);

  return (
    <>
      {head}

      {s.sub === 'exposure' || !s.sub ? (
        <>
          <MetricBand
            cells={[
              { k: 'Parallel running', v: T.mig + ' days', d: 'old and new systems live together' },
              { k: 'Cutover windows', v: String(T.cut), d: 'each taken at a weekend' },
              {
                k: 'Client attrition',
                v: T.attr[0],
                d: 'a band, not a percentage',
                tone: T.attr[0] === 'Low' ? 'pos' : 'neg',
              },
              {
                k: 'Incident likelihood',
                v: T.inc[0],
                d: 'a band, not a percentage',
                tone: T.inc[0] === 'Low' ? 'pos' : 'neg',
              },
              { k: 'Disciplines touched', v: String(T.discCount), d: 'of ' + layers.length },
              { k: 'Reversible', v: T.dis <= 6 ? 'Yes' : 'Partly', d: 'rollback held per cutover' },
            ]}
          />
          <section>
            <Card lg>
              <p>
                <strong>Client attrition — {T.attr[0]}.</strong> {T.attr[1]}
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Incident likelihood — {T.inc[0]}.</strong> {T.inc[1]}
              </p>
              <QuietBlock className="mt-6">
                <p style={{ margin: 0 }}>
                  The House states bands rather than percentages. A percentage computed without
                  examining your systems is a decoration, and it would breach the House&#8217;s own
                  rule that a figure must be countable.
                </p>
              </QuietBlock>
            </Card>
          </section>
        </>
      ) : s.sub === 'sequence' ? (
        <section>
          <DataTable
            columns={[
              { head: 'Order', width: '70px' },
              { head: 'Discipline', width: '22%' },
              { head: 'Work' },
              { head: 'Parallel run', width: '110px', right: true },
              { head: 'Disruption', width: '110px' },
            ]}
          >
            {sequenced.map((it, i) => (
              <tr key={i}>
                <td className="num">{i + 1}</td>
                <td>{it.name}</td>
                <td>{it.w.to}</td>
                <td className="r num">{it.w.mig ? it.w.mig + ' days' : 'none'}</td>
                <td>
                  <Mark tone={it.w.dis >= 3 ? 'u' : 'ok'}>{DISRUPTION[it.w.dis]}</Mark>
                </td>
              </tr>
            ))}
          </DataTable>
          <p className="meta" style={{ marginTop: '16px' }}>
            Ordered by parallel-running effort. The House sequences the lightest first, so that the
            team is practised before the heaviest cutover.
          </p>
        </section>
      ) : (
        <section>
          <Card lg>
            <span className="eyebrow m">Five disciplines of migration</span>
            <ul style={{ marginTop: '20px' }}>
              <li>Nothing is cut over without a parallel run.</li>
              <li>Every cutover has a written rollback, held for fourteen days.</li>
              <li>Client-facing changes are announced by you, not discovered by them.</li>
              <li>No two migrations run in the same window.</li>
              <li>The House carries the incident line, and it is named.</li>
            </ul>
          </Card>
        </section>
      )}

      <Foot
        message={
          s.W.ack.interruption
            ? 'Acknowledged. The Record freezes everything above into one document.'
            : 'Read this, then continue.'
        }
        label={s.W.ack.interruption ? 'Produce the record' : 'I have read this'}
        onAdvance={() => s.act('wAckInterruption')}
        ready
      />
      <Disclaimer />
    </>
  );
}
