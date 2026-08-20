import type { ZoneKey } from './types';

/**
 * The static navigation model: zones, steps, sub-steps and the module list of
 * the Mandate Room. Preserved from the original build, including the ordering
 * and the two-digit step numbers that appear in the rail.
 */

export interface StepDef {
  k: string;
  n: string;
  t: string;
  /** [subKey, label] — the label 'SECOND' is resolved to the family's own wording. */
  subs: [string, string][];
}

export const ZONES: { k: ZoneKey; n: string }[] = [
  { k: 'g', n: 'Gateway' },
  { k: 'w', n: 'Works Room' },
  { k: 'm', n: 'Model Room' },
  { k: 'v', n: 'The Vestibule' },
  { k: 'b', n: 'The Mandate Room' },
];

export const ZONE_NAMES: Record<ZoneKey, string> = {
  g: 'Gateway',
  w: 'Works Room',
  m: 'Model Room',
  v: 'The Vestibule',
  b: 'The Mandate Room',
};

/** The Model Room — seven steps. */
export const STEPS: StepDef[] = [
  {
    k: 'constitution',
    n: '01',
    t: 'Constitution',
    subs: [
      ['family', 'What family'],
      ['type', 'What you are building'],
      ['jur', 'Where it sits'],
      ['capital', 'Capital committed'],
      ['second', 'SECOND'],
    ],
  },
  { k: 'assembly', n: '02', t: 'The Assembly', subs: [] },
  {
    k: 'economics',
    n: '03',
    t: 'The Economics',
    subs: [
      ['build', 'Build and running cost'],
      ['pools', 'The capital pools'],
      ['sens', 'Sensitivity'],
    ],
  },
  {
    k: 'stress',
    n: '04',
    t: 'The Stress Table',
    subs: [
      ['scen', 'Scenarios'],
      ['effect', 'What the shocks cost'],
    ],
  },
  {
    k: 'passage',
    n: '05',
    t: 'The Passage',
    subs: [
      ['walk', 'Walk the passage'],
      ['log', 'Record of passage'],
    ],
  },
  { k: 'preview', n: '06', t: 'The Room You Would Hold', subs: [['preview', 'Day ninety']] },
  { k: 'record', n: '07', t: 'The Record', subs: [['record', 'Model Record']] },
];

/** The Works Room — five steps. */
export const WSTEPS: StepDef[] = [
  {
    k: 'standing',
    n: '01',
    t: 'The Standing',
    subs: [
      ['hold', 'What you hold'],
      ['licence', 'Where it is licensed'],
      ['stack', 'What you run today'],
    ],
  },
  {
    k: 'diagnosis',
    n: '02',
    t: 'The Diagnosis',
    subs: [
      ['all', 'All nine disciplines'],
      ['weak', 'Below standard'],
      ['sound', 'Sound or strong'],
    ],
  },
  { k: 'works', n: '03', t: 'The Works', subs: [] },
  {
    k: 'interruption',
    n: '04',
    t: 'The Interruption',
    subs: [
      ['exposure', 'What it interrupts'],
      ['sequence', 'Sequence of works'],
      ['rules', 'Five disciplines of migration'],
    ],
  },
  { k: 'wrecord', n: '05', t: 'The Record', subs: [['record', 'Works Record']] },
];

/** The Vestibule — six steps. */
export const VSTEPS: StepDef[] = [
  {
    k: 'identity',
    n: '01',
    t: 'Identity',
    subs: [
      ['who', 'Who is engaging'],
      ['docs', 'Documents'],
      ['notes', 'Notes from the House'],
    ],
  },
  {
    k: 'selection',
    n: '02',
    t: 'Selection',
    subs: [
      ['path', 'Path'],
      ['scope', 'Scope'],
    ],
  },
  { k: 'requirements', n: '03', t: 'Requirements Register', subs: [] },
  {
    k: 'response',
    n: '04',
    t: 'The Response',
    subs: [
      ['waiting', 'Under consideration'],
      ['document', 'The response document'],
    ],
  },
  {
    k: 'agreement',
    n: '05',
    t: 'Agreement',
    subs: [
      ['execution', 'Execution'],
      ['fees', 'Fee schedule'],
    ],
  },
  { k: 'admission', n: '06', t: 'Admission', subs: [['crossing', 'The crossing']] },
];

/** The Mandate Room — fifteen modules. [number, key, title, blurb] */
export const MODS: [string, string, string, string][] = [
  ['01', 'overview', 'Overview', 'Everything that stands with you today'],
  ['02', 'mandate', 'The Mandate', 'Scope, four phases, six gates'],
  ['03', 'workstreams', 'Workstreams', 'Nine disciplines, each with an attribution'],
  ['04', 'decisions', 'Decisions', 'What requires the principal'],
  ['05', 'deliverables', 'Deliverables', 'Counted, never estimated'],
  ['06', 'documents', 'Documents', 'Watermarked on opening'],
  ['07', 'settlements', 'Fees & Settlements', 'Two ledgers'],
  ['08', 'capital', 'Capital Deployment', 'Six pools, reconciled monthly'],
  ['09', 'counterparties', 'Counterparties', 'Named, with direct contact'],
  ['10', 'regulatory', 'Regulatory Pathway', 'Seven milestones'],
  ['11', 'reporting', 'Reporting', 'Monthly, quarterly, gate'],
  ['12', 'intelligence', 'Intelligence', 'The Keystone, and private briefings'],
  ['13', 'team', 'The Team', 'Named people, both sides'],
  ['14', 'correspondence', 'Correspondence', 'A register, not a chat'],
  ['15', 'settings', 'Settings & Audit', 'The log belongs to you'],
];

export const MODES = ['Blueprint', 'Discrete', 'Build', 'Operate'] as const;
export type MandateMode = (typeof MODES)[number];

/** Which modules a mandate of each mode opens. `null` means all fifteen. */
export const MODE_MODS: Record<string, string[] | null> = {
  Blueprint: ['overview', 'mandate', 'workstreams', 'decisions', 'deliverables', 'documents', 'correspondence', 'settings'],
  Discrete: [
    'overview',
    'mandate',
    'workstreams',
    'decisions',
    'deliverables',
    'documents',
    'settlements',
    'counterparties',
    'correspondence',
    'settings',
  ],
  Build: null,
  Operate: null,
};

/* ---- The Vestibule's document pack ---------------------------------- */

export const PARTIES: Record<string, { n: string; s: string }> = {
  individual: { n: 'An individual', s: 'A natural person engaging in their own name' },
  company: { n: 'An existing company', s: 'Already incorporated and operating' },
  newco: { n: 'A company to be formed', s: 'The entity does not exist yet' },
  office: { n: 'A trust, foundation or private office', s: 'A structure that may not be a company at all' },
};

export const REQ_SEC = [
  'Objectives',
  'Jurisdiction',
  'Liquidity or equivalent',
  'Technology',
  'Risk',
  'Banking',
  'Operations',
  'Brand',
  'Capital',
];
