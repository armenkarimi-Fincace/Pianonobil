'use client';

import { Card } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { Metrics } from '@/components/shared/Metrics';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { LineFigure } from '@/components/figures/LineFigure';
import { MosaicFigure } from '@/components/figures/MosaicFigure';
import { MosaicKeys } from '@/components/figures/Keys';
import { commas, money, sgn } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 03 · The Economics. Three views — the sixty-month projection, where the
 * committed capital sits, and a sensitivity grid.
 */
export function Economics() {
  const s = useAppStore();
  const R = s.build({ stress: false });
  const F = s.fam ? s.catalog.families[s.fam] : null;
  if (!R || !F) return null;

  const marks = [{ i: R.goLive - 1, t: 'GO-LIVE' }];
  if (R.be) marks.push({ i: R.be - 1, t: 'BREAK-EVEN' });

  const mults = [0.5, 0.75, 1, 1.5, 2];
  const secs = Object.keys(F.second.opts);

  return (
    <>
      <Head
        title="The Economics"
        right={'Model ' + s.catalog.coefficients.version}
        lede="Produced from the parameters you have set, on assumptions the House states in writing and will defend."
      />
      <Metrics R={R} />

      {s.sub === 'pools' ? (
        <section>
          <SectionHeading title="Where the committed capital sits" right={F.pools.length + ' pools'} />
          <Card lg>
            <figcaption>Share of the commitment, and how much of each is spent</figcaption>
            <MosaicFigure pools={R.pools} />
            <p className="fread">
              Each square&apos;s area is that pool&apos;s share of the total. Two of the six are not
              expenditure at all — one is held at a counterparty or on the book, and the contingency
              is untouched in phase one.
            </p>
            <MosaicKeys spentLabel="spent by go-live" />
            <div style={{ marginTop: '36px' }}>
              {R.pools.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '24px',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--line-soft)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontFamily: 'var(--optima)', fontSize: '16px' }}>{p.n}</span>
                  <span style={{ display: 'flex', gap: '24px', alignItems: 'baseline' }}>
                    <span className="num" style={{ fontSize: '15px', color: 'var(--maroon)' }}>
                      {money(p.v)}
                    </span>
                    <span className="meta" style={{ maxWidth: '44ch' }}>
                      {p.note}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      ) : s.sub === 'sens' ? (
        <section>
          <SectionHeading title="Sensitivity" right="Annualised operating result at steady state" />
          <DataTable
            columns={[
              { head: F.unit },
              ...secs.map((a) => ({ head: F.second.opts[a].n.split(' · ')[0], right: true })),
            ]}
          >
            {mults.map((m, mi) => {
              const sc = R.scale * m;
              return (
                <tr key={mi}>
                  <td>
                    {commas(sc)} {F.u}
                    {m === 1 ? ' · current' : ''}
                  </td>
                  {secs.map((a) => {
                    const v = (sc * R.T.yield * F.second.opts[a].mult * R.capacity - R.opexM) * 12;
                    return (
                      <td key={a} className={'r num ' + (v >= 0 ? 'pos' : 'neg')}>
                        {sgn(v)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </DataTable>
          <p className="meta" style={{ marginTop: '16px' }}>
            Annualised operating result at steady state. It does not include the build, the
            permission, or the ramp.
          </p>
        </section>
      ) : (
        <>
          <section>
            <SectionHeading title="Revenue against running cost" right="Sixty months" />
            <Card lg>
              <figcaption>The solid line is revenue; the dashed line is running cost</figcaption>
              <LineFigure
                series={[
                  { d: R.rev, c: '#5A1420', fill: true },
                  { d: R.cost, c: '#8C8579', dash: true },
                ]}
                marks={marks}
              />
              <p className="fread">
                Where the two lines cross is break-even. The dashed markers show go-live and that
                crossing. Nothing before go-live earns anything, and the cost line runs from the
                first month regardless.
              </p>
            </Card>
          </section>
          <section>
            <SectionHeading title="Five years" right="Operating result" />
            <DataTable
              columns={[
                { head: 'Year' },
                { head: 'Revenue', right: true },
                { head: 'Cost', right: true },
                { head: 'Result', right: true },
                { head: 'Cumulative', right: true },
              ]}
            >
              {R.year.map((Y) => (
                <tr key={Y.y}>
                  <td>Year {Y.y}</td>
                  <td className="r num">{money(Y.rev)}</td>
                  <td className="r num">{money(Y.cost)}</td>
                  <td className={'r num ' + (Y.res >= 0 ? 'pos' : 'neg')}>{sgn(Y.res)}</td>
                  <td className="r num">{sgn(Y.cum)}</td>
                </tr>
              ))}
            </DataTable>
          </section>
        </>
      )}

      <Foot
        message={
          s.ack.economics
            ? 'Read and acknowledged. The Stress Table asks what happens when conditions are not kind.'
            : 'Read the economics, then continue. The Stress Table opens on acknowledgement.'
        }
        label={s.ack.economics ? 'Go to the stress table' : 'I have read this'}
        onAdvance={() => s.act('ackEconomics')}
        ready
      />
      <Disclaimer />
    </>
  );
}
