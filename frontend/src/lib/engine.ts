import type {
  BuildOptions,
  BuildResult,
  Catalog,
  Family,
  Jurisdiction,
  Layer,
  LayerOption,
  PassageEffects,
  Pool,
  SpecLine,
  YearRow,
} from './types';

/**
 * The engine. One function; every figure on every screen derives from it.
 *
 * This is a faithful port of `build()` from the original build — same ordering
 * of multiplications, same magic constants, same `Math.exp` ramp — so the
 * numbers rendered here are identical to the source site's, digit for digit.
 * `backend/app/engine.py` is the same computation in Python, used when the
 * server freezes a Model Record.
 */

export interface EngineInput {
  famKey: string | null;
  typeKey: string | null;
  jurKey: string | null;
  secondKey: string | null;
  /** Commitment in USD millions. */
  cap: number;
  /** Null means "use the institution type's default". */
  scale: number | null;
  /** layer key -> option id */
  sel: Record<string, string>;
  /** scenario key -> truthy when applied */
  stress: Record<string, unknown>;
  /** Accumulated effects of determinations taken during The Passage. */
  effects: PassageEffects;
}

export class Engine {
  constructor(private readonly catalog: Catalog) {}

  co(k: string): number {
    const rows = this.catalog.coefficients.rows;
    for (let i = 0; i < rows.length; i++) if (rows[i].k === k) return rows[i].v;
    return 0;
  }

  /** Count of coefficients still awaiting a signed source. */
  get unvalidated(): number {
    let n = 0;
    for (const row of this.catalog.coefficients.rows) if (!row.ok) n++;
    return n;
  }

  jur(k: string): Jurisdiction {
    return this.catalog.jurisdictions[k];
  }

  jFee(k: string): number {
    return this.co(this.catalog.jurisdictions[k].lic);
  }

  jCap(k: string): number {
    const j = this.catalog.jurisdictions[k];
    return j.cap ? this.co(j.cap) : 0;
  }

  family(k: string | null): Family | null {
    return k ? this.catalog.families[k] ?? null : null;
  }

  layers(k: string | null): Layer[] {
    const f = this.family(k);
    return f ? f.layers : [];
  }

