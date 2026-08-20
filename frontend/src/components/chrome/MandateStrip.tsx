'use client';

import { money } from '@/lib/format';
import { PARTIES, ZONE_NAMES } from '@/lib/navigation';
import { worksTotals } from '@/lib/works';
import { useAppStore } from '@/store/useAppStore';

/**
 * The mandate strip: the mark on the left, the current position in the middle,
 * and the named Mandate Lead on the right. It is the one piece of chrome that
 * never changes shape, whichever room is open.
 */
export function MandateStrip() {
  const s = useAppStore();
  const fam = s.fam ? s.catalog.families[s.fam] : null;
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;

  let title: string;
  let sub: string;

  if (s.zone === 'g') {
    title = 'The Piano Nobile';
    sub = 'Choose a door';
  } else if (s.zone === 'b') {
    title = fam && s.type && jur ? `${fam.types[s.type].n} · ${jur.n}` : 'Mandate XC-M-0114';
    sub = `${s.M.mode} mandate · reference XC-M-0114`;
  } else if (s.zone === 'v') {
    title = s.V.path
      ? s.V.path === 'turnkey'
        ? 'Turnkey mandate'
        : 'Single-service engagement'
      : 'The Vestibule';
    sub = `${s.V.party ? PARTIES[s.V.party].n : 'Identity not declared'} · ${jur ? jur.n : ''}`;
  } else {
    title = fam && s.type ? fam.types[s.type].n + (jur ? ' · ' + jur.n : '') : 'No institution declared';
    if (s.zone === 'm') {
      const R = s.build({ stress: false });
      sub = R ? `${money(R.committed)} committed · model ${s.catalog.coefficients.version}` : 'Begin with Constitution';
    } else {
      const T = worksTotals(s.layers(), s.W.cur, s.W.sel);
      sub = T.count
        ? `${T.count} works · ${money(T.fee)} · model ${s.catalog.coefficients.version}`
        : 'Begin with The Standing';
    }
  }

  return (
    <div className="strip">
      <div className="in">
        <div className="mk">
          X&#8209;CHASE<small>{ZONE_NAMES[s.zone] || 'The Piano Nobile'}</small>
        </div>
        <div className="mid">
          <div className="t">{title}</div>
          <div className="s">{sub}</div>
        </div>
        <div className="rt">
          <div className="l">Your Mandate Lead</div>
          <div className="n">Sam Hesam</div>
          <div className="x">Replies within two business days</div>
        </div>
      </div>
    </div>
  );
}
