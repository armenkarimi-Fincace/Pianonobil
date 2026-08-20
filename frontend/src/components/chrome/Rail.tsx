'use client';

import { MODS, STEPS, VSTEPS, WSTEPS } from '@/lib/navigation';
import type { StepDef } from '@/lib/navigation';
import {
  modOpen,
  stepDone,
  stepOpen,
  subsForZone,
  useAppStore,
  vStepDone,
  vStepOpen,
  wStepDone,
  wStepOpen,
} from '@/store/useAppStore';

/**
 * The left rail. In the working rooms it lists the steps of the current room,
 * with the sub-steps of the open one nested beneath; in the Mandate Room it
 * lists the fifteen modules. A locked item stays visible and dimmed.
 */
export function Rail() {
  const s = useAppStore();
  const layers = s.layers();

  if (s.zone === 'g') return null;

  if (s.zone === 'b') {
    return (
      <nav className="rail" aria-label="Modules">
        <div className="cap">
          <span className="eyebrow q">{s.M.mode} mandate</span>
        </div>
        {MODS.map((m) => {
          const open = modOpen(s, m[1]);
          const on = s.M.mod === m[1];
          const badge = m[1] === 'decisions' && s.M.decisions.length ? s.M.decisions.length : null;
          return (
            <button
              key={m[1]}
              type="button"
              className={'r-item' + (on ? ' on' : '') + (open ? '' : ' lock')}
              onClick={() => s.goTo('b', m[1])}
            >
              <span className="n">{m[0]}</span>
              <span className="t">
                {m[2]}
                {badge ? <span className="bg">{badge}</span> : null}
              </span>
              <span className="c">{open ? '' : '●'}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  let steps: StepDef[];
  let cur: string;
  let cap: string;
  let isOpen: (k: string) => boolean;
  let isDone: (k: string) => boolean;

  if (s.zone === 'w') {
    steps = WSTEPS;
    cur = s.wstep;
    cap = 'Existing institution';
    isOpen = (k) => wStepOpen(s, layers, k);
    isDone = (k) => wStepDone(s, layers, k);
  } else if (s.zone === 'm') {
    steps = STEPS;
    cur = s.step;
    cap = 'New institution';
    isOpen = (k) => stepOpen(s, layers, k);
    isDone = (k) => stepDone(s, layers, k);
  } else {
    steps = VSTEPS;
    cur = s.vstep;
    cap = 'Admission';
    isOpen = (k) => vStepOpen(s, s.catalog, k);
    isDone = (k) => vStepDone(s, s.catalog, k);
  }

  return (
    <nav className="rail" aria-label="Steps">
      <div className="cap">
        <span className="eyebrow q">{cap}</span>
      </div>
      {steps.map((step) => {
        const open = isOpen(step.k);
        const done = isDone(step.k);
        const on = cur === step.k;
        const subs = on && open ? subsForZone(s, layers, s.zone, step.k) : [];
        return (
          <div key={step.k}>
            <button
              type="button"
              className={'r-item' + (on ? ' on' : '') + (done ? ' done' : '') + (open ? '' : ' lock')}
              onClick={() => s.goStep(step.k)}
            >
              <span className="n">{step.n}</span>
              <span className="t">{step.t}</span>
              <span className="c">{open ? (done ? '✓' : '') : '●'}</span>
            </button>
            {subs.length ? (
              <div className="r-subs">
                {subs.map(([key, label]) => {
                  const ticked =
                    (s.zone === 'm' && step.k === 'assembly' && s.sel[key]) ||
                    (s.zone === 'w' && step.k === 'works' && s.W.sel[key]);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={'r-sub' + (s.sub === key ? ' on' : '')}
                      onClick={() => s.setSub(key)}
                    >
                      {label}
                      {ticked ? <span className="dn">✓</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}
