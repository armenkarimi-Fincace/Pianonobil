'use client';

import { QuietBlock } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { MetricBand } from '@/components/shared/Metrics';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

const STATUS = [
  'In progress',
  'Requires decision',
  'In progress',
  'Not yet commenced',
  'Under review',
  'In progress',
  'In progress',
  'Not yet commenced',
  'In progress',
];

/** Module 03 · Workstreams. Each row carries its attribution — who performs the work. */
export function Workstreams() {
  const s = useAppStore();
  const layers = s.layers();
  const lay = layers.find((l) => l.key === s.sub);

  if (!lay) {
    return (
      <>
        <Head
          title="Workstreams"
          right={layers.length + ' disciplines'}
          lede="Each row carries its attribution — who actually performs the work."
        />
        <section>
          <DataTable
            columns={[
              { head: 'Workstream', width: '26%' },
              { head: 'Attribution', width: '22%' },
              { head: 'Status', width: '150px' },
              { head: 'Specified as' },
            ]}
          >
            {layers.map((l, i) => {
              const o = l.options.find((x) => x.id === s.sel[l.key]);
              const st = STATUS[i] || 'In progress';
              return (
                <tr key={l.key}>
                  <td>
                    <strong>{l.name}</strong>
                  </td>
                  <td>{l.by}</td>
                  <td>
                    <Mark tone={st === 'Requires decision' ? 'u' : 'ok'}>{st}</Mark>
                  </td>
                  <td>{o ? o.name : '—'}</td>
                </tr>
              );
            })}
          </DataTable>
        </section>
        <Disclaimer />
      </>
    );
  }

  const sel = lay.options.find((x) => x.id === s.sel[lay.key]);

  return (
    <>
      <Head title={lay.name} right={lay.by} lede={lay.q} />
      <MetricBand
        cells={[
          { k: 'Specified as', v: sel ? sel.name : '—', d: 'from the Model Record' },
          { k: 'Build', v: sel && sel.capex ? money(sel.capex) : '—', d: lay.by.toLowerCase() },
          { k: 'Monthly', v: sel && sel.opex ? money(sel.opex) : '—', d: 'at full complement' },
          { k: 'House owner', v: 'Named', d: 'responds within two business days' },
        ]}
      />
      <section>
        <SectionHeading title="Milestones" right="Four" />
        <DataTable
          columns={[{ head: 'Milestone' }, { head: 'Status', width: '150px' }, { head: 'Due', width: '110px' }]}
        >
          <tr>
            <td>Design accepted</td>
            <td>
              <Mark tone="ok">Accepted</Mark>
            </td>
            <td>12 Jun</td>
          </tr>
          <tr>
            <td>Counterparty selected</td>
            <td>
              <Mark tone="u">Requires decision</Mark>
            </td>
            <td>30 Jul</td>
          </tr>
          <tr>
            <td>Contracting and configuration</td>
            <td>
              <Mark tone="ok">In progress</Mark>
            </td>
            <td>15 Aug</td>
          </tr>
          <tr>
            <td>Testing and acceptance</td>
            <td>
              <Mark>Not yet commenced</Mark>
            </td>
            <td>2 Sep</td>
          </tr>
        </DataTable>
      </section>
      <QuietBlock title="Note from the House">
        <p style={{ marginTop: '10px' }}>{sel ? sel.why : ''}</p>
      </QuietBlock>
      <Disclaimer />
    </>
  );
}
