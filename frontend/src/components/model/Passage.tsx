'use client';

import { Card, QuietBlock } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { MetricBand } from '@/components/shared/Metrics';
import { OptionRow } from '@/components/shared/OptionRow';
import { SpineFigure } from '@/components/figures/SpineFigure';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 05 · The Passage. A rehearsal of the first eighteen months, gate by
 * gate. The matters that arrive are drawn from the specification, not a script.
 */
export function Passage() {
  const s = useAppStore();
  const R = s.build({ stress: true });
  const P = s.P;
  const gates = s.catalog.gates;

  if (s.sub === 'log') {
    return (
      <>
        <Head
          title="Record of the Passage"
          right={P.log.length + ' determinations'}
          lede="Every choice you made, and what it cost."
        />
        <DataTable
          columns={[
            { head: 'Month', width: '70px' },
            { head: 'Gate', width: '60px' },
            { head: 'Matter' },
            { head: 'Your determination' },
            { head: 'Cost', width: '110px', right: true },
            { head: 'Delay', width: '90px', right: true },
          ]}
        >
          {!P.log.length ? (
            <tr>
              <td colSpan={6}>The passage has not begun.</td>
            </tr>
          ) : null}
          {P.log.map((l, i) => (
            <tr key={i}>
              <td className="num">{l.month}</td>
              <td className="num">{l.gate}</td>
              <td>{l.t}</td>
              <td>{l.choice}</td>
              <td className="r num">{l.x ? money(l.x) : '—'}</td>
              <td className="r num">{l.m ? l.m + ' mo' : '—'}</td>
            </tr>
          ))}
        </DataTable>
        <Disclaimer />
      </>
    );
  }

  if (!R) return null;
  const pendingEvent = P.pending ? s.catalog.events.find((e) => e.id === P.pending!.evId) : null;

  return (
    <>
      <Head
        title="The Passage"
        right={P.started ? 'Month ' + P.month + ' · gate ' + P.gate + ' of 6' : 'Not begun'}
        lede="A rehearsal of the first eighteen months, gate by gate. The matters that arrive are drawn from your own specification — not from a script."
      />

      {P.started ? (
        <MetricBand
          cells={[
            { k: 'Month', v: String(P.month), d: 'of the passage' },
            {
              k: 'Gate',
              v: P.gate + ' of 6',
              d: P.gate < 6 ? 'next: ' + gates[P.gate][1] : 'the institution is open',
            },
            {
              k: 'Capital remaining',
              v: money(P.cash),
              d: P.cash < 0 ? 'a capital call is required' : 'of ' + money(R.committed),
              tone: P.cash < 0 ? 'neg' : 'pos',
            },
            { k: 'Determinations', v: String(P.log.length), d: 'recorded in the passage' },
          ]}
        />
      ) : null}

      <Card lg className="mb-8">
        <SpineFigure cur={P.gate} gates={gates} />
      </Card>

      {pendingEvent && P.pending ? (
        <section>
          <div className="gatecard">
            <div className="hd">
              <span className="eyebrow">Gate {P.pending.g} · a matter arises</span>
              <h3>{pendingEvent.t}</h3>
              <p>{pendingEvent.b}</p>
            </div>
            <div style={{ padding: '32px' }}>
              <QuietBlock title="The House&#8217;s view">
                <p style={{ marginTop: '10px' }}>{pendingEvent.v}</p>
              </QuietBlock>
              <div className="sec-h" style={{ marginTop: '24px' }}>
                <span className="eyebrow m">Your determination</span>
                <span className="eyebrow q">Select one</span>
              </div>
              <div>
                {pendingEvent.c.map((ch, i) => (
                  <OptionRow
                    key={i}
                    title={ch.t}
                    why={ch.o}
                    pressed={false}
                    onSelect={() => s.resolvePassage(i)}
                    details={[
                      { k: 'Cost', v: ch.x ? (ch.x > 0 ? money(ch.x) : '−' + money(-ch.x)) : '—' },
                      { k: 'Delay', v: ch.m ? '+' + ch.m + ' mo' : '—' },
                      { k: 'Capacity', v: ch.cap ? '×' + ch.cap.toFixed(2) : '—' },
                    ]}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : P.gate >= 6 ? (
        <section>
          <Card lg style={{ textAlign: 'center' }}>
            <h2>The institution opened in month {P.month}</h2>
            <p className="lede" style={{ margin: '16px auto 24px' }}>
              {P.cash >= 0
                ? 'It opened with ' +
                  money(P.cash) +
                  ' of committed capital unspent, after ' +
                  P.log.length +
                  ' determinations.'
                : 'It opened having required a further ' +
                  money(-P.cash) +
                  ' beyond the original commitment, after ' +
                  P.log.length +
                  ' determinations.'}
            </p>
            <button type="button" className="btn q" onClick={() => s.act('restartPassage')}>
              Walk it again
            </button>
          </Card>
        </section>
      ) : (
        <section>
          <Card lg style={{ textAlign: 'center' }}>
            <span className="eyebrow m">{P.started ? 'Gate ' + (P.gate + 1) + ' of 6' : 'Six gates ahead'}</span>
            <h2 style={{ margin: '12px 0 14px' }}>{gates[P.gate][1]}</h2>
            <p className="note-t" style={{ maxWidth: 'var(--measure)', margin: '0 auto 28px' }}>
              {gates[P.gate][2]}
            </p>
            <button type="button" className="btn" onClick={() => s.act('advancePassage')}>
              {P.started ? 'Advance to gate ' + (P.gate + 1) : 'Begin the passage'}
            </button>
          </Card>
        </section>
      )}

      <Foot
        message={
          P.gate >= 6
            ? 'The passage is complete. The room you would hold is populated from everything above.'
            : 'Walk the passage through all six gates before the next step opens.'
        }
        label="See the room you would hold"
        onAdvance={() => s.act('goPreview')}
        ready={P.gate >= 6}
      />
      <Disclaimer />
    </>
  );
}
