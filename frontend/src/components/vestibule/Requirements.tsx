'use client';

import { useState } from 'react';
import { Plaque, QuietBlock } from '@/components/shared/Blocks';
import { Chip } from '@/components/shared/Chip';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { submitRequirements } from '@/lib/api';
import { pad } from '@/lib/format';
import { REQ_SEC } from '@/lib/navigation';
import { docPack } from '@/lib/docpack';
import { docDone, reqCount, useAppStore, vStepDone } from '@/store/useAppStore';

const ANSWERS: [string, string][] = [
  ['own', 'I have a settled view'],
  ['discuss', 'I would rather discuss it'],
  ['advise', 'The House should advise'],
];

/**
 * Step 03 · The Requirements Register.
 *
 * This is the environment's substantive form. Submitting lodges the register
 * with the backend, where it is stored for a named senior person to read; the
 * receipt returns the reference the House will quote back. If the API cannot be
 * reached the walk still advances — the register is never a dead end — and the
 * principal is told plainly that the lodgement did not reach the House.
 */
export function Requirements() {
  const s = useAppStore();
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const ready = vStepDone(s, s.catalog, 'requirements');
  const advised = Object.keys(s.V.req).filter((k) => s.V.req[k] === 'advise').length;

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const R = s.build({ stress: true });
    const receipt = await submitRequirements({
      session_token: s.sessionToken,
      party: s.V.party,
      path: s.V.path,
      family: s.fam,
      institution_type: s.type,
      jurisdiction: s.jur,
      answers: s.V.req,
      documents_ready: docDone(s, s.catalog),
      documents_total: docPack(s.catalog, s.V.party, s.jur).length,
      carried_from: s.carried,
      model_snapshot: R
        ? {
            committed: R.committed,
            required: R.required,
            scale: R.scale,
            lic_months: R.licMonths,
            break_even: R.be,
            model_version: s.catalog.coefficients.version,
          }
        : null,
    });
    setSubmitting(false);

    if (receipt) {
      setReference(receipt.reference);
      s.toast('ok', 'Lodged with the House', `${receipt.message} Reference ${receipt.reference}.`);
    } else {
      s.toast(
        'warn',
        'Not lodged',
        'The register is complete but could not be lodged with the House. It is kept in this session, and the walk continues.',
      );
    }
    s.act('vSubmit');
  }

  return (
    <>
      <Head
        title="The Requirements Register"
        right={reqCount(s) + ' of ' + REQ_SEC.length + ' answered'}
        lede="A register, not a configurator. You record requirements; you do not assemble a product."
      />

      <Plaque title="The rule">
        <p style={{ marginTop: '10px' }}>
          Nothing here produces a price, a total, a package or an automatic scope. The output is a
          document which a named person at the House reads before responding.
        </p>
      </Plaque>

      <section>
        {REQ_SEC.map((name, i) => {
          const k = 's' + i;
          const a = s.V.req[k];
          return (
            <div className="qsec" key={k}>
              <div className="qh">
                <h4>
                  {pad(i + 1)} &nbsp; {name}
                </h4>
                {a ? <span className="eyebrow q">Answered</span> : <span className="eyebrow">Awaiting</span>}
              </div>
              <p className="note-t" style={{ marginBottom: '14px' }}>
                Recorded in your own words in the live system. Here, record how you would like the
                House to treat it.
              </p>
              <div>
                {ANSWERS.map(([value, label]) => (
                  <Chip key={value} pressed={a === value} onClick={() => s.setRequirement(k, value)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {advised ? (
        <QuietBlock title={`${advised} answered “the House should advise”`}>
          <p style={{ marginTop: '10px' }}>
            This is a complete answer, not an incomplete one, and it does not delay the response.
            Every instance widens the mandate, and the coverage team reads these before it reads
            anything else.
          </p>
        </QuietBlock>
      ) : null}

      {reference ? (
        <QuietBlock title="Lodged">
          <p style={{ marginTop: '10px' }}>
            The register is lodged with the House under reference <strong>{reference}</strong>. A
            named senior person reads it before anything is priced.
          </p>
        </QuietBlock>
      ) : null}

      <Foot
        message={
          ready
            ? 'The register is complete. Submitting commits you to nothing.'
            : 'Answer all nine sections before the register can be submitted.'
        }
        label={submitting ? 'Submitting…' : 'Submit to the House'}
        onAdvance={submit}
        ready={ready && !submitting}
      />
      <Disclaimer />
    </>
  );
}
