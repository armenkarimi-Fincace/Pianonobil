'use client';

import { Card, Deep, DottedRow, Plaque } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { money } from '@/lib/format';
import { gradeOf, worksTotals } from '@/lib/works';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 05 · The Works Record. A written statement, not a diagnostic — nothing
 * has been examined, and the record says so.
 */
export function WorksRecord() {
  const s = useAppStore();
  const layers = s.layers();
  const T = worksTotals(layers, s.W.cur, s.W.sel);
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;
  if (!F || !jur || !s.type) return null;

  const belowStandard = layers.filter((l) => gradeOf(layers, s.W.cur, l.key) <= 2).length;

  const rows: [string, string | number][] = [
    ['Family', F.name],
    ['Institution', F.types[s.type].n],
    ['Licensed in', jur.n + ' · ' + jur.tn],
    ['Years in operation', s.W.age],
    ['Disciplines below standard', belowStandard + ' of ' + layers.length],
    ['Works selected', T.count],
    ['House fees', T.fee ? money(T.fee) : '—'],
    ['Duration', T.months ? T.months + ' months' : '—'],
    ['Migration effort', T.mig ? T.mig + ' days' : '—'],
    ['Client attrition band', T.count ? T.attr[0] : '—'],
    ['Model version', s.catalog.coefficients.version],
  ];

  return (
    <>
      <Deep className="mb-10">
        <span className="eyebrow">Works Record · WR-0207 · model {s.catalog.coefficients.version}</span>
        <h2 style={{ margin: '12px 0 14px' }}>What you hold, and what the House would undertake</h2>
        <p style={{ margin: 0, maxWidth: 'var(--measure)' }}>
          A written statement, not a diagnostic. No systems, books or counterparty agreements have
          been examined.
        </p>
      </Deep>

      <section>
        <Card>
          {rows.map(([k, v]) => (
            <DottedRow key={k} label={k} value={v} />
          ))}
        </Card>
      </section>

      {T.count ? (
        <section>
          <SectionHeading title="The engagement" right="Selected works" />
          <DataTable
            columns={[
              { head: 'Discipline', width: '22%' },
              { head: 'Currently', width: '24%' },
              { head: 'Work' },
              { head: 'Fee', width: '110px', right: true },
            ]}
          >
            {T.items.map((it, i) => (
              <tr key={i}>
                <td>{it.name}</td>
                <td>{it.w.from}</td>
                <td>{it.w.to}</td>
                <td className="r num">{money(it.w.fee)}</td>
              </tr>
            ))}
          </DataTable>
        </section>
      ) : null}

      <Plaque title="What this record is — and is not">
        <p style={{ marginTop: '10px' }}>
          It carries into the Vestibule as a single-service engagement with these disciplines already
          selected. It is not a diagnostic, and a short paid assessment precedes any cutover date
          being offered.
        </p>
      </Plaque>

      <div className="foot">
        <span className="l">Nothing is committed by carrying this record across.</span>
        <button type="button" className="btn" onClick={() => s.act('wCarry')}>
          Carry into the Vestibule
        </button>
      </div>
      <Disclaimer />
    </>
  );
}
