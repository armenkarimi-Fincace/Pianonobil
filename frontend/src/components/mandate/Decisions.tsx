'use client';

import { Card, QuietBlock } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { OptionRow } from '@/components/shared/OptionRow';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { recordDetermination } from '@/lib/api';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

/**
 * Module 04 · Decisions & Approvals. What requires the principal sits above
 * what merely informs the principal. Recording enters an immutable register,
 * which is kept server-side as well as in the session.
 */
export function Decisions() {
  const s = useAppStore();
  const D = s.M.decisions;
  const open = s.M.open ? D.find((d) => d.id === s.M.open) : null;

  async function record() {
    if (!open || s.M.choice === null) return;
    const outcome = open.opts[s.M.choice];
    await recordDetermination({
      session_token: s.sessionToken,
      decision_id: open.id,
      matter: open.t,
      outcome,
    });
    s.act('mRecord');
  }

  if (open) {
    return (
      <>
        <button
          type="button"
          className="eyebrow q"
          style={{ marginBottom: '24px' }}
          onClick={() => s.act('mClose')}
        >
          ← Decision queue
        </button>
        <Head
          title={open.t}
          right={open.id + ' · ' + open.ws}
          lede={'Determination required by ' + open.due + '.'}
        />

        <section>
          <Card lg>
            <span className="eyebrow m">The matter</span>
            <p style={{ marginTop: '12px' }}>{open.ctx}</p>
          </Card>
        </section>

        <section>
          <SectionHeading title="Your options" right="Select one" />
          <div>
            {open.opts.map((o, i) => (
              <OptionRow
                key={i}
                title={String.fromCharCode(65 + i) + ' · ' + o}
                pressed={s.M.choice === i}
                onSelect={() => useAppStore.setState((st) => ({ M: { ...st.M, choice: i } }))}
              />
            ))}
          </div>
        </section>

        <QuietBlock title="The House&#8217;s view">
          <p style={{ marginTop: '10px' }}>{open.view}</p>
        </QuietBlock>

        <Card mar>
          <span className="eyebrow m">Consequence of delay</span>
          <p style={{ marginTop: '10px' }}>{open.cons}</p>
          <div style={{ display: 'flex', gap: '40px', marginTop: '16px', flexWrap: 'wrap' }}>
            <div>
              <div className="eyebrow q">Cost of delay</div>
              <div className="num" style={{ fontSize: '22px', color: 'var(--maroon)', marginTop: '4px' }}>
                +{money(open.money)}
              </div>
            </div>
            <div>
              <div className="eyebrow q">Time</div>
              <div className="num" style={{ fontSize: '22px', color: 'var(--maroon)', marginTop: '4px' }}>
                +{open.days} days
              </div>
            </div>
          </div>
        </Card>

        <div className="foot">
          <span className="l">
            {s.M.choice === null
              ? 'Select an option above to record a determination.'
              : 'Recording enters an immutable register. A determination later reversed appears twice, with both dates.'}
          </span>
          <span>
            <button type="button" className="btn q" onClick={() => s.act('mClose')}>
              Defer with a note
            </button>
            <button
              type="button"
              className={'btn' + (s.M.choice === null ? ' off' : '')}
              disabled={s.M.choice === null}
              onClick={record}
            >
              Determine and record
            </button>
          </span>
        </div>
        <Disclaimer />
      </>
    );
  }

  return (
    <>
      <Head
        title="Decisions & Approvals"
        right={D.length + ' open'}
        lede="What requires the principal sits above what merely informs the principal."
      />

      {s.sub === 'register' ? (
        <section>
          <DataTable
            columns={[
              { head: 'Reference', width: '100px' },
              { head: 'Matter' },
              { head: 'Determined', width: '110px' },
              { head: 'Outcome' },
            ]}
          >
            {!s.M.reg.length ? (
              <tr>
                <td colSpan={4}>Nothing determined yet.</td>
              </tr>
            ) : null}
            {s.M.reg.map((r, i) => (
              <tr key={i}>
                <td className="num">{r.id}</td>
                <td>{r.t}</td>
                <td>{r.on}</td>
                <td>{r.out}</td>
              </tr>
            ))}
          </DataTable>
          <p className="meta" style={{ marginTop: '14px' }}>
            Nothing is deleted from the register. A determination made and later reversed appears
            twice, with both dates.
          </p>
        </section>
      ) : (
        <section>
          <DataTable
            columns={[
              { head: 'Reference', width: '100px' },
              { head: 'Matter' },
              { head: 'By', width: '110px' },
              { head: 'Cost of delay', width: '170px', right: true },
              { head: '', width: '60px', right: true },
            ]}
          >
            {!D.length ? (
              <tr>
                <td colSpan={5}>Nothing awaits your determination.</td>
              </tr>
            ) : null}
            {D.map((d) => (
              <tr key={d.id}>
                <td className="num">{d.id}</td>
                <td>
                  <strong>{d.t}</strong>
                </td>
                <td>{d.due}</td>
                <td className="r num" style={{ color: 'var(--maroon)' }}>
                  +{money(d.money)} · +{d.days}d
                </td>
                <td className="r">
                  <button
                    type="button"
                    className="eyebrow m"
                    onClick={() =>
                      useAppStore.setState((st) => ({
                        M: { ...st.M, open: d.id, choice: null },
                        scrollNonce: st.scrollNonce + 1,
                      }))
                    }
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </section>
      )}
      <Disclaimer />
    </>
  );
}
