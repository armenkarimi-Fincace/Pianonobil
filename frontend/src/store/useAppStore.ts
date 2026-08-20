'use client';

import { create } from 'zustand';
import { FALLBACK_CATALOG } from '@/lib/catalog-fallback';
import { Engine } from '@/lib/engine';
import { money, stamp } from '@/lib/format';
import { MODE_MODS, REQ_SEC, STEPS, VSTEPS, WSTEPS } from '@/lib/navigation';
import { worksTotals } from '@/lib/works';
import type {
  BuildOptions,
  BuildResult,
  Catalog,
  Layer,
  PassageEffects,
  ToastKind,
  ZoneKey,
} from '@/lib/types';

/* ---------------------------------------------------------------------------
   Records kept while the environment is walked
   --------------------------------------------------------------------------- */

export interface Notice {
  kind: ToastKind;
  title: string;
  msg: string;
  at: string;
}

export interface Toast extends Notice {
  id: number;
}

export interface PassageLogEntry {
  id: string;
  gate: number;
  month: number;
  t: string;
  choice: string;
  o: string;
  x: number;
  m: number;
}

export interface PassageState {
  gate: number;
  month: number;
  cash: number;
  log: PassageLogEntry[];
  eff: PassageEffects;
  pending: { evId: string; g: number; dur: number } | null;
  started: boolean;
}

export interface WorksState {
  /** discipline key -> option id held today */
  cur: Record<string, string>;
  /** discipline key -> option id selected as a work */
  sel: Record<string, string>;
  age: number;
  ack: Record<string, boolean>;
}

export interface VestibuleState {
  party: string | null;
  docs: Record<string, boolean>;
  path: string | null;
  req: Record<string, string>;
  issued: boolean;
  accepted: boolean;
  executed: boolean;
  admitted: boolean;
}

export interface Decision {
  id: string;
  t: string;
  ws: string;
  due: string;
  money: number;
  days: number;
  ctx: string;
  opts: string[];
  view: string;
  cons: string;
}

export interface MandateState {
  mode: string;
  mod: string;
  decisions: Decision[];
  reg: { id: string; t: string; on: string; out: string }[];
  open: string | null;
  choice: number | null;
  accepted: number;
  settle: number;
  log: [string, string, string][];
}

export interface AppState {
  catalog: Catalog;
  hydrated: boolean;
  sessionToken: string | null;

  zone: ZoneKey;
  entry: 'w' | 'm' | null;
  carried: 'w' | 'm' | null;
  step: string;
  wstep: string;
  vstep: string;
  sub: string;

  fam: string | null;
  type: string | null;
  jur: string | null;
  cap: number;
  scale: number | null;
  second: string | null;

  sel: Record<string, string>;
  stress: Record<string, number>;
  ack: Record<string, boolean>;

  P: PassageState;
  W: WorksState;
  V: VestibuleState;
  M: MandateState;

  N: Notice[];
  nSeen: number;
  ov: 'map' | 'search' | 'notices' | null;
  q: string;
  seen: Record<string, number>;
  toasts: Toast[];
  scrollNonce: number;
}

const emptyPassage = (): PassageState => ({
  gate: 0,
  month: 0,
  cash: 0,
  log: [],
  eff: {},
  pending: null,
  started: false,
});

const initialState = (): Omit<AppState, 'catalog' | 'hydrated' | 'sessionToken'> => ({
  zone: 'g',
  entry: null,
  carried: null,
  step: 'constitution',
  wstep: 'standing',
  vstep: 'identity',
  sub: 'family',
  fam: null,
  type: null,
  jur: null,
  cap: 8,
  scale: null,
  second: null,
  sel: {},
  stress: {},
  ack: {},
  P: emptyPassage(),
  W: { cur: {}, sel: {}, age: 7, ack: {} },
  V: {
    party: null,
    docs: {},
    path: null,
    req: {},
    issued: false,
    accepted: false,
    executed: false,
    admitted: false,
  },
  M: {
    mode: 'Build',
    mod: 'overview',
    decisions: [],
    reg: [],
    open: null,
    choice: null,
    accepted: 18,
    settle: 3,
    log: [],
  },
  N: [],
  nSeen: 0,
  ov: null,
  q: '',
  seen: {},
  toasts: [],
  scrollNonce: 0,
});

let toastSeq = 0;

export interface AppActions {
  setCatalog: (catalog: Catalog) => void;
  setSessionToken: (token: string | null) => void;
  hydrateState: (snapshot: Partial<AppState>) => void;

  toast: (kind: ToastKind, title: string, msg: string, key?: string) => void;
  dismissToast: (id: number) => void;

  openOverlay: (k: AppState['ov']) => void;
  closeOverlay: () => void;
  setQuery: (q: string) => void;

  goZone: (k: ZoneKey) => void;
  goStep: (k: string) => void;
  goTo: (z: ZoneKey, k?: string | null, sub?: string | null) => void;
  setSub: (sub: string) => void;
  chooseDoor: (k: 'w' | 'm') => void;

