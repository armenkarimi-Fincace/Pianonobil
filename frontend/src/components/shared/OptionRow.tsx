import type { ReactNode } from 'react';

export interface OptionDetail {
  k: ReactNode;
  v: ReactNode;
}

/**
 * The two-column selectable row used for layer options, shocks, works,
 * passage determinations and decision options. Pressed state is carried on
 * `aria-pressed`, which is also what the stylesheet keys off.
 */
export function OptionRow({
  title,
  why,
  details,
  pressed,
  blocked,
  onSelect,
  children,
}: {
  title: ReactNode;
  why?: ReactNode;
  details?: OptionDetail[];
  pressed: boolean;
  blocked?: string | null;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={'opt' + (blocked ? ' off' : '')}
      aria-pressed={pressed && !blocked}
      onClick={onSelect}
    >
      <span className="l">
        <span className="nm">
          <span className="mk" />
          <span className="ti">{title}</span>
          {blocked ? <span className="blk">{blocked}</span> : null}
        </span>
        {why ? <span className="why">{why}</span> : null}
      </span>
      <span className="r">
        {(details || []).map((d, i) => (
          <span className="dl" key={i}>
            <span className="k">{d.k}</span>
            <span className="v">{d.v}</span>
          </span>
        ))}
        {children}
      </span>
    </button>
  );
}
