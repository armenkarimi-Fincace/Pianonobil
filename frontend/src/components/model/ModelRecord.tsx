'use client';

import { Card, Deep, DottedRow, Plaque } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { commas, money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 07 · The Record. Everything above, frozen into one document and stamped
 * with the model version. Carrying it across opens the Vestibule.
 */
export function ModelRecord() {
  const s = useAppStore();
  const R = s.build({ stress: true });
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;
  const layers = s.layers();
  const rowsMeta = s.catalog.coefficients.rows;
  const unvalidated = rowsMeta.filter((r) => !r.ok).length;
  if (!R || !F || !jur || !s.type || !s.second) return null;

  const shocks = s.catalog.scenarios.filter((sc) => s.stress[sc.k]).map((sc) => sc.n);

  const rows: [string, string][] = [
    ['Family', F.name],
    ['Institution', F.types[s.type].n],
    ['Jurisdiction', jur.n + ' · ' + jur.tn],
    ['Capital committed', money(R.committed)],
    ['Structure requires', money(R.required)],
    [F.unit, commas(R.scale) + ' ' + F.u],
    [F.second.label, F.second.opts[s.second].n],
    ['Time to permission', R.licMonths + ' months'],
    ['Break-even', R.be ? 'month ' + R.be : 'beyond 60 months'],
    ['Shocks applied', shocks.length ? shocks.join(' · ') : 'None'],
    [
      'Passage walked',
      s.P.log.length ? s.P.log.length + ' determinations, opened month ' + s.P.month : 'Not walked',
    ],
    ['Model version', s.catalog.coefficients.version],
  ];

  return (
    <>
      <Deep className="mb-10">
        <span className="eyebrow">
          Model Record · MR-0114 · model {s.catalog.coefficients.version}
        </span>
        <h2 style={{ margin: '12px 0 14px' }}>What you asked the House to model</h2>
        <p style={{ margin: 0, maxWidth: 'var(--measure)' }}>
          A written statement of the specification you set and what the House&#8217;s standing
          assumptions produce from it. {unvalidated} of {rowsMeta.length} inputs are estimates
          awaiting a signed source.
        </p>
      </Deep>

      <section>
        <Card>
          {rows.map(([k, v]) => (
            <DottedRow key={k} label={k} value={v} />
          ))}
        </Card>
      </section>

      <section>
        <SectionHeading title="The specification" right="Nine layers" />
        <DataTable
          columns={[
            { head: 'Layer' },
            { head: 'Specified as' },
            { head: 'Delivered by', width: '120px' },
            { head: 'Build', width: '110px', right: true },
            { head: 'Monthly', width: '110px', right: true },
          ]}
        >
          {layers.map((l) => {
            const o = l.options.find((x) => x.id === s.sel[l.key]);
            if (!o) return null;
            return (
              <tr key={l.key}>
                <td>{l.name}</td>
                <td>{o.name}</td>
                <td>{l.by}</td>
                <td className="r num">{o.capex ? money(o.capex) : '—'}</td>
                <td className="r num">{o.opex ? money(o.opex) : '—'}</td>
              </tr>
            );
          })}
        </DataTable>
      </section>

      <Plaque title="What this record is — and is not">
        <p style={{ marginTop: '10px' }}>
          It is the argument for commissioning the Institutional Blueprint — a paid engagement of
          three to six weeks in which the House examines your actual position and tests these
          assumptions against a real regulator and real counterparties. It is not a substitute for
          it.
        </p>
      </Plaque>

      <div className="foot">
        <span className="l">
          Nothing is committed by carrying this record across. The Vestibule opens an application
          pre-filled from it.
        </span>
        <span>
          <button type="button" className="btn q" onClick={() => s.act('printRecord')}>
            Print the record
          </button>
          <button type="button" className="btn" onClick={() => s.act('carry')}>
            Carry into the Vestibule
          </button>
        </span>
      </div>
      <Disclaimer />
    </>
  );
}
