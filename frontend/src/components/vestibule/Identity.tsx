'use client';

import { Card, GateNote, QuietBlock } from '@/components/shared/Blocks';
import { CheckRow } from '@/components/shared/CheckRow';
import { Chip } from '@/components/shared/Chip';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { docPack } from '@/lib/docpack';
import { PARTIES } from '@/lib/navigation';
import { docDone, useAppStore, vStepDone } from '@/store/useAppStore';

/**
 * Step 01 · Identity & Standing. The first act of the relationship is not a
 * sale; it is a verification. The pack is generated from who is engaging and
 * from the jurisdiction, and every item has a reason.
 */
export function Identity() {
  const s = useAppStore();
  const pack = docPack(s.catalog, s.V.party, s.jur);
  const done = docDone(s, s.catalog);
  const ready = vStepDone(s, s.catalog, 'identity');
  const jur = s.catalog.jurisdictions[s.jur || 'adgm'];

  return (
    <>
      <Head
        title="Identity & Standing"
        right={done + ' of ' + pack.length + ' ready'}
        lede="The first act of the relationship is not a sale; it is a verification. Every item has a reason the House will state in writing if you ask."
      />

      {s.sub === 'who' ? (
        <section>
          <SectionHeading title="Who is engaging" right="A legal form, not a client type" />
          <Card>
            {Object.keys(PARTIES).map((k) => (
              <Chip key={k} pressed={s.V.party === k} onClick={() => s.setParty(k)}>
                {PARTIES[k].n}
              </Chip>
            ))}
            {s.V.party ? (
              <p className="note-t" style={{ margin: '16px 0 0' }}>
                {PARTIES[s.V.party].s}. These four are legal forms, not client types. A family office
                signing through an ordinary holding company is the second.
              </p>
            ) : null}
          </Card>
        </section>
      ) : s.sub === 'notes' ? (
        <>
          <QuietBlock title="Note from the House · 22 July">
            <p style={{ marginTop: '10px' }}>
              Where a document is returned it carries a dated written note saying exactly what is
              missing. A red mark alone is never a verdict, and the House does not issue one. The
              reviewer is structurally a different person from your Mandate Lead.
            </p>
          </QuietBlock>
          <section>
            <SectionHeading title="Never asked, at any stage" />
            <Card>
              <ul style={{ margin: 0 }}>
                <li>Online banking credentials, of any kind.</li>
                <li>Card numbers, or any payment instrument.</li>
                <li>Read access to an account, or a screen-sharing session over one.</li>
                <li>Original documents by post. Certified copies only.</li>
                <li>A payment of any kind before an executed agreement.</li>
                <li>Documents by email attachment — they are uploaded, or they are not accepted.</li>
              </ul>
            </Card>
          </section>
        </>
      ) : !s.V.party ? (
        <GateNote>Declare who is engaging first.</GateNote>
      ) : (
        <section>
          <SectionHeading title="Documents" right={jur.tn} />
          <p className="note-t" style={{ marginBottom: '20px' }}>
            The list is generated from who is engaging and from the jurisdiction — not from a fixed
            form. Marking an item is a note to yourself; nothing is sent from this prototype.
          </p>
          <div>
            {pack.map((p, i) => (
              <CheckRow
                key={i}
                done={!!s.V.docs[s.V.party + '|' + i]}
                name={p.n}
                detail={p.d}
                tag={p.k === 'core' ? 'Core' : 'Jurisdiction'}
                onToggle={() => s.toggleDoc(i)}
              />
            ))}
          </div>
        </section>
      )}

      <Foot
        message={
          ready
            ? 'Identity is lodged. Selection asks what you are engaging the House to do.'
            : 'Mark every document as ready before Selection opens.'
        }
        label="Proceed to selection"
        onAdvance={() => s.act('vGoSelection')}
        ready={ready}
      />
      <Disclaimer />
    </>
  );
}