  setFamily: (k: string) => void;
  setType: (k: string) => void;
  setJurisdiction: (k: string) => void;
  setSecond: (k: string) => void;
  setCap: (v: number) => void;
  setScale: (v: number) => void;
  selectLayer: (layerKey: string, optionId: string, blockedReason?: string | null) => void;
  toggleShock: (k: string) => void;
  clearShocks: () => void;

  advancePassage: () => void;
  resolvePassage: (choiceIndex: number) => void;
  restartPassage: () => void;

  setCurrent: (layerKey: string, optionId: string) => void;
  toggleWork: (layerKey: string, workId: string) => void;

  setParty: (k: string) => void;
  toggleDoc: (index: number) => void;
  setPath: (k: string) => void;
  setRequirement: (sectionKey: string, value: string) => void;

  act: (action: string) => void;

  engine: () => Engine;
  build: (opt?: BuildOptions) => BuildResult | null;
  layers: () => Layer[];
  checkCapital: () => void;
}

export type Store = AppState & AppActions;

/* ---------------------------------------------------------------------------
   Gating — which zone, step and module is open, and why not
   --------------------------------------------------------------------------- */

export function assemblyCount(s: AppState, layers: Layer[]): number {
  if (!s.fam) return 0;
  let n = 0;
  for (const l of layers) if (s.sel[l.key]) n++;
  return n;
}

export function assemblyDone(s: AppState, layers: Layer[]): boolean {
  if (!s.fam) return false;
  for (const l of layers) if (!s.sel[l.key]) return false;
  return true;
}

export function constitutionDone(s: AppState): boolean {
  return !!(s.fam && s.type && s.jur && s.second && s.ack.capital);
}

export function stressCount(s: AppState): number {
  return Object.keys(s.stress).filter((k) => s.stress[k]).length;
}

export function stepDone(s: AppState, layers: Layer[], k: string): boolean {
  if (k === 'constitution') return constitutionDone(s);
  if (k === 'assembly') return assemblyDone(s, layers);
  if (k === 'economics') return !!s.ack.economics;
  if (k === 'stress') return stressCount(s) >= 2;
  if (k === 'passage') return s.P.gate >= 6;
  if (k === 'preview') return !!s.ack.preview;
  if (k === 'record') return !!s.ack.record;
  return false;
}

export function stepOpen(s: AppState, layers: Layer[], k: string): boolean {
  const i = STEPS.findIndex((x) => x.k === k);
  for (let j = 0; j < Math.max(0, i); j++) if (!stepDone(s, layers, STEPS[j].k)) return false;
  return true;
}

export function whyLocked(s: AppState, layers: Layer[], k: string): string {
  const i = STEPS.findIndex((x) => x.k === k);
  for (let j = 0; j < Math.max(0, i); j++) {
    if (stepDone(s, layers, STEPS[j].k)) continue;
    const step = STEPS[j];
    if (step.k === 'constitution') return 'Settle the four determinations in Constitution first.';
    if (step.k === 'assembly')
      return (
        'Specify all nine layers in The Assembly first — ' +
        assemblyCount(s, layers) +
        ' of ' +
        layers.length +
        ' are set.'
      );
    if (step.k === 'economics') return 'Read The Economics and continue from the foot of that page.';
    if (step.k === 'stress')
      return 'Apply at least two shocks in The Stress Table. ' + stressCount(s) + ' applied.';
    if (step.k === 'passage') return 'Walk the passage through all six gates first.';
    if (step.k === 'preview')
      return 'Open The Room You Would Hold and continue from the foot of that page.';
  }
  return '';
}

export function wStepDone(s: AppState, layers: Layer[], k: string): boolean {
  if (k === 'standing') {
    if (!(s.fam && s.type && s.jur)) return false;
    for (const l of layers) if (!s.W.cur[l.key]) return false;
    return true;
  }
  if (k === 'diagnosis') return !!s.W.ack.diagnosis;
  if (k === 'works') return worksTotals(layers, s.W.cur, s.W.sel).count > 0;
  if (k === 'interruption') return !!s.W.ack.interruption;
  if (k === 'wrecord') return !!s.W.ack.record;
  return false;
}

export function wStepOpen(s: AppState, layers: Layer[], k: string): boolean {
  const i = WSTEPS.findIndex((x) => x.k === k);
  for (let j = 0; j < Math.max(0, i); j++) if (!wStepDone(s, layers, WSTEPS[j].k)) return false;
  return true;
}

export function wWhy(s: AppState, layers: Layer[], k: string): string {
  const i = WSTEPS.findIndex((x) => x.k === k);
  for (let j = 0; j < Math.max(0, i); j++) {
    if (wStepDone(s, layers, WSTEPS[j].k)) continue;
    const step = WSTEPS[j];
    if (step.k === 'standing')
      return 'Declare what you hold, where it is licensed, and what you run in each of the nine disciplines.';
    if (step.k === 'diagnosis') return 'Read the diagnosis and continue from the foot of that page.';
    if (step.k === 'works') return 'Select at least one work before The Interruption opens.';
    if (step.k === 'interruption')
      return 'Read what the change interrupts, and continue from the foot of that page.';
  }
  return '';
}

