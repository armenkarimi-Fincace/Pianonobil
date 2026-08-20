import type { ReactNode } from 'react';

/**
 * The footer of every step: a sentence on the left saying what is required,
 * and the single button that advances. Locked buttons say so rather than
 * disappearing — the environment states what is closed and why.
 */
export function Foot({
  message,
  label,
  onAdvance,
  ready,
}: {
  message: ReactNode;
  label: string;
  onAdvance: () => void;
  ready: boolean;
}) {
  return (
    <div className="foot">
      <span className="l">{message}</span>
      <button
        type="button"
        className={'btn' + (ready ? '' : ' off')}
        onClick={onAdvance}
        disabled={!ready}
      >
        {ready ? label : 'Locked'}
      </button>
    </div>
  );
}
