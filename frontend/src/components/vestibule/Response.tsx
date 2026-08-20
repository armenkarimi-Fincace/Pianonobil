'use client';

import { Card } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { pad } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

const PARTS = [
  'Understanding of the requirement',
  'Recommended structure and phased approach',
  'Scope — delivered by the House',
  'Scope — procured on your behalf',
  'What is excluded',
  'Indicative duration and phase sequence',
  'Fee basis',
  'Conditions and assumptions',
  'Validity period',
  'Named signatory',
];

/**
 * Step 04 · The Response. No quote engine and no instant figure — the wait is
 * designed, not concealed.
 */
export function Response() {
  const s = useAppStore();

  return (
    <>
      <Head
        title="The Response"
        right={s.V.issued ? 'Version 1 · issued' : 'Under consideration'}
        lede="No quote engine and no instant figure. The wait is designed, not concealed."
      />

      {!s.V.issued ? (
        <section>
          <Card lg style={{ textAlign: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/seal.png" alt="" style={{ width: '78px', margin: '0 auto 24px' }} />
            <h2>
              Under consideration by <span style={{ color: 'var(--maroon)' }}>Sam Hesam</span>
            </h2>
            <p className="note-t" style={{ maxWidth: 'var(--measure)', margin: '16px auto 28px' }}>
              A written response will be issued by a date the House states in advance and treats as
              binding on itself. You will be notified, and it will appear here.
            </p>
            <button type="button" className="btn o" onClick={() => s.act('vIssue')}>
              Simulate: the response arrives
            </button>
          </Card>
        </section>
      ) : (
        <>
          <section>
            <DataTable columns={[{ head: '', width: '60px' }, { head: 'Part' }, { head: '', width: '90px', right: true }]}>
              {PARTS.map((p, i) => (
                <tr key={i}>
                  <td className="num">{pad(i + 1)}</td>
                  <td>{p}</td>
                  <td className="r">
                    <span className="eyebrow q">Read</span>
                  </td>
                </tr>
              ))}
            </DataTable>
          </section>
          <section>
            <SectionHeading title="One of four answers" right="All four are recorded" />
            <Card>
              <button type="button" className="btn" onClick={() => s.act('vAccept')}>
                Accept and proceed
              </button>
              <button type="button" className="btn o" onClick={() => s.act('vRevise')}>
                Request a revision
              </button>
              <button type="button" className="btn q" onClick={() => s.act('vDecline')}>
                Decline
              </button>
              <p className="meta" style={{ margin: '16px 0 0' }}>
                Declines are among the most valuable data the House holds about its own pricing. Most
                mandates are executed on the second version.
              </p>
            </Card>
          </section>
        </>
      )}

      <Foot
        message={
          s.V.accepted
            ? 'Accepted. The agreement annexes your own work to the contract.'
            : 'The response must be issued and accepted before the agreement opens.'
        }
        label="Open the agreement"
        onAdvance={() => s.act('vGoAgreement')}
        ready={!!s.V.accepted}
      />
      <Disclaimer />
    </>
  );
}