export function docPackLength(s: AppState, catalog: Catalog): number {
  if (!s.V.party) return 0;
  const core = catalog.documentTemplates['party_' + s.V.party] || [];
  const jur = catalog.jurisdictions[s.jur || 'adgm'] || catalog.jurisdictions.adgm;
  const byTier = catalog.documentTemplates['jur_' + (jur ? jur.tier : 'none')] || [];
  return core.length + byTier.length;
}

/** How many items of the current party's pack are marked ready. */
export function docDone(s: AppState, catalog: Catalog): number {
  const total = docPackLength(s, catalog);
  let n = 0;
  for (let i = 0; i < total; i++) if (s.V.docs[s.V.party + '|' + i]) n++;
  return n;
}

export function reqCount(s: AppState): number {
  return Object.keys(s.V.req).filter((k) => s.V.req[k]).length;
}

export function vStepDone(s: AppState, catalog: Catalog, k: string): boolean {
  if (k === 'identity') return !!s.V.party && docDone(s, catalog) >= docPackLength(s, catalog);
  if (k === 'selection') return !!s.V.path;
  if (k === 'requirements') return reqCount(s) >= REQ_SEC.length;
  if (k === 'response') return !!s.V.accepted;
  if (k === 'agreement') return !!s.V.executed;
  if (k === 'admission') return !!s.V.admitted;
  return false;
}

export function vStepOpen(s: AppState, catalog: Catalog, k: string): boolean {
  const i = VSTEPS.findIndex((x) => x.k === k);
  for (let j = 0; j < Math.max(0, i); j++) if (!vStepDone(s, catalog, VSTEPS[j].k)) return false;
  return true;
}

export function vWhy(s: AppState, catalog: Catalog, k: string): string {
  const i = VSTEPS.findIndex((x) => x.k === k);
  for (let j = 0; j < Math.max(0, i); j++) {
    if (vStepDone(s, catalog, VSTEPS[j].k)) continue;
    const step = VSTEPS[j];
    if (step.k === 'identity')
      return (
        'Declare who is engaging, and mark every document as ready. ' +
        docDone(s, catalog) +
        ' of ' +
        docPackLength(s, catalog) +
        ' are marked.'
      );
    if (step.k === 'selection')
      return 'Choose whether you are commissioning an institution or engaging a capability.';
    if (step.k === 'requirements')
      return (
        'Answer all nine sections of the Requirements Register. ' +
        reqCount(s) +
        ' of ' +
        REQ_SEC.length +
        ' answered.'
      );
    if (step.k === 'response')
      return 'The response must be issued and accepted before the agreement opens.';
    if (step.k === 'agreement')
      return 'The agreement must be executed and countersigned before admission.';
  }
  return '';
}

/** A module is open when the mandate's mode lists it. `null` means all fifteen. */
export function modOpen(s: AppState, k: string): boolean {
  const allowed = MODE_MODS[s.M.mode];
  if (!allowed) return true;
  return allowed.indexOf(k) > -1;
}

export function zoneOpen(s: AppState, k: ZoneKey): boolean {
  if (k === 'g') return true;
  if (k === 'w') return s.entry === 'w';
  if (k === 'm') return s.entry === 'm';
  if (k === 'v') return !!s.carried;
  if (k === 'b') return !!s.V.admitted;
  return false;
}

export function zoneWhy(s: AppState, k: ZoneKey): string {
  if (k === 'w')
    return s.entry
      ? 'You entered by the second door. The Works Room is closed for this session, as it would be in the live environment.'
      : 'Choose a door in the Gateway first.';
  if (k === 'm')
    return s.entry
      ? 'You entered by the first door. The Model Room is closed for this session, as it would be in the live environment.'
      : 'Choose a door in the Gateway first.';
  if (k === 'v')
    return (
      'The Vestibule opens once a record is carried across from ' +
      (s.entry === 'w' ? 'the Works Room' : s.entry === 'm' ? 'the Model Room' : 'a working room') +
      '.'
    );
  if (k === 'b')
    return 'The Mandate Room opens on admission, after the agreement is executed and countersigned.';
  return '';
}

/** Sub-step tabs for a given zone and step. */
export function subsForZone(
  s: AppState,
  layers: Layer[],
  zk: ZoneKey,
  sk: string,
): [string, string][] {
  if (zk === 'm') {
    if (sk === 'assembly') return layers.map((l) => [l.key, l.name] as [string, string]);
    const st = STEPS.find((x) => x.k === sk);
    if (!st) return [];
    return st.subs.map(([key, label]) => {
      if (label !== 'SECOND') return [key, label] as [string, string];
      const fam = s.fam ? s.catalog.families[s.fam] : null;
      return [key, fam ? fam.second.label : 'The second determination'] as [string, string];
    });
  }
  if (zk === 'w') {
    if (sk === 'works') return layers.map((l) => [l.key, l.name] as [string, string]);
    const st = WSTEPS.find((x) => x.k === sk);
    return st ? st.subs : [];
  }
  if (zk === 'v') {
    if (sk === 'requirements') return [];
    const st = VSTEPS.find((x) => x.k === sk);
    return st ? st.subs : [];
  }
  return [];
}

