'use client';

import { Card, QuietBlock } from '@/components/shared/Blocks';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { RingFigure } from '@/components/figures/RingFigure';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

const ROW: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '12px 0',
  borderBottom: '1px dotted var(--line)',
};

/**
 * Step 06 · The Room You Would Hold. Not a rendering of an office — the actual
 * instrument, populated from the institution just specified.
 */
export function Preview() {
  const s = useAppStore();
  const R = s.build({ stress: true });
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const layers = s.layers();
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;
  if (!R || !F || !jur || !s.type) return null;

  const queue = [
    layers[0].name + ' — provider shortlist',
    layers[2].name + ' — vendor quotation',
    'Jurisdiction confirmation · ' + jur.n,
  ];

  return (
    <>
      <Head
        title="The Room You Would Hold"
        right={F.types[s.type].n + ' · ' + jur.n + ' · day 90'}
        lede="Not a rendering of an office. The actual instrument you would hold as principal, populated from the institution you have just specified."
      />

      <section>
        <div className="g2 min0">
          <Card lg>
            <RingFigure v={18} total={81} />
            <p className="fread" style={{ marginTop: '20px' }}>
              Deliverables accepted, counted rather than estimated. There is no progress bar anywhere
              in the environment.
            </p>
          </Card>
          <Card lg>
            <RingFigure v={3} total={6} />
            <p className="fread" style={{ marginTop: '20px' }}>
              Gate criteria met. Permission is expected in month {R.licMonths}.
            </p>
          </Card>
        </div>
      </section>

      <section>
        <div className="g2">
          <Card>
            <div className="sec-h">
              <span className="eyebrow m">Awaiting your determination</span>
              <span className="eyebrow q">(3)</span>
            </div>
            {queue.map((q, i) => (
              <div key={i} style={ROW}>
                <span style={{ fontFamily: 'var(--garamond)', fontSize: '17px' }}>{q}</span>
                <span className="eyebrow m">Open</span>
              </div>
            ))}
          </Card>
          <Card>
            <div className="sec-h">
              <span className="eyebrow m">Awaiting your settlement</span>
              <span className="eyebrow q">(2)</span>
            </div>
            <div style={ROW}>
              <span style={{ fontFamily: 'var(--garamond)', fontSize: '17px' }}>
                House fee — phase 2 tranche
              </span>
              <span className="num" style={{ color: 'var(--maroon)' }}>
                {money(R.houseCapex * 0.28)}
              </span>
            </div>
            <div style={{ ...ROW, borderBottom: 'none' }}>
              <span style={{ fontFamily: 'var(--garamond)', fontSize: '17px' }}>
                {layers[2].name} <span className="meta">· payable to the counterparty</span>
              </span>
              <span className="num" style={{ color: 'var(--maroon)' }}>
                {money(R.vendorCapex * 0.16)}
              </span>
            </div>
          </Card>
        </div>
      </section>

      <QuietBlock title="Why this is shown before a contract, not after">
        <p style={{ marginTop: '10px' }}>
          Ownership is not a feeling produced by scenery. It is the experience of holding the
          instruments.
        </p>
      </QuietBlock>

      <Foot
        message={
          s.ack.preview
            ? 'Acknowledged. The Record freezes everything above into one document.'
            : 'Read this, then continue. The Record opens on acknowledgement.'
        }
        label={s.ack.preview ? 'Produce the record' : 'I have read this'}
        onAdvance={() => s.act('ackPreview')}
        ready
      />
      <Disclaimer />
    </>
  );
}
