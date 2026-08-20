'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MODS, STEPS, VSTEPS, WSTEPS } from '@/lib/navigation';
import type { ZoneKey } from '@/lib/types';
import {
  modOpen,
  stepOpen,
  useAppStore,
  vStepOpen,
  vWhy,
  wStepOpen,
  whyLocked,
  wWhy,
  zoneOpen,
  zoneWhy,
} from '@/store/useAppStore';
import { Card } from '@/components/shared/Blocks';

interface IndexEntry {
  t: string;
  c: string;
  z: ZoneKey;
  k: string | null;
  sub?: string;
  w: string;
}

/**
 * Search covers everything the House can show, including the parts not yet
 * open — those are listed and say why, rather than being filtered out.
 */
export function SearchOverlay() {
  const s = useAppStore();
  const layers = s.layers();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    try {
      el.setSelectionRange(el.value.length, el.value.length);
    } catch {
      /* not all inputs support selection ranges */
    }
  }, []);

  const index = useMemo<IndexEntry[]>(() => {
    const ix: IndexEntry[] = [];
    ix.push({
      t: 'The Gateway',
      c: 'Choose which of the two working rooms applies to you.',
      z: 'g',
      k: null,
      w: 'Gateway',
    });
    for (const x of WSTEPS) ix.push({ t: x.t, c: 'Step ' + x.n + ' of the Works Room.', z: 'w', k: x.k, w: 'Works Room' });
    for (const x of STEPS) ix.push({ t: x.t, c: 'Step ' + x.n + ' of the Model Room.', z: 'm', k: x.k, w: 'Model Room' });
    for (const x of VSTEPS) ix.push({ t: x.t, c: 'Step ' + x.n + ' of the Vestibule.', z: 'v', k: x.k, w: 'Vestibule' });
    for (const x of MODS) ix.push({ t: x[2], c: x[3], z: 'b', k: x[1], w: 'Mandate Room' });

    const wz: ZoneKey = s.entry === 'w' ? 'w' : 'm';
    for (const f of Object.keys(s.catalog.families)) {
      const F = s.catalog.families[f];
      const mine = s.fam === f;
      ix.push({
        t: F.name,
        c: F.blurb,
        z: wz,
        k: wz === 'w' ? 'standing' : 'constitution',
        sub: wz === 'w' ? 'hold' : 'family',
        w: 'Family',
      });
      for (const t of Object.keys(F.types)) {
        ix.push({
          t: F.types[t].n,
          c: F.types[t].note,
          z: wz,
          k: wz === 'w' ? 'standing' : 'constitution',
          sub: wz === 'w' ? 'hold' : 'type',
          w: F.name,
        });
      }
      for (const LY of F.layers) {
        if (mine) {
          ix.push({ t: LY.name, c: LY.q, z: 'm', k: 'assembly', sub: LY.key, w: 'Assembly' });
          ix.push({
            t: LY.name,
            c: 'Declare what you run today, and what the House would undertake.',
            z: 'w',
            k: 'works',
            sub: LY.key,
            w: 'The Works',
          });
          for (const o of LY.options) {
            ix.push({
              t: o.name,
              c: LY.name + ' — ' + o.why.slice(0, 96) + '…',
              z: 'm',
              k: 'assembly',
              sub: LY.key,
              w: 'Assembly',
            });
          }
        } else {
          ix.push({
            t: LY.name,
            c: LY.q + ' — a layer of the ' + F.name + ' family.',
            z: wz,
            k: wz === 'w' ? 'standing' : 'constitution',
            sub: wz === 'w' ? 'hold' : 'family',
            w: F.name,
          });
        }
      }
      for (const sd of Object.keys(F.second.opts)) {
        ix.push({
          t: F.second.opts[sd].n,
          c: F.second.label + ' — ' + F.second.opts[sd].why.slice(0, 92) + '…',
          z: 'm',
          k: 'constitution',
          sub: 'second',
          w: F.name,
        });
      }
    }
    for (const jd of Object.keys(s.catalog.jurisdictions)) {
      ix.push({
        t: s.catalog.jurisdictions[jd].n,
        c: s.catalog.jurisdictions[jd].note,
        z: s.entry === 'w' ? 'w' : 'm',
        k: s.entry === 'w' ? 'standing' : 'constitution',
        sub: s.entry === 'w' ? 'licence' : 'jur',
        w: 'Jurisdiction',
      });
    }
    for (const sc of s.catalog.scenarios) ix.push({ t: sc.n, c: sc.d, z: 'm', k: 'stress', w: 'Stress Table' });
    for (const g of s.catalog.gates) ix.push({ t: g[0] + ' · ' + g[1], c: g[2], z: 'm', k: 'passage', w: 'The Passage' });
    return ix;
  }, [s.catalog, s.entry, s.fam]);

  function reachable(z: ZoneKey, k: string | null): boolean {
    if (!zoneOpen(s, z)) return false;
    if (!k) return true;
    if (z === 'm') return stepOpen(s, layers, k);
    if (z === 'w') return wStepOpen(s, layers, k);
    if (z === 'v') return vStepOpen(s, s.catalog, k);
    if (z === 'b') return modOpen(s, k);
    return true;
  }

  function reachWhy(z: ZoneKey, k: string | null): string {
    if (!zoneOpen(s, z)) return zoneWhy(s, z);
    if (!k) return '';
    if (z === 'm') return whyLocked(s, layers, k);
    if (z === 'w') return wWhy(s, layers, k);
    if (z === 'v') return vWhy(s, s.catalog, k);
    if (z === 'b') return 'Opens in a Build or Operate mandate.';
    return '';
  }

  const q = (s.q || '').toLowerCase().trim();
  const hits = useMemo(() => {
    if (!q) return [] as { r: IndexEntry; s: number }[];
    const out: { r: IndexEntry; s: number }[] = [];
    for (const r of index) {
      const hay = (r.t + ' ' + r.c + ' ' + r.w).toLowerCase();
      if (hay.indexOf(q) > -1) {
        const score = r.t.toLowerCase().indexOf(q) === 0 ? 0 : r.t.toLowerCase().indexOf(q) > -1 ? 1 : 2;
        out.push({ r, s: score });
      }
    }
    out.sort((a, b) => a.s - b.s);
    return out;
  }, [q, index]);

  return (
    <>
      <input
        ref={inputRef}
        className="sr-in"
        type="text"
        placeholder="Search every room, step, layer and jurisdiction"
        value={s.q}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => s.setQuery(e.target.value)}
      />
      {!q ? (
        <>
          <p className="note-t mt-m5">
            Type to search across all five environments. Everything the House can show you is indexed
            here — including the parts that are not yet open to you, which will say why.
          </p>
          <div className="keys mt-5">
            <span>{index.length} entries indexed</span>
          </div>
        </>
      ) : (
        <>
          <div className="eyebrow q my-m5 mb-3">
            {hits.length} {hits.length === 1 ? 'result' : 'results'}
          </div>
          <div>
            {!hits.length ? (
              <Card>
                <p className="m-0">
                  Nothing matches. The index covers rooms, steps, the nine layers of the family you
                  have chosen, jurisdictions, scenarios and gates.
                </p>
              </Card>
            ) : null}
            {hits.slice(0, 40).map((h, i) => {
              const ok = reachable(h.r.z, h.r.k);
              return (
                <button
                  key={i}
                  type="button"
                  className={'sr-r' + (ok ? '' : ' lk')}
                  onClick={() =>
                    ok
                      ? s.goTo(h.r.z, h.r.k, h.r.sub || null)
                      : s.toast('warn', 'Not yet open', reachWhy(h.r.z, h.r.k))
                  }
                >
                  <span>
                    <span className="t">{h.r.t}</span>
                    <span className="c">{h.r.c}</span>
                  </span>
                  <span className="w">
                    {h.r.w}
                    {ok ? '' : ' · not yet open'}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