/* ---------------------------------------------------------------------------
   The decision queue seeded on admission
   --------------------------------------------------------------------------- */

function decisionSeed(s: AppState, layers: Layer[]): Decision[] {
  if (!s.fam || !layers.length) return [];
  const jurName = s.jur ? s.catalog.jurisdictions[s.jur].n : 'your jurisdiction';
  const jurRoute = s.jur ? s.catalog.jurisdictions[s.jur].n : 'the onshore route';
  return [
    {
      id: 'D-021',
      t: layers[0].name + ' — provider shortlist',
      ws: layers[0].name,
      due: '2 August',
      money: 14500,
      days: 12,
      ctx: 'Three providers have been evaluated against depth, cost, jurisdiction and settlement terms. The House has a preference and states it, with reasoning. The determination is yours.',
      opts: [
        'Proceed with the recommended provider',
        'Proceed with the alternative',
        'Request a further candidate',
      ],
      view:
        'Recommended: the first. It is the only candidate whose disclosure structure is accepted in ' +
        jurName +
        ' without a supplementary opinion.',
      cons: 'A determination after 8 August moves Gate 3 by approximately three weeks.',
    },
    {
      id: 'D-022',
      t: 'Vendor quotation VQ-014 · ' + layers[2].name,
      ws: layers[2].name,
      due: '5 August',
      money: 8200,
      days: 6,
      ctx: 'A quotation has been relayed from the counterparty. Payable by you directly to them; X-CHASE receives no part of this amount.',
      opts: ['Approve the quotation', 'Request alternatives', 'Decline'],
      view: 'Recommended: approve. Two alternatives were considered; both required a longer minimum term.',
      cons: 'The quotation expires 30 August. After that the price is re-opened.',
    },
    {
      id: 'D-023',
      t: 'Jurisdiction confirmation',
      ws: layers[1].name,
      due: '12 August',
      money: 61000,
      days: 34,
      ctx:
        'The Blueprint recommended ' +
        jurRoute +
        '. A second route remains open at lower cost and lower standing. This decision cannot be reversed after submission is lodged.',
      opts: ['Confirm ' + jurRoute, 'Proceed with the offshore route first', 'Defer pending further analysis'],
      view: 'Recommended: confirm. The offshore route saves approximately four months and costs you the institutional counterparties you named as your objective.',
      cons: 'Every downstream workstream depends on this. Nothing material proceeds until it is settled.',
    },
  ];
}

/* ---------------------------------------------------------------------------
   Store
   --------------------------------------------------------------------------- */