  build(input: EngineInput, opt: BuildOptions = {}): BuildResult | null {
    const F = this.family(input.famKey);
    if (!F || !input.typeKey || !input.jurKey) return null;

    const T = F.types[input.typeKey];
    const J = this.catalog.jurisdictions[input.jurKey];
    if (!T || !J) return null;

    const scale = input.scale == null ? T.def : input.scale;
    const secOpt = input.secondKey ? F.second.opts[input.secondKey] : null;
    const secMult = secOpt ? secOpt.mult : 1;
    const SH: Record<string, unknown> = opt.stress ? input.stress : {};
    const P: PassageEffects = opt.noPassage ? {} : input.effects || {};

    let capex = 0;
    let opexM = 0;
    let capacity = 1;
    let ramp = 1;
    let shift = 0;
    let houseCapex = 0;
    const lines: SpecLine[] = [];

    const L = F.layers;
    for (let i = 0; i < L.length; i++) {
      const id = input.sel[L[i].key];
      if (!id) continue;
      let o: LayerOption | null = null;
      for (let k = 0; k < L[i].options.length; k++) {
        if (L[i].options[k].id === id) o = L[i].options[k];
      }
      if (!o) continue;
      capex += o.capex;
      opexM += o.opex;
      shift += o.months;
      capacity *= o.capacity;
      ramp *= o.ramp;
      if (L[i].by === 'House') houseCapex += o.capex;
      lines.push({ line: L[i].name + ' — ' + o.name, by: L[i].by, capex: o.capex, opex: o.opex });
    }

    lines.push({
      line: 'Licence application and legal — ' + J.n,
      by: 'Managed',
      capex: this.jFee(input.jurKey),
      opex: 0,
    });
    lines.push({
      line: 'Structure, policies and documentation',
      by: 'House',
      capex: this.co('doc.house'),
      opex: 0,
    });
    capex += this.jFee(input.jurKey) + this.co('doc.house');
    houseCapex += this.co('doc.house');
    opexM += this.co('ops.base');

    capacity *= P.cap || 1;
    ramp *= P.ramp || 1;
    opexM += P.opex || 0;
    capex += P.cost || 0;
    shift += P.months || 0;
    if (SH.cost) opexM *= 1.08;

    const licMonths = Math.max(2, J.mo + shift + (SH.reg ? 4 : 0));
    const goLive = licMonths + 3;
    const steady = scale * T.yield * secMult * capacity;

    const rev: number[] = [];
    const cost: number[] = [];
    const cum: number[] = [];
    let c = 0;
    for (let i2 = 1; i2 <= 60; i2++) {
      const slope = (SH.acq ? 7.5 : 4.4) / Math.max(0.5, ramp);
      const mid = goLive + (SH.acq ? 14 : 8) / Math.max(0.5, ramp);
      let r = i2 < goLive ? 0 : steady / (1 + Math.exp(-(i2 - mid) / slope));
      if (SH.vol && i2 >= goLive + 2 && i2 < goLive + 5) r *= 1.35;
      if (SH.vol && i2 >= goLive + 5) r *= 0.92;
      if (SH.sup && i2 >= goLive + 6 && i2 < goLive + 12) r *= 0.65;
      const o2 = i2 < goLive ? opexM * 0.42 : opexM;
      rev.push(r);
      cost.push(o2);
      c += r - o2;
      cum.push(c);
    }

    let be = 0;
    for (let i2 = 0; i2 < 60; i2++) {
      if (rev[i2] >= cost[i2]) {
        be = i2 + 1;
        break;
      }
    }

    const held = T.liq * scale * 1000 * (secMult > 1.3 ? 1.5 : secMult < 1 ? 0.9 : 1.2);
    const base: Pool[] = [
      { n: F.pools[0], v: capex - this.jFee(input.jurKey), note: F.poolNote[0], held: false, share: 0, drawn: 0 },
      { n: F.pools[1], v: this.jFee(input.jurKey) + this.jCap(input.jurKey), note: F.poolNote[1], held: false, share: 0, drawn: 0 },
      { n: F.pools[2], v: held, note: F.poolNote[2], held: true, share: 0, drawn: 0 },
      { n: F.pools[3], v: opexM * 24, note: F.poolNote[3], held: false, share: 0, drawn: 0 },
      { n: F.pools[4], v: opexM * 0.22 * 12, note: F.poolNote[4], held: false, share: 0, drawn: 0 },
    ];

    let sub = 0;
    for (let i2 = 0; i2 < base.length; i2++) sub += base[i2].v;
    base.push({
      n: 'Contingency reserve',
      v: sub * 0.1,
      note: 'Held outside all five. Untouched in phase one, by design.',
      held: true,
      share: 0,
      drawn: 0,
    });

    let total = 0;
    for (let i2 = 0; i2 < base.length; i2++) total += base[i2].v;
    const drawn = [62, 40, 12, 8, 4, 0];
    for (let i2 = 0; i2 < base.length; i2++) {
      base[i2].share = Math.round((base[i2].v / total) * 100);
      base[i2].drawn = drawn[i2];
    }

    const required = sub * 1.1;
    const committed = input.cap * 1e6 + (P.inject || 0) * 1e6;

    const yr: YearRow[] = [];
    for (let y = 1; y <= 5; y++) {
      let rr = 0;
      let cc = 0;
      for (let i2 = (y - 1) * 12; i2 < y * 12; i2++) {
        rr += rev[i2];
        cc += cost[i2];
      }
      yr.push({ y, rev: rr, cost: cc, res: rr - cc, cum: cum[y * 12 - 1] });
    }

    return {
      F,
      T,
      J,
      scale,
      secMult,
      lines,
      capex,
      houseCapex,
      vendorCapex: capex - houseCapex,
      opexM,
      licMonths,
      goLive,
      steady,
      rev,
      cost,
      cum,
      be,
      pools: base,
      required,
      committed,
      gap: committed - required,
      capacity,
      ramp,
      year: yr,
    };
  }
}
