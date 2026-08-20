'use client';

import { Card, GateNote, Plaque } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { Metrics } from '@/components/shared/Metrics';
import { OptionRow } from '@/components/shared/OptionRow';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { NonagonFigure } from '@/components/figures/NonagonFigure';
import { money } from '@/lib/format';
import { assemblyCount, assemblyDone, useAppStore } from '@/store/useAppStore';

const BY_NOTE: Record<string, string> = {
  House: 'The House performs this with its own people.',
  Procured: 'Procured on your behalf and paid by you directly to the counterparty.',
  Managed: 'Managed by the House; a third party executes in your name.',
};

/**
 * Step 02 · The Assembly. Nine layers, one screen each, every option carrying
 * its build cost, running cost, time, capacity and ramp effect.
 */
export function Assembly() {
  const s = useAppStore();
  const layers = s.layers();
  const R = s.build({ stress: false });

  let idx = layers.findIndex((l) => l.key === s.sub);
  if (idx < 0) idx = 0;
  const cur = layers[idx];
  if (!cur || !R) return null;

  const count = assemblyCount(s, layers);
  const complete = assemblyDone(s, layers);
  const next = idx < layers.length - 1 ? layers[idx + 1] : null;
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;

  return (
    <>
      <Head title={'The Assembly · ' + cur.name} right={cur.by} lede={cur.q} />
      <Metrics R={R} />

      <div className="g2 min0" style={{ marginBottom: '32px' }}>
        <Card>
          <NonagonFigure layers={layers} sel={s.sel} centreCount={count} />
          <p className="fread">
            Each corner is one layer of this institution. A filled marker is a layer you have
            specified; the shape reaches further as you choose a heavier configuration. {count} of{' '}
            {layers.length} are set.
          </p>
        </Card>
        <div>
          <div className="eyebrow q">
            Layer {idx + 1} of {layers.length}
          </div>
          <h2 style={{ margin: '10px 0 16px' }}>{cur.name}</h2>
          <p className="note-t">{cur.q}</p>
          <p className="meta" style={{ marginTop: '20px', lineHeight: 1.85 }}>
            Delivered by: <strong>{cur.by}</strong>. {BY_NOTE[cur.by]}
          </p>
          {count < layers.length ? (
            <GateNote>
              <strong>{layers.length - count} layers remain.</strong> The Economics opens when every
              layer is specified.
            </GateNote>
          ) : null}
        </div>
      </div>

      <section>
        <div>
          {cur.options.map((o) => {
            let blocked: string | null = null;
            if (o.requires === 'onshore' && jur && jur.tier !== 'onshore') blocked = 'Requires onshore standing';
            if (o.requires === 'fund' && s.type !== 'fund') blocked = 'Fund vehicles only';
            return (
              <OptionRow
                key={o.id}
                title={o.name}
                why={o.why}
                blocked={blocked}
                pressed={s.sel[cur.key] === o.id}
                onSelect={() => s.selectLayer(cur.key, o.id, blocked)}
                details={[
                  { k: 'Build', v: o.capex ? money(o.capex) : '—' },
                  { k: 'Monthly', v: o.opex ? money(o.opex) : '—' },
                  { k: 'Time', v: o.months ? (o.months > 0 ? '+' : '') + o.months + ' mo' : '—' },
                  { k: 'Capacity', v: o.capacity !== 1 ? '×' + o.capacity.toFixed(2) : '—' },
                  { k: 'Ramp', v: o.ramp !== 1 ? '×' + o.ramp.toFixed(2) : '—' },
                ]}
              />
            );
          })}
        </div>
      </section>

      <section>
        <SectionHeading
          title="The specification as it stands"
          right={money(R.capex) + ' to build · ' + money(R.opexM) + '/month'}
        />
        <DataTable
          columns={[
            { head: 'Line' },
            { head: 'Delivered by', width: '130px' },
            { head: 'Build', width: '120px', right: true },
            { head: 'Monthly', width: '120px', right: true },
          ]}
        >
          {R.lines.map((l, i) => (
            <tr key={i}>
              <td>{l.line}</td>
              <td>{l.by}</td>
              <td className="r num">{l.capex ? money(l.capex) : '—'}</td>
              <td className="r num">{l.opex ? money(l.opex) : '—'}</td>
            </tr>
          ))}
        </DataTable>
        <Plaque title="Read this before the numbers">
          <p style={{ marginTop: '10px' }}>
            Of the build capital above, <strong>{money(R.houseCapex)}</strong> is work the House
            performs with its own people, and <strong>{money(R.vendorCapex)}</strong> is procured on
            your behalf and paid by you directly to each counterparty. No client capital passes
            through X-CHASE at any point.
          </p>
        </Plaque>
      </section>

      {next && !complete ? (
        <Foot
          message={'Next layer: ' + next.name + '.'}
          label={'Continue to ' + next.name}
          onAdvance={() => s.setSub(next.key)}
          ready
        />
      ) : (
        <Foot
          message={
            complete
              ? 'Every layer is specified. The Economics computes what the structure produces.'
              : 'Specify every layer before The Economics opens.'
          }
          label="See the economics"
          onAdvance={() => s.act('goEconomics')}
          ready={complete}
        />
      )}
      <Disclaimer />
    </>
  );
}
