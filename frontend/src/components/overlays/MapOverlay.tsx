'use client';

import { MODS, STEPS, VSTEPS, WSTEPS } from '@/lib/navigation';
import type { ZoneKey } from '@/lib/types';
import {
  modOpen,
  stepDone,
  stepOpen,
  useAppStore,
  vStepDone,
  vStepOpen,
  wStepDone,
  wStepOpen,
  whyLocked,
  wWhy,
  vWhy,
  zoneOpen,
} from '@/store/useAppStore';
import { Plaque } from '@/components/shared/Blocks';

type StepState = 'dn' | 'cu' | 'op' | 'lk';

/**
 * `.keys i` is an element selector nested in a class, so it outranks a utility
 * class on border-colour. The legend lozenges therefore carry the same inline
 * styles the original used.
 */
const SWATCH_OPEN: React.CSSProperties = { transform: 'rotate(45deg)', width: '11px', height: '11px' };
const SWATCH_SETTLED: React.CSSProperties = {
  ...SWATCH_OPEN,
  background: 'var(--bronze)',
  borderColor: 'var(--bronze)',
};
const SWATCH_HERE: React.CSSProperties = {
  ...SWATCH_OPEN,
  background: 'var(--maroon)',
  borderColor: 'var(--maroon)',
};

interface MapColumn {
  z: ZoneKey;
  n: string;
  t: string;
  s: string;
  steps: { k: string; t: string; st: StepState }[];
}

