'use client';

import { Card, Plaque } from '@/components/shared/Blocks';
import { DataTable } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { useAppStore } from '@/store/useAppStore';

const ROW: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
  padding: '12px 0',
  borderBottom: '1px dotted var(--line)',
};

/** Step 05 · Agreement. Your own work is annexed to the contract. */
export function Agreement() {
  const s = useAppStore();

  const stages: [string, string][] = [
    ['Issued', '5 August'],
    ['Reviewed by principal', '8 August'],
    ['Executed by principal', s.V.executed ? 'complete' : 'pending'],
    ['Countersigned by the House', s.V.executed ? 'complete' : 'pending'],
  ];

  return (
    <>
      <Head
        title="Agreement"
        right={s.V.executed ? 'Executed · awaiting countersignature' : 'Awaiting your signature'}
        lede="Your own work is annexed to the contract."
      />

      {s.sub === 'fees' ? (
        <section>
          <DataTable columns={[{ head: 'Instrument', width: '38%' }, { head: 'When' }]}>
            <tr>
              <td>Institutional Blueprint</td>
              <td>Credited in full against the mandate</td>
            </tr>
            <tr>
              <td>Design fee — phase 1</td>
              <td>On execution</td>
            </tr>
            <tr>
              <td>Implementation fee</td>
              <td>By tranche, at gates</td>
            </tr>
            <tr>
              <td>Management retainer</td>
              <td>From go-live, 24–36 month initial term</td>
            </tr>
            <tr>
              <td>Performance participation</td>
              <td>
                A services fee referenced to net operational profit — never equity, never carry
              </td>
            </tr>
          </DataTable>
          <Plaque title="Vendor costs do not appear here">
            <p style={{ marginTop: '10px' }}>
              They are quoted separately, as they arise, and paid by you directly to each
              counterparty. No client capital passes through X-CHASE.
            </p>
          </Plaque>
        </section>
      ) : (
        <section>
          <Card>
            {stages.map(([k, v]) => (
              <div key={k} style={ROW}>
                <span className="eyebrow q">{k}</span>
                <span style={{ fontFamily: 'var(--garamond)', fontSize: '18px' }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: '24px' }}>
              <span className="eyebrow m">Annexes forming part hereof</span>
              <p style={{ marginTop: '10px', marginBottom: 0 }}>
                {s.entry === 'w' ? 'Works Record' : 'Model Record'} · Requirements Record · Scope of
                Work · Fee Schedule
              </p>
            </div>
            {!s.V.executed ? (
              <div style={{ marginTop: '28px' }}>
                <button type="button" className="btn" onClick={() => s.act('vExecute')}>
                  Execute
                </button>
              </div>
            ) : null}
          </Card>
        </section>
      )}

      <Foot
        message={
          s.V.executed
            ? 'Executed and countersigned. Admission opens the Mandate Room.'
            : 'Execute the agreement before admission.'
        }
        label="Cross into the Mandate Room"
        onAdvance={() => s.act('vGoAdmission')}
        ready={!!s.V.executed}
      />
      <Disclaimer />
    </>
  );
}
