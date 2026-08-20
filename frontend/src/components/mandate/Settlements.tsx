'use client';

import { Plaque } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { useAppStore } from '@/store/useAppStore';

const LEDGER_A: [string, string, string, string][] = [
  ['INV-001', 'Institutional Blueprint', 'Creditable in full', 'Accepted'],
  ['INV-002', 'Design fee — phase 1', 'USD 46,000', 'Accepted'],
  ['INV-003', 'Implementation fee — first tranche', 'USD 38,000', 'Accepted'],
  ['INV-004', 'Implementation fee — second tranche', 'USD 38,000', 'Requires settlement'],
];

/** Module 07 · Fees & Settlements. Two ledgers, and one rule that governs all money. */
export function Settlements() {
  const layers = useAppStore((s) => s.layers());

  const ledgerB: [string, string, string, string, string][] = [
    ['VQ-009', layers[2] ? layers[2].name : 'Platform', 'USD 24,000 / year', 'Accepted', 'No concession. X-CHASE receives no part of this amount.'],
    [
      'VQ-011',
      'Hosting and infrastructure',
      'USD 3,100 / month',
      'Requires settlement',
      'A concession of twelve per cent on list was negotiated and is reflected above.',
    ],
    [
      'VQ-014',
      layers[0] ? layers[0].name : 'Liquidity',
      'USD 7,400 / year',
      'Requires decision',
      'Payable by you directly to the counterparty.',
    ],
  ];

  return (
    <>
      <Head
        title="Fees & Settlements"
        right="Two ledgers"
        lede="The House invoices for its own fees. The House quotes vendor costs — and you pay each vendor directly."
      />
      <section>
        <SectionHeading title="Ledger A · payable to X-CHASE" right="Four instruments" />
        <DataTable
          columns={[
            { head: 'Reference', width: '100px' },
            { head: 'Description' },
            { head: 'Amount', width: '150px', right: true },
            { head: 'Status', width: '170px' },
          ]}
        >
          {LEDGER_A.map((r) => (
            <tr key={r[0]}>
              <td className="num">{r[0]}</td>
              <td>{r[1]}</td>
              <td className="r num">{r[2]}</td>
              <td>
                <Mark tone={r[3] === 'Accepted' ? 'ok' : 'u'}>{r[3]}</Mark>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
      <section>
        <SectionHeading title="Ledger B · payable to each counterparty, directly" />
        <DataTable
          columns={[
            { head: 'Reference', width: '100px' },
            { head: 'Counterparty', width: '22%' },
            { head: 'Amount', width: '150px', right: true },
            { head: 'Status', width: '170px' },
            { head: 'Disclosure' },
          ]}
        >
          {ledgerB.map((r) => (
            <tr key={r[0]}>
              <td className="num">{r[0]}</td>
              <td>{r[1]}</td>
              <td className="r num">{r[2]}</td>
              <td>
                <Mark tone={r[3] === 'Accepted' ? 'ok' : 'u'}>{r[3]}</Mark>
              </td>
              <td>{r[4]}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <Plaque title="The rule that governs all money">
        <p style={{ marginTop: '10px' }}>
          No client capital passes through X-CHASE, and no funds move through this system at any
          point. If you are ever asked to send money to the House for anything other than the four
          instruments in Ledger A, it did not come from the House.
        </p>
      </Plaque>
      <Disclaimer />
    </>
  );
}