export function MapOverlay() {
  const s = useAppStore();
  const layers = s.layers();

  const cols: MapColumn[] = [
    {
      z: 'g',
      n: 'Gateway',
      t: 'The Gateway',
      s: 'One question, asked once.',
      steps: [{ k: 'door', t: 'Choose a door', st: s.entry ? 'dn' : 'cu' }],
    },
    {
      z: 'w',
      n: 'Door one',
      t: 'The Works Room',
      s: 'For an institution that already operates.',
      steps: WSTEPS.map((x) => ({
        k: x.k,
        t: x.t,
        st: (s.entry !== 'w'
          ? 'lk'
          : !wStepOpen(s, layers, x.k)
            ? 'lk'
            : wStepDone(s, layers, x.k)
              ? 'dn'
              : s.zone === 'w' && s.wstep === x.k
                ? 'cu'
                : 'op') as StepState,
      })),
    },
    {
      z: 'm',
      n: 'Door two',
      t: 'The Model Room',
      s: 'For an institution that does not exist yet.',
      steps: STEPS.map((x) => ({
        k: x.k,
        t: x.t,
        st: (s.entry !== 'm'
          ? 'lk'
          : !stepOpen(s, layers, x.k)
            ? 'lk'
            : stepDone(s, layers, x.k)
              ? 'dn'
              : s.zone === 'm' && s.step === x.k
                ? 'cu'
                : 'op') as StepState,
      })),
    },
    {
      z: 'v',
      n: 'Common to both',
      t: 'The Vestibule',
      s: 'Identity, selection, response, agreement.',
      steps: VSTEPS.map((x) => ({
        k: x.k,
        t: x.t,
        st: (!s.carried
          ? 'lk'
          : !vStepOpen(s, s.catalog, x.k)
            ? 'lk'
            : vStepDone(s, s.catalog, x.k)
              ? 'dn'
              : s.zone === 'v' && s.vstep === x.k
                ? 'cu'
                : 'op') as StepState,
      })),
    },
    {
      z: 'b',
      n: 'On admission',
      t: 'The Mandate Room',
      s: 'Fifteen modules. The mandate as it runs.',
      steps: MODS.map((x) => ({
        k: x[1],
        t: x[2],
        st: (!s.V.admitted
          ? 'lk'
          : !modOpen(s, x[1])
            ? 'lk'
            : s.zone === 'b' && s.M.mod === x[1]
              ? 'cu'
              : 'op') as StepState,
      })),
    },
  ];

  const here = whereAmI();
  const nx = nextStep();
  const curK =
    s.zone === 'm' ? s.step : s.zone === 'w' ? s.wstep : s.zone === 'v' ? s.vstep : s.zone === 'b' ? s.M.mod : 'door';
  const onIt = nx.z === s.zone && (nx.k === curK || (!nx.k && s.zone === 'g'));
  const prefix = onIt && nx.k && nx.z !== 'b';

  function whereAmI(): { t: string; s: string } {
    if (s.zone === 'g') return { t: 'The Gateway', s: 'You have not chosen a door.' };
    if (s.zone === 'w') {
      const w = WSTEPS.find((x) => x.k === s.wstep);
      return { t: 'The Works Room · ' + (w ? w.t : ''), s: 'Step ' + (w ? w.n : '') + ' of 05.' };
    }
    if (s.zone === 'm') {
      const m = STEPS.find((x) => x.k === s.step);
      return { t: 'The Model Room · ' + (m ? m.t : ''), s: 'Step ' + (m ? m.n : '') + ' of 07.' };
    }
    if (s.zone === 'v') {
      const v = VSTEPS.find((x) => x.k === s.vstep);
      return { t: 'The Vestibule · ' + (v ? v.t : ''), s: 'Step ' + (v ? v.n : '') + ' of 06.' };
    }
    const d = MODS.find((x) => x[1] === s.M.mod);
    return {
      t: 'The Mandate Room · ' + (d ? d[2] : ''),
      s: 'Module ' + (d ? d[0] : '') + ' of 15 · ' + s.M.mode + ' mandate.',
    };
  }

  function nextStep(): { z: ZoneKey; k: string | null; t: string; why: string } {
    if (!s.entry) {
      return {
        z: 'g',
        k: null,
        t: 'Choose a door',
        why: 'The House keeps two working rooms and they do not overlap. Nothing opens until you say which one you are in.',
      };
    }
    if (s.entry === 'w') {
      for (const step of WSTEPS) {
        if (!wStepDone(s, layers, step.k)) {
          return {
            z: 'w',
            k: step.k,
            t: step.t,
            why: wWhy(s, layers, step.k) || 'The next step in the Works Room.',
          };
        }
      }
    } else {
      for (const step of STEPS) {
        if (!stepDone(s, layers, step.k)) {
          return {
            z: 'm',
            k: step.k,
            t: step.t,
            why: whyLocked(s, layers, step.k) || 'The next step in the Model Room.',
          };
        }
      }
    }
    if (!s.carried) {
      return {
        z: s.entry,
        k: s.entry === 'w' ? 'wrecord' : 'record',
        t: 'Carry the record across',
        why: 'The record freezes what you specified. Carrying it opens the Vestibule and commits you to nothing.',
      };
    }
    for (const step of VSTEPS) {
      if (!vStepDone(s, s.catalog, step.k)) {
        return {
          z: 'v',
          k: step.k,
          t: step.t,
          why: vWhy(s, s.catalog, step.k) || 'The next step in the Vestibule.',
        };
      }
    }
    if (s.M.decisions.length) {
      return {
        z: 'b',
        k: 'decisions',
        t: 'Decisions · ' + s.M.decisions.length + ' awaiting you',
        why: 'Every open determination carries a cost of delay, stated in days and in money.',
      };
    }
    return {
      z: 'b',
      k: 'overview',
      t: 'Overview',
      why: 'Nothing awaits your determination. That is the most valuable state this environment can hold.',
    };
  }

  return (
    <>
      <div className="here">
        <div>
          <div className="k">You are here</div>
          <div className="v">{here.t}</div>
          <p>{here.s}</p>
        </div>
        <div>
          <div className="k">{onIt ? 'What is still required here' : 'The step after this one'}</div>
          <div className="v">{prefix ? 'Finish ' + nx.t : nx.t}</div>
          <p>{nx.why}</p>
          <div className="mt-m3">
            <button type="button" className="btn" onClick={() => s.goTo(nx.z, nx.k)}>
              {onIt ? 'Return to it' : 'Take me there'}
            </button>
          </div>
        </div>
      </div>

      <div className="mp">
        {cols.map((c) => {
          const shut = !zoneOpen(s, c.z);
          return (
            <div key={c.z} className={'mp-col' + (shut ? ' shut' : '')}>
              <div className="mp-hd">
                <div className="z">{c.n}</div>
                <div className="t">{c.t}</div>
                <div className="s">{c.s}</div>
              </div>
              <div className="flex-1">
                {c.steps.map((st) => (
                  <button
                    key={st.k}
                    type="button"
                    className={'mp-s ' + st.st}
                    onClick={
                      st.st === 'lk'
                        ? undefined
                        : () => s.goTo(c.z, st.k === 'door' ? null : st.k)
                    }
                  >
                    <span className="g" />
                    <span className="l">{st.t}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="keys mt-m5">
        <span>
          <i style={SWATCH_SETTLED} />
          settled
        </span>
        <span>
          <i style={SWATCH_HERE} />
          where you are
        </span>
        <span>
          <i style={SWATCH_OPEN} />
          open, not yet done
        </span>
        <span style={{ opacity: 0.45 }}>
          <i style={SWATCH_OPEN} />
          not yet reachable
        </span>
      </div>

      <Plaque title="Why the map is shown at all" className="mb-0">
        <p className="mt-[10px]">
          Most environments conceal how much is left, because the length is the objection. The House
          states it in full at the outset: {s.entry === 'w' ? 'five' : 'seven'} steps in the working
          room, six in the Vestibule, and fifteen modules thereafter. A principal who can see the
          whole passage is not being managed through it.
        </p>
      </Plaque>
    </>
  );
}
