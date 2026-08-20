import type { Layer, WorkItem, WorksTotals } from './types';

/**
 * The Works Room arithmetic, ported verbatim.
 *
 * A "work" is a move from the configuration a principal holds today to a
 * heavier one further down the same layer's option list. Fees, duration,
 * migration effort and disruption are derived from that gap.
 */

export const GRADE: Record<number, { n: string; f: string }> = {
  1: {
    n: 'Below standard',
    f: 'The configuration the House would not sign off for a client-facing institution. It is the first thing a counterparty, an auditor or an acquirer will find.',
  },
  2: {
    n: 'Adequate, exposed',
    f: 'It functions. It has no redundancy and no evidence, and it will be the constraint on your next stage of growth.',
  },
  3: {
    n: 'Sound',
    f: 'Appropriate for the institution as it stands. Revisit when scale or jurisdiction changes.',
  },
  4: {
    n: 'Strong',
    f: 'No work proposed. The House will say so rather than invent an engagement.',
  },
};

export function gradeOf(layers: Layer[], cur: Record<string, string>, lk: string): number {
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].key !== lk) continue;
    const id = cur[lk];
    if (!id) return 0;
    for (let j = 0; j < layers[i].options.length; j++) {
      if (layers[i].options[j].id === id) {
        return Math.min(4, Math.round(1 + j * (3 / Math.max(1, layers[i].options.length - 1))));
      }
    }
  }
  return 0;
}

export function curIndex(layers: Layer[], cur: Record<string, string>, lk: string): number {
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].key !== lk) continue;
    for (let j = 0; j < layers[i].options.length; j++) {
      if (layers[i].options[j].id === cur[lk]) return j;
    }
  }
  return -1;
}

/** The works available on a discipline are the configurations above the one you hold. */
export function worksFor(layers: Layer[], cur: Record<string, string>, lk: string): WorkItem[] {
  let lay: Layer | null = null;
  for (let i = 0; i < layers.length; i++) if (layers[i].key === lk) lay = layers[i];
  if (!lay) return [];

  const ci = curIndex(layers, cur, lk);
  if (ci < 0) return [];

  const current = lay.options[ci];
  const out: WorkItem[] = [];
  for (let i = ci + 1; i < lay.options.length; i++) {
    const t = lay.options[i];
    const gap = i - ci;
    const fee = Math.round((Math.max(0, t.capex - current.capex) * 0.42 + 26000 + gap * 9000) / 1000) * 1000;
    const months = Math.max(2, Math.round(2 + gap * 1.6 + Math.max(0, t.months)));
    const mig = lay.by === 'House' ? 0 : Math.round(gap * 11 + Math.max(0, t.months) * 4);
    const dis = Math.min(4, gap + (lay.by === 'Procured' ? 1 : 0));
    out.push({
      id: t.id,
      from: current.name,
      to: t.name,
      fee,
      months,
      mig,
      dis,
      effect: t.why,
      capexDelta: t.capex - current.capex,
      opexDelta: t.opex - current.opex,
    });
  }
  return out;
}

export function worksTotals(
  layers: Layer[],
  cur: Record<string, string>,
  sel: Record<string, string>,
): WorksTotals {
  const out: WorksTotals = {
    items: [],
    fee: 0,
    months: 0,
    mig: 0,
    dis: 0,
    cut: 0,
    disc: {},
    count: 0,
    discCount: 0,
    attr: ['', ''],
    inc: ['', ''],
  };

  for (const lk of Object.keys(sel)) {
    if (!sel[lk]) continue;
    const w = worksFor(layers, cur, lk);
    for (let i = 0; i < w.length; i++) {
      if (w[i].id !== sel[lk]) continue;
      let nm = '';
      for (let j = 0; j < layers.length; j++) if (layers[j].key === lk) nm = layers[j].name;
      out.items.push({ lk, name: nm, w: w[i] });
      out.fee += w[i].fee;
      out.mig += w[i].mig;
      out.dis += w[i].dis;
      if (w[i].mig > 0) out.cut++;
      out.disc[lk] = 1;
      if (w[i].months > out.months) out.months = w[i].months;
    }
  }

  out.count = out.items.length;
  out.discCount = Object.keys(out.disc).length;
  out.months = out.count ? out.months + Math.round(out.count * 0.9) : 0;

  const a = out.dis * 7;
  const b = out.dis * 9;
  out.attr =
    a <= 12
      ? ['Low', 'Fewer clients are expected to leave during the change than leave in an ordinary quarter.']
      : a <= 40
        ? ['Material', 'Losses above the ordinary rate are expected. Announce the change yourself, in advance.']
        : ['Severe', 'The programme should be split across two windows rather than run as one.'];
  out.inc =
    b <= 20
      ? ['Low', 'One cutover, with a rollback held. An incident is unlikely and recoverable.']
      : b <= 60
        ? ['Material', 'Several cutovers. Expect one to require the rollback. Plan the weekend accordingly.']
        : ['Severe', 'Too many simultaneous changes. The House would decline to run this as one programme.'];

  return out;
}
