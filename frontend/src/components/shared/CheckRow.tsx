import type { ReactNode } from 'react';

/** One line of the document pack, with its own tick control. */
export function CheckRow({
  done,
  name,
  detail,
  tag,
  onToggle,
}: {
  done: boolean;
  name: ReactNode;
  detail: ReactNode;
  tag: ReactNode;
  onToggle: () => void;
}) {
  return (
    <div className="checkrow" data-done={done ? 1 : 0}>
      <button
        type="button"
        className="tk"
        aria-pressed={done}
        aria-label="Mark ready"
        onClick={onToggle}
      >
        {done ? '✓' : ''}
      </button>
      <div>
        <div className="nm">{name}</div>
        <div className="dt">{detail}</div>
      </div>
      <div className="tg">{tag}</div>
    </div>
  );
}
