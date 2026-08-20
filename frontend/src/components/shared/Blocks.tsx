import type { ReactNode } from 'react';

/** A bronze-ruled aside. Used for the House's view and for quiet asides. */
export function QuietBlock({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={'quiet-block' + (className ? ' ' + className : '')}>
      {title ? <span className="eyebrow m">{title}</span> : null}
      {children}
    </div>
  );
}

/** Rules above and below. Reserved for statements the House stands behind. */
export function Plaque({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={'plaque' + (className ? ' ' + className : '')}>
      {title ? <span className="eyebrow m">{title}</span> : null}
      {children}
    </div>
  );
}

/** The linen note that says what is still required before a step opens. */
export function GateNote({ children }: { children: ReactNode }) {
  return (
    <div className="gate">
      <p>{children}</p>
    </div>
  );
}

/** A bordered panel on paper. `lg` widens the padding to the large gutter. */
export function Card({
  children,
  lg,
  mar,
  className,
  style,
}: {
  children: ReactNode;
  lg?: boolean;
  mar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={'card' + (lg ? ' lg' : '') + (mar ? ' mar' : '') + (className ? ' ' + className : '')}
      style={style}
    >
      {children}
    </div>
  );
}

/** The maroon slab used to open a Record. */
export function Deep({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={'deep' + (className ? ' ' + className : '')}>{children}</div>;
}

/** A key/value line separated by a dotted rule, as used throughout the Records. */
export function DottedRow({
  label,
  value,
  last,
}: {
  label: ReactNode;
  value: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap justify-between gap-m5 py-3"
      style={{ borderBottom: last ? 'none' : '1px dotted var(--line)' }}
    >
      <span className="eyebrow q">{label}</span>
      <span className="font-garamond text-[18px]">{value}</span>
    </div>
  );
}