export const useAppStore = create<Store>((set, get) => ({
  catalog: FALLBACK_CATALOG,
  hydrated: false,
  sessionToken: null,
  ...initialState(),

  setCatalog: (catalog) => set({ catalog, hydrated: true }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  hydrateState: (snapshot) => set(snapshot as Partial<Store>),

  engine: () => new Engine(get().catalog),

  layers: () => {
    const s = get();
    return s.fam ? s.catalog.families[s.fam]?.layers ?? [] : [];
  },

  build: (opt = {}) => {
    const s = get();
    return new Engine(s.catalog).build(
      {
        famKey: s.fam,
        typeKey: s.type,
        jurKey: s.jur,
        secondKey: s.second,
        cap: s.cap,
        scale: s.scale,
        sel: s.sel,
        stress: s.stress,
        effects: s.P.eff,
      },
      opt,
    );
  },

  toast: (kind, title, msg, key) => {
    const s = get();
    if (key) {
      if (s.seen[key]) return;
      set({ seen: { ...s.seen, [key]: 1 } });
    }
    const id = ++toastSeq;
    const entry: Toast = { id, kind, title, msg, at: stamp() };
    const N = [{ kind, title, msg, at: entry.at }, ...s.N].slice(0, 200);
    set({ N, toasts: [...get().toasts, entry] });
    if (typeof window !== 'undefined') {
      window.setTimeout(
        () => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),
        kind === 'warn' ? 11000 : 8000,
      );
    }
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  openOverlay: (k) =>
    set((s) => ({
      ov: k,
      nSeen: k === 'notices' ? s.N.length : s.nSeen,
      q: k === 'search' ? s.q : '',
    })),

  closeOverlay: () => set({ ov: null, q: '' }),
  setQuery: (q) => set({ q }),

  goZone: (k) => {
    const s = get();
    if (!zoneOpen(s, k)) {
      get().toast('warn', 'Not open', zoneWhy(s, k));
      return;
    }
    const layers = get().layers();
    const patch: Partial<AppState> = { zone: k };
    if (k === 'm') {
      const sub = subsForZone(s, layers, 'm', s.step);
      patch.sub = sub.length ? sub[0][0] : '';
    }
    if (k === 'w') {
      const sub = subsForZone(s, layers, 'w', s.wstep);
      patch.sub = sub.length ? sub[0][0] : '';
    }
    if (k === 'v') {
      const sub = subsForZone(s, layers, 'v', s.vstep);
      patch.sub = sub.length ? sub[0][0] : '';
    }
    set({ ...(patch as Partial<Store>), scrollNonce: s.scrollNonce + 1 });
  },

  goStep: (k) => {
    const s = get();
    const layers = get().layers();
    if (s.zone === 'm') {
      if (!stepOpen(s, layers, k)) {
        get().toast('warn', 'Not yet open', whyLocked(s, layers, k));
        return;
      }
      const sub = subsForZone(s, layers, 'm', k);
      set({ step: k, sub: sub.length ? sub[0][0] : '', scrollNonce: s.scrollNonce + 1 });
    } else if (s.zone === 'w') {
      if (!wStepOpen(s, layers, k)) {
        get().toast('warn', 'Not yet open', wWhy(s, layers, k));
        return;
      }
      const sub = subsForZone(s, layers, 'w', k);
      set({ wstep: k, sub: sub.length ? sub[0][0] : '', scrollNonce: s.scrollNonce + 1 });
    } else if (s.zone === 'v') {
      if (!vStepOpen(s, s.catalog, k)) {
        get().toast('warn', 'Not yet open', vWhy(s, s.catalog, k));
        return;
      }
      const sub = subsForZone(s, layers, 'v', k);
      set({ vstep: k, sub: sub.length ? sub[0][0] : '', scrollNonce: s.scrollNonce + 1 });
    }
  },

  goTo: (z, k, subKey) => {
    const s = get();
    const layers = get().layers();
    if (!zoneOpen(s, z)) {
      get().toast('warn', 'Not open', zoneWhy(s, z));
      return;
    }
    const patch: Partial<AppState> = { zone: z };
    if (k) {
      if (z === 'm') {
        if (!stepOpen(s, layers, k)) {
          get().toast('warn', 'Not yet open', whyLocked(s, layers, k));
          set({ zone: z });
          return;
        }
        patch.step = k;
      }
      if (z === 'w') {
        if (!wStepOpen(s, layers, k)) {
          get().toast('warn', 'Not yet open', wWhy(s, layers, k));
          set({ zone: z });
          return;
        }
        patch.wstep = k;
      }
      if (z === 'v') {
        if (!vStepOpen(s, s.catalog, k)) {
          get().toast('warn', 'Not yet open', vWhy(s, s.catalog, k));
          set({ zone: z });
          return;
        }
        patch.vstep = k;
      }
      if (z === 'b') {
        if (!modOpen(s, k)) {
          get().toast(
            'warn',
            'Not open in this mandate',
            'Module ' + k + ' opens in a Build or Operate mandate. This mandate is running as ' + s.M.mode + '.',
          );
          set({ zone: z });
          return;
        }
        patch.M = { ...s.M, mod: k, open: null };
      }
    }
    const sk = z === 'm' ? patch.step ?? s.step : z === 'w' ? patch.wstep ?? s.wstep : z === 'v' ? patch.vstep ?? s.vstep : null;
    if (sk) {
      const sub = subsForZone(s, layers, z, sk);
      patch.sub = sub.length ? sub[0][0] : '';
    }
    if (subKey) patch.sub = subKey;
    set({ ...(patch as Partial<Store>), ov: null, q: '', scrollNonce: s.scrollNonce + 1 });
  },

  setSub: (sub) => set((s) => ({ sub, scrollNonce: s.scrollNonce + 1 })),

  chooseDoor: (k) => {
    const s = get();
    if (s.entry && s.entry !== k) {
      get().toast(
        'warn',
        'The other room is closed',
        'You entered by ' +
          (s.entry === 'w' ? 'the first door' : 'the second door') +
          '. In the live environment a principal declares this once, and the House does not ask again.',
      );
      return;
    }
    if (!s.entry) {
      set({ entry: k });
      get().toast(
        'ok',
        k === 'w' ? 'The Works Room' : 'The Model Room',
        k === 'w'
          ? 'The House will begin with what you run today, discipline by discipline, rather than with a blank page.'
          : 'The House will begin with four determinations, and everything downstream recomputes from them.',
      );
    }
    get().goZone(k);
  },

  setFamily: (f) => {
    const s = get();
    if (s.fam === f) return;
    const had = !!(s.fam && (s.type || Object.keys(s.sel).length || Object.keys(s.W.cur).length));
    set({
      fam: f,
      type: null,
      second: null,
      sel: {},
      scale: null,
      ack: {},
      W: { ...s.W, cur: {}, sel: {}, ack: {} },
      P: emptyPassage(),
      stress: {},
      seen: {},
      ...(s.zone === 'm'
        ? { step: 'constitution', sub: 'type' }
        : { wstep: 'standing', sub: 'hold' }),
    });
    if (had) {
      get().toast(
        'info',
        'Specification cleared',
        'Nothing transfers between families. The room now asks the questions ' +
          s.catalog.families[f].name +
          ' requires.',
      );
    }
  },

  setType: (k) => {
    const s = get();
    set({
      type: k,
      scale: null,
      sub: s.zone === 'm' ? (s.jur ? 'capital' : 'jur') : s.jur ? 'stack' : 'licence',
    });
    if (s.zone === 'm') get().checkCapital();
  },

  setJurisdiction: (jk) => {
    const s = get();
    const old = s.jur;
    const layers = get().layers();
    const sel = { ...s.sel };
    const cleared: string[] = [];
    if (s.catalog.jurisdictions[jk].tier !== 'onshore') {
      for (const layer of layers) {
        const sid = sel[layer.key];
        if (!sid) continue;
        for (const opt of layer.options) {
          if (opt.id === sid && opt.requires === 'onshore') {
            delete sel[layer.key];
            cleared.push(layer.name);
          }
        }
      }
    }
    set({
      jur: jk,
      sel,
      ...(old !== jk ? { sub: s.zone === 'm' ? 'capital' : 'stack' } : {}),
    });
    if (cleared.length) {
      get().toast(
        'warn',
        'Layers cleared',
        cleared.join(' and ') +
          ' required onshore standing. ' +
          (cleared.length > 1 ? 'Those choices have' : 'That choice has') +
          ' been cleared.',
      );
    }
    if (s.zone === 'm') get().checkCapital();
  },

  setSecond: (k) => set({ second: k }),
  setCap: (v) => set({ cap: v }),
  setScale: (v) => set({ scale: v }),

  selectLayer: (layerKey, optionId, blockedReason) => {
    const s = get();
    if (blockedReason) {
      const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;
      get().toast(
        'warn',
        'Not available',
        blockedReason +
          '. ' +
          (blockedReason.indexOf('onshore') > -1 && jur
            ? 'You have chosen ' +
              jur.n +
              ', which is ' +
              jur.tn.toLowerCase() +
              '. Change the jurisdiction in Constitution to open this line.'
            : 'Change the institution type in Constitution to open this line.'),
      );
      return;
    }
    const sel = { ...s.sel, [layerKey]: optionId };
    set({ sel });
    const layers = get().layers();
    if (assemblyDone({ ...s, sel }, layers)) {
      get().toast(
        'ok',
        'Assembly complete',
        'All ' + layers.length + ' layers are specified. The Economics is now open.',
      );
    }
    get().checkCapital();
  },

  toggleShock: (k) => {
    const s = get();
    const stress = { ...s.stress };
    if (stress[k]) delete stress[k];
    else stress[k] = 1;
    set({ stress });
  },

  clearShocks: () => set({ stress: {} }),

  checkCapital: () => {
    const R = get().build({ stress: false });
    if (!R) return;
    if (R.gap < 0) {
      get().toast(
        'warn',
        'Capital',
        'The structure requires ' +
          money(-R.gap) +
          ' more than you have committed. The House will not proceed on a structure that is underfunded at the outset.',
        'gap',
      );
    } else {
      set((s) => ({ seen: { ...s.seen, gap: 0 } }));
    }
  },

  advancePassage: () => {
    const s = get();
    const R = get().build({ stress: true });
    if (!R) return;
    const g = s.P.gate + 1;
    const used = new Set(s.P.log.map((l) => l.id));
    const ev = s.catalog.events.find((e) => e.gate === g && !used.has(e.id)) || null;
    const dur = Math.max(1, Math.round(R.goLive / 6));
    const P: PassageState = { ...s.P, started: true };
    if (!s.P.started) P.cash = R.committed;
    if (ev) {
      P.pending = { evId: ev.id, g, dur };
      set({ P });
      get().toast(
        'info',
        'Gate ' + g,
        'A matter has arisen and requires your determination before the gate can close.',
      );
    } else {
      P.gate = g;
      P.month += dur;
      P.cash -= R.opexM * 0.42 * dur + R.capex / 6;
      set({ P });
      if (g >= 6) get().toast('ok', 'Gate 6', 'The institution opened in month ' + P.month + '.');
    }
  },

  resolvePassage: (ix) => {
    const s = get();
    const p = s.P.pending;
    if (!p) return;
    const ev = s.catalog.events.find((e) => e.id === p.evId);
    if (!ev) return;
    const c = ev.c[ix];
    const R = get().build({ stress: true });
    if (!R) return;

    const eff: PassageEffects = { ...s.P.eff };
    eff.cap = (eff.cap || 1) * (c.cap || 1);
    eff.ramp = (eff.ramp || 1) * (c.ramp || 1);
    eff.opex = (eff.opex || 0) + (c.opex || 0);
    eff.cost = (eff.cost || 0) + (c.x || 0);
    eff.months = (eff.months || 0) + (c.m || 0);
    eff.inject = (eff.inject || 0) + (c.inject || 0);

    const months = p.dur + (c.m || 0);
    const month = s.P.month + months;
    let cash = s.P.cash - (R.opexM * 0.42 * months + R.capex / 6 + (c.x || 0));
    if (c.inject) cash += c.inject * 1e6;

    const P: PassageState = {
      ...s.P,
      eff,
      gate: p.g,
      month,
      cash,
      pending: null,
      log: [
        ...s.P.log,
        { id: ev.id, gate: p.g, month, t: ev.t, choice: c.t, o: c.o, x: c.x || 0, m: c.m || 0 },
      ],
    };
    set({ P });

    if (cash < 0) {
      get().toast(
        'warn',
        'Capital',
        'The passage has consumed more than you committed. A capital call would be required at this point.',
        'cash',
      );
    }
    if (P.gate >= 6) get().toast('ok', 'Gate 6', 'The institution opened in month ' + month + '.');
  },

  restartPassage: () => {
    set({ P: emptyPassage() });
    get().toast('info', 'Passage reset', 'The record of the previous walk has been discarded.');
  },

  setCurrent: (layerKey, optionId) => {
    const s = get();
    const cur = { ...s.W.cur, [layerKey]: optionId };
    set({ W: { ...s.W, cur } });
    const layers = get().layers();
    if (wStepDone({ ...s, W: { ...s.W, cur } }, layers, 'standing')) {
      get().toast(
        'ok',
        'Standing declared',
        'All nine disciplines are declared. The Diagnosis is now open.',
      );
    }
  },

  toggleWork: (layerKey, workId) => {
    const s = get();
    const sel = { ...s.W.sel };
    if (sel[layerKey] === workId) delete sel[layerKey];
    else sel[layerKey] = workId;
    set({ W: { ...s.W, sel } });
    const T = worksTotals(get().layers(), s.W.cur, sel);
    if (T.dis >= 10) {
      get().toast(
        'warn',
        'Scope',
        'The programme now touches ' +
          T.discCount +
          ' disciplines at once. The House would recommend splitting it across two windows rather than running it as one.',
        'split',
      );
    }
  },

  setParty: (k) => set((s) => ({ V: { ...s.V, party: k }, sub: 'docs' })),

  toggleDoc: (index) => {
    const s = get();
    const key = s.V.party + '|' + index;
    const docs = { ...s.V.docs };
    if (docs[key]) delete docs[key];
    else docs[key] = true;
    const V = { ...s.V, docs };
    set({ V });
    if (vStepDone({ ...s, V }, s.catalog, 'identity')) {
      get().toast('ok', 'Identity lodged', 'Every item is marked ready. Selection is now open.');
    }
  },

  setPath: (k) => {
    set((s) => ({ V: { ...s.V, path: k } }));
    get().toast(
      'ok',
      'Path settled',
      k === 'turnkey'
        ? 'A turnkey mandate. One institution, one mandate.'
        : 'A single-service engagement. Selection is plural here — you may engage one discipline or several.',
    );
  },

  setRequirement: (sectionKey, value) => {
    const s = get();
    const req = { ...s.V.req, [sectionKey]: value };
    const V = { ...s.V, req };
    set({ V });
    if (vStepDone({ ...s, V }, s.catalog, 'requirements')) {
      get().toast(
        'ok',
        'Register complete',
        'All nine sections are answered. Submitting commits you to nothing.',
      );
    }
  },

  act: (a) => {
    const s = get();
    const t = get().toast;

    if (a.indexOf('nextLayer:') === 0 || a.indexOf('wNext:') === 0) {
      get().setSub(a.split(':')[1]);
      return;
    }

    /* ---- model room ---- */
    if (a === 'ackCapital') {
      set({ ack: { ...s.ack, capital: true }, sub: 'second' });
      const R = get().build({ stress: false });
      if (R && R.gap < 0) {
        t(
          'warn',
          'Settled with a shortfall',
          'The commitment is recorded, and the structure is still short by ' + money(-R.gap) + '.',
        );
      } else {
        t('ok', 'Commitment settled', 'The commitment is recorded.');
      }
      return;
    }
    if (a === 'goAssembly') return get().goStep('assembly');
    if (a === 'goEconomics') return get().goStep('economics');
    if (a === 'ackEconomics') {
      if (!s.ack.economics) {
        set({ ack: { ...s.ack, economics: true } });
        t('ok', 'Acknowledged', 'The Stress Table is now open.');
      } else {
        get().goStep('stress');
      }
      return;
    }
    if (a === 'clearShocks') return get().clearShocks();
    if (a === 'goPassage') return get().goStep('passage');
    if (a === 'advancePassage') return get().advancePassage();
    if (a === 'restartPassage') return get().restartPassage();
    if (a === 'goPreview') return get().goStep('preview');
    if (a === 'ackPreview') {
      if (!s.ack.preview) {
        set({ ack: { ...s.ack, preview: true } });
        t('ok', 'Acknowledged', 'The Record is now open.');
      } else {
        get().goStep('record');
      }
      return;
    }
    if (a === 'printRecord') {
      let ok = false;
      try {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
          window.print();
          ok = true;
        }
      } catch {
        /* the viewer may block printing */
      }
      if (!ok) {
        t('info', 'Printing', 'This viewer may block printing. Open the file in a browser tab and use File → Print.');
      }
      return;
    }
    if (a === 'carry') {
      set({ ack: { ...s.ack, record: true }, carried: 'm' });
      t(
        'ok',
        'Record frozen',
        'Model Record MR-0114 is frozen and stamped with model ' +
          s.catalog.coefficients.version +
          '. The Vestibule is now open.',
      );
      get().goZone('v');
      return;
    }

    /* ---- works room ---- */
    if (a === 'wGoDiagnosis') return get().goStep('diagnosis');
    if (a === 'wAckDiagnosis') {
      if (!s.W.ack.diagnosis) {
        set({ W: { ...s.W, ack: { ...s.W.ack, diagnosis: true } } });
        t('ok', 'Acknowledged', 'The Works is now open.');
      } else {
        get().goStep('works');
      }
      return;
    }
    if (a === 'wGoInterruption') return get().goStep('interruption');
    if (a === 'wAckInterruption') {
      if (!s.W.ack.interruption) {
        set({ W: { ...s.W, ack: { ...s.W.ack, interruption: true } } });
        t('ok', 'Acknowledged', 'The Record is now open.');
      } else {
        get().goStep('wrecord');
      }
      return;
    }
    if (a === 'wCarry') {
      set({
        W: { ...s.W, ack: { ...s.W.ack, record: true } },
        carried: 'w',
        V: { ...s.V, path: 'single' },
      });
      t(
        'ok',
        'Record frozen',
        'Works Record WR-0207 is frozen. The Vestibule is now open, with these disciplines already selected.',
      );
      get().goZone('v');
      return;
    }

    /* ---- vestibule ---- */
    if (a === 'vGoSelection') return get().goStep('selection');
    if (a === 'vGoRequirements') return get().goStep('requirements');
    if (a === 'vSubmit') {
      get().goStep('response');
      t(
        'info',
        'Submitted',
        'A named senior person will read the register. A written response is issued by a date the House states in advance.',
      );
      return;
    }
    if (a === 'vIssue') {
      set({ V: { ...s.V, issued: true } });
      t('ok', 'Response issued', 'Ten parts, signed by name. You may accept, ask for clarification, ask for a revision, or decline.');
      return;
    }
    if (a === 'vAccept') {
      set({ V: { ...s.V, accepted: true } });
      t('ok', 'Accepted', 'The agreement is now open. Your own work is annexed to it.');
      return;
    }
    if (a === 'vRevise') {
      t('info', 'Revision requested', 'Recorded. Most mandates are executed on the second version.');
      return;
    }
    if (a === 'vDecline') {
      t(
        'warn',
        'Declined',
        'Recorded, with a reason if you wish to give one. Nothing is owed. Declines are among the most useful information the House receives.',
      );
      return;
    }
    if (a === 'vGoAgreement') return get().goStep('agreement');
    if (a === 'vExecute') {
      set({ V: { ...s.V, executed: true } });
      t('ok', 'Executed', 'Countersigned by the House. Admission is now open.');
      return;
    }
    if (a === 'vGoAdmission') return get().goStep('admission');
    if (a === 'vAdmit') {
      const layers = get().layers();
      set({
        V: { ...s.V, admitted: true },
        M: {
          ...s.M,
          mode: s.V.path === 'turnkey' ? 'Build' : 'Discrete',
          decisions: decisionSeed(s, layers),
          log: [
            ['Mandate admitted', '11 August, 09:12', 'System'],
            ['Agreement countersigned', '11 August, 09:04', 'Niki Saki'],
            ['Response accepted', '8 August, 16:40', 'Principal'],
          ],
        },
      });
      t(
        'ok',
        'Welcome to the Piano Nobile',
        'The Mandate Room is open. Your Mandate Lead is Sam Hesam, and the first review is on 26 August.',
      );
      get().goZone('b');
      return;
    }

    /* ---- mandate room ---- */
    if (a === 'mClose') {
      set((st) => ({ M: { ...st.M, open: null, choice: null }, scrollNonce: st.scrollNonce + 1 }));
      return;
    }
    if (a === 'mRecord') {
      const oid = s.M.open;
      const ix = s.M.decisions.findIndex((d) => d.id === oid);
      const dd = ix >= 0 ? s.M.decisions[ix] : null;
      if (dd && s.M.choice !== null) {
        const decisions = s.M.decisions.filter((_, i) => i !== ix);
        set({
          M: {
            ...s.M,
            decisions,
            reg: [{ id: dd.id, t: dd.t, on: '11 August', out: dd.opts[s.M.choice] }, ...s.M.reg],
            log: [
              [dd.id + ' determined — ' + dd.opts[s.M.choice], '11 August, 10:22', 'Principal'],
              ...s.M.log,
            ],
            open: null,
            choice: null,
          },
          scrollNonce: s.scrollNonce + 1,
        });
        t(
          'ok',
          'Determination recorded',
          dd.id +
            ' is recorded in a register that cannot be amended. A determination later reversed appears twice, with both dates.',
        );
      } else {
        set({ M: { ...s.M, open: null, choice: null } });
      }
      return;
    }
    if (a === 'mAccept') {
      const accepted = s.M.accepted + 1;
      set({
        M: {
          ...s.M,
          accepted,
          log: [['Brand book v2 accepted', '11 August, 11:05', 'Principal'], ...s.M.log],
        },
      });
      t('ok', 'Deliverable accepted', accepted + ' of 81 accepted. Acceptance is the unit of progress.');
      return;
    }
  },
}));
