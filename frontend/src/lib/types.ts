/**
 * Domain types for the Piano Nobile environment.
 *
 * These mirror, one for one, the shape of the data structures in the original
 * single-file build (`CO`, `JUR`, `FAM`, `SCEN`, `EVENTS`, `GATES`) and the
 * payload served by `GET /api/v1/catalog`.
 */

export type Tier = 'onshore' | 'mid' | 'offshore' | 'none';
export type DeliveredBy = 'House' | 'Procured' | 'Managed';
export type FamilyKey = 'cm' | 'aw' | 'bp' | 'as';
export type ZoneKey = 'g' | 'w' | 'm' | 'v' | 'b';
export type ToastKind = 'info' | 'warn' | 'ok';

/** One row of the coefficient registry. Every figure passes through here. */
export interface CoefficientRow {
  k: string;
  v: number;
  u: string;
  src: string;
  ok: boolean;
}

export interface CoefficientRegistry {
  version: string;
  owner: string;
  rows: CoefficientRow[];
}

export interface Jurisdiction {
  key: string;
  n: string;
  tier: Tier;
  tn: string;
  lic: string;
  cap: string | null;
  mo: number;
  note: string;
}

export interface InstitutionType {
  key: string;
  n: string;
  def: number;
  yield: number;
  liq: number;
  note: string;
}

export interface SecondOption {
  key: string;
  n: string;
  mult: number;
  why: string;
}

export interface SecondDetermination {
  label: string;
  key: string;
  opts: Record<string, SecondOption>;
}

export interface LayerOption {
  id: string;
  name: string;
  capex: number;
  opex: number;
  months: number;
  capacity: number;
  ramp: number;
  why: string;
  /** 'onshore' | 'fund' — a precondition that gates this option. */
  requires: string | null;
}

export interface Layer {
  key: string;
  name: string;
  by: DeliveredBy;
  q: string;
  options: LayerOption[];
}

export interface Family {
  key: FamilyKey;
  name: string;
  blurb: string;
  unit: string;
  u: string;
  min: number;
  max: number;
  step: number;
  types: Record<string, InstitutionType>;
  second: SecondDetermination;
  pools: string[];
  poolNote: string[];
  layers: Layer[];
}

export interface Scenario {
  k: string;
  n: string;
  d: string;
}

export interface EventChoice {
  t: string;
  o: string;
  m: number;
  x: number;
  ramp?: number;
  cap?: number;
  opex?: number;
  inject?: number;
}

export interface PassageEvent {
  id: string;
  gate: number;
  t: string;
  b: string;
  v: string;
  c: EventChoice[];
}

/** [reference, subject, criteria] */
export type Gate = [string, string, string];

/** One item of the Vestibule's document pack. */
export interface DocumentTemplate {
  n: string;
  d: string;
  /** 'core' — required of the legal form; 'jur' — added by the jurisdiction. */
  k: 'core' | 'jur';
}

/**
 * Document templates keyed by `party_<legal form>` and `jur_<tier>`. The pack
 * a principal actually sees is the concatenation of their party set and their
 * jurisdiction's tier set.
 */
export type DocumentTemplates = Record<string, DocumentTemplate[]>;

export interface Catalog {
  coefficients: CoefficientRegistry;
  jurisdictions: Record<string, Jurisdiction>;
  families: Record<string, Family>;
  scenarios: Scenario[];
  events: PassageEvent[];
  gates: Gate[];
  documentTemplates: DocumentTemplates;
}

/* -------------------------------------------------------------------------
   Engine output
   ------------------------------------------------------------------------- */

export interface SpecLine {
  line: string;
  by: string;
  capex: number;
  opex: number;
}

export interface Pool {
  n: string;
  v: number;
  note: string;
  held: boolean;
  share: number;
  drawn: number;
}

export interface YearRow {
  y: number;
  rev: number;
  cost: number;
  res: number;
  cum: number;
}

export interface BuildResult {
  F: Family;
  T: InstitutionType;
  J: Jurisdiction;
  scale: number;
  secMult: number;
  lines: SpecLine[];
  capex: number;
  houseCapex: number;
  vendorCapex: number;
  opexM: number;
  licMonths: number;
  goLive: number;
  steady: number;
  rev: number[];
  cost: number[];
  cum: number[];
  be: number;
  pools: Pool[];
  required: number;
  committed: number;
  gap: number;
  capacity: number;
  ramp: number;
  year: YearRow[];
}

/** Passage effects accumulated from determinations taken at the gates. */
export interface PassageEffects {
  cap?: number;
  ramp?: number;
  opex?: number;
  cost?: number;
  months?: number;
  inject?: number;
}

export interface BuildOptions {
  stress?: boolean;
  noPassage?: boolean;
}

/* -------------------------------------------------------------------------
   The Works Room
   ------------------------------------------------------------------------- */

export interface WorkItem {
  id: string;
  from: string;
  to: string;
  fee: number;
  months: number;
  mig: number;
  dis: number;
  effect: string;
  capexDelta: number;
  opexDelta: number;
}

export interface WorksTotals {
  items: { lk: string; name: string; w: WorkItem }[];
  fee: number;
  months: number;
  mig: number;
  dis: number;
  cut: number;
  disc: Record<string, number>;
  count: number;
  discCount: number;
  /** [band, explanation] */
  attr: [string, string];
  inc: [string, string];
}
