'use client';

import { useAppStore } from '@/store/useAppStore';

/** Step 06 · Admission. The crossing into the Piano Nobile itself. */
export function Admission() {
  const s = useAppStore();
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;

  return (
    <div className="crossing">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/seal.png" alt="" />
      <span className="eyebrow m">The mandate is executed</span>
      <h1 style={{ marginTop: '16px' }}>
        Welcome to
        <br />
        The Piano Nobile
      </h1>
      <hr
        className="rule"
        style={{ border: 0, borderTop: '1px solid var(--bronze)', width: '52px', margin: '24px auto' }}
      />
      <p className="note-t" style={{ maxWidth: 'var(--measure)', margin: '0 auto 12px' }}>
        {F && s.type ? F.types[s.type].n : 'Your institution'} · {jur ? jur.n : ''} · reference
        XC-M-0114
      </p>
      <p
        className="lede"
        style={{ maxWidth: 'var(--measure)', margin: '24px auto 32px', textAlign: 'center' }}
      >
        Your Mandate Lead is Sam Hesam. The first review is scheduled for 26 August. Design begins
        tomorrow.
      </p>
      <button type="button" className="btn" onClick={() => s.act('vAdmit')}>
        Enter the Mandate Room
      </button>
    </div>
  );
}
