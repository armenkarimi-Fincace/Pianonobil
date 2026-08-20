'use client';

import { Card, Plaque } from '@/components/shared/Blocks';
import { useAppStore } from '@/store/useAppStore';

/**
 * The notices register. Nothing is deleted from it — a notice acted upon still
 * appears, which is the point of keeping it at all.
 */
export function NoticesOverlay() {
  const N = useAppStore((s) => s.N);
  const warn = N.filter((n) => n.kind === 'warn').length;

  return (
    <>
      <p className="note-t mb-m5">
        Every notice the environment has raised in this session, in order, most recent first. Nothing
        is deleted from this register — a notice acted upon still appears.
      </p>
      {!N.length ? (
        <Card>
          <p className="m-0">No notices have been raised.</p>
        </Card>
      ) : (
        <>
          <div>
            {N.map((n, i) => (
              <div key={i} className={'nt ' + (n.kind === 'warn' ? 'warn' : n.kind === 'ok' ? 'ok' : '')}>
                <div>
                  <div className="k">{n.title}</div>
                  <div className="m">{n.msg}</div>
                </div>
                <div className="w">{n.at}</div>
              </div>
            ))}
          </div>
          {warn ? (
            <Plaque title={`${warn} of ${N.length} were warnings`} className="mb-0">
              <p className="mt-[10px]">
                A warning is raised where a determination is inconsistent with something already
                settled — an underfunded structure, a layer cleared by a change of jurisdiction, a
                programme touching too many disciplines at once. It never blocks you. It is stated
                once, at the moment it becomes true, and kept here.
              </p>
            </Plaque>
          ) : null}
        </>
      )}
    </>
  );
}
