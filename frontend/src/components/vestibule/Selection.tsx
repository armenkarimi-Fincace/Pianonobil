'use client';

import { Card, Plaque } from '@/components/shared/Blocks';
import { Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { money } from '@/lib/format';
import { worksTotals } from '@/lib/works';
import { useAppStore } from '@/store/useAppStore';

const DOORS: [string, string, string][] = [
  [
    'turnkey',
    'Build an institution',
    'A complete institution — designed, licensed, built, opened and managed by the House. One mandate, one institution.',
  ],
  [
    'single',
    'Engage a capability',
    'You already operate an institution. Engage the House for one discipline, or several. Selection is plural here.',
  ],
];

/**
 * Step 02 · Selection. One question divides the entire client base, and it is
 * asked once. No prices appear here at any depth.
 */
export function Selection() {
  const s = useAppStore();
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const layers = s.layers();

  return (
    <>
      <Head
        title="Selection"
        right={s.V.path ? (s.V.path === 'turnkey' ? 'Turnkey mandate' : 'Single service') : 'One question'}
        lede="One question divides the entire client base, and it is asked once."
      />

      {s.sub === 'path' || !s.sub ? (
        <>
          <div className="doors">
            {DOORS.map((d, i) => (
              <button
                key={d[0]}
                type="button"
                className="door"
                style={s.V.path === d[0] ? { borderColor: 'var(--maroon)' } : undefined}
                onClick={() => s.setPath(d[0])}
              >
                <span className={'eyebrow ' + (s.V.path === d[0] ? 'm' : 'q')}>
                  {i === 0 ? 'Path one' : 'Path two'}
                </span>
                <h3>{d[1]}</h3>
                <p className="note-t" style={{ margin: 0 }}>
                  {d[2]}
                </p>
                {s.V.path === d[0] ? (
                  <div style={{ marginTop: '20px' }}>
                    <Mark tone="u">Selected</Mark>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
          <Plaque title="No prices appear here">
            <p style={{ marginTop: '10px' }}>
              Not a figure, not a range, not the word <em>from</em> — nowhere, at any depth. A
              written Response is prepared by a named senior person after the Requirements Register
              is read, and never before.
            </p>
          </Plaque>
        </>
      ) : (
        <section>
          <SectionHeading
            title={'Scope carried from ' + (s.entry === 'w' ? 'the Works Room' : 'the Model Room')}
          />
          <Card>
            {s.entry === 'w'
              ? (() => {
                  const T = worksTotals(layers, s.W.cur, s.W.sel);
                  return (
                    <p>
                      {T.count} works across {T.discCount} disciplines, carried from Works Record
                      WR-0207. House fees of {money(T.fee)}.
                    </p>
                  );
                })()
              : (() => {
                  const R = s.build({ stress: true });
                  if (!R || !F || !s.type || !s.jur) return null;
                  return (
                    <p>
                      {F.types[s.type].n} in {s.catalog.jurisdictions[s.jur].n}, carried from Model
                      Record MR-0114. {money(R.committed)} committed against a structure requiring{' '}
                      {money(R.required)}.
                    </p>
                  );
                })()}
            <p style={{ marginBottom: 0 }}>
              Your own work is annexed to any agreement that follows. The House contracts to what you
              specified, not to what it proposed.
            </p>
          </Card>
        </section>
      )}

      <Foot
        message={
          s.V.path
            ? 'The path is settled. The Requirements Register records what the institution must do.'
            : 'Choose a path before the Requirements Register opens.'
        }
        label="Open the register"
        onAdvance={() => s.act('vGoRequirements')}
        ready={!!s.V.path}
      />
      <Disclaimer />
    </>
  );
}
