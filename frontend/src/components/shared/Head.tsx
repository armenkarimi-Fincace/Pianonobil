import type { ReactNode } from 'react';

/** The page header block: title, an optional right-hand eyebrow, and a lede. */
export function Head({
  title,
  right,
  lede,
}: {
  title: ReactNode;
  right?: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <div className="head">
      <div className="top">
        <h1>{title}</h1>
        {right ? <span className="eyebrow q">{right}</span> : null}
      </div>
      {lede ? <p className="lede">{lede}</p> : null}
      <hr className="hair" />
    </div>
  );
}
