'use client';

import { useAppStore } from '@/store/useAppStore';

/**
 * Transient notices. Every one of them is also written to the register behind
 * the Notices overlay, so nothing the environment said can be lost by looking
 * away for eight seconds.
 */
export function Toasts() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);

  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={'toast' + (t.kind === 'warn' ? ' warn' : t.kind === 'ok' ? ' ok' : '')}>
          <button className="x" type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}>
            ×
          </button>
          <div className="t">{t.title}</div>
          <div className="m">{t.msg}</div>
        </div>
      ))}
    </div>
  );
}
