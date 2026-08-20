'use client';

import { Card } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MosaicFigure } from '@/components/figures/MosaicFigure';
import { MosaicKeys } from '@/components/figures/Keys';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

/** Module 08 · Capital Deployment. Six pools, reconciled monthly, never transacted. */
export function CapitalDeployment() {
  const s = useAppStore();
  const R = s.fam && s.type && s.jur ? s.build({ stress: true }) : null;
  if (!R) return null;

  return (
    <>
      <Head
        title="Capital Deployment"
        right="Reported, never transacted"
        lede="Most committed capital should remain inside the institution as capital, rather than leave it as cost."
      />
      <section>
        <Card lg>
          <MosaicFigure pools={R.pools} />
          <MosaicKeys />
        </Card>
      </section>
      <section>
        <SectionHeading title="The pools" />
        <DataTable
          columns={[
            { head: 'Pool', width: '26%' },
            { head: 'Committed', width: '130px', right: true },
            { head: 'Drawn', width: '90px', right: true },
            { head: 'What it is' },
          ]}
        >
          {R.pools.map((p, i) => (
            <tr key={i}>
              <td>
                <strong>{p.n}</strong>
              </td>
              <td className="r num">{money(p.v)}</td>
              <td className="r num">{p.drawn}%</td>
              <td>{p.note}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <section>
        <SectionHeading title="Monthly reconciliation" right="Every variance explained" />
        <DataTable
          columns={[
            { head: 'Month', width: '100px' },
            { head: 'Planned', width: '130px', right: true },
            { head: 'Actual', width: '130px', right: true },
            { head: 'Variance', width: '120px', right: true },
            { head: 'Explanation' },
          ]}
        >
          <tr>
            <td>July</td>
            <td className="r num">USD 148,200</td>
            <td className="r num">USD 151,900</td>
            <td className="r num" style={{ color: 'var(--maroon)' }}>
              +USD 3,700
            </td>
            <td>Hosting invoiced for twelve months rather than eleven. Explained in writing, accepted.</td>
          </tr>
          <tr>
            <td>June</td>
            <td className="r num">USD 96,400</td>
            <td className="r num">USD 96,400</td>
            <td className="r num">—</td>
            <td>No variance.</td>
          </tr>
          <tr>
            <td>May</td>
            <td className="r num">USD 61,000</td>
            <td className="r num">USD 58,300</td>
            <td className="r num pos">−USD 2,700</td>
            <td>Legal opinion delivered under the estimate.</td>
          </tr>
        </DataTable>
        <p className="meta" style={{ marginTop: '14px' }}>
          A variance without a written explanation is treated by the House as an unreconciled item.
        </p>
      </section>
      <Disclaimer />
    </>
  );
}
