'use client';

import { Card, Plaque } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { SpineFigure } from '@/components/figures/SpineFigure';
import { useAppStore } from '@/store/useAppStore';

const STATUS = ['Passed', 'Passed', 'In progress', 'Not reached', 'Not reached', 'Not reached'];
const CRITERIA = ['4 of 4', '5 of 5', '4 of 6', '0 of 5', '0 of 6', '0 of 4'];

/** Module 02 · The Mandate. Scope, four phases, six gates — severable at each. */
export function Mandate() {
  const gates = useAppStore((s) => s.catalog.gates);

  return (
    <>
      <Head
        title="The Mandate"
        right="Six gates"
        lede="Transfer is a transfer of capability to your own team — not a departure, and not a default."
      />
      <section>
        <Card lg>
          <SpineFigure cur={2} gates={gates} />
        </Card>
      </section>
      <section>
        <SectionHeading title="Gate register" right="Each a written determination" />
        <DataTable
          columns={[
            { head: 'Gate', width: '90px' },
            { head: 'Subject' },
            { head: 'Status', width: '130px' },
            { head: 'Criteria', width: '110px', right: true },
          ]}
        >
          {gates.map((g, i) => (
            <tr key={i}>
              <td className="num">{g[0]}</td>
              <td>
                <strong>{g[1]}</strong>
                <br />
                <span className="meta">{g[2]}</span>
              </td>
              <td>
                <Mark tone={i < 2 ? 'ok' : i === 2 ? 'u' : undefined}>{STATUS[i]}</Mark>
              </td>
              <td className="r num">{CRITERIA[i]}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <Plaque title="Severable at every gate">
        <p style={{ marginTop: '10px' }}>
          The mandate may be ended by you at any gate. Nothing beyond the current phase is committed,
          no fee for a later phase falls due, and everything delivered and accepted remains yours.
        </p>
      </Plaque>
      <Disclaimer />
    </>
  );
}
