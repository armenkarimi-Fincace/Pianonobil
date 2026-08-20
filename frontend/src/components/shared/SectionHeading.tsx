import type { ReactNode } from 'react';

/** The maroon eyebrow / quiet eyebrow pair that opens each section. */
export function SectionHeading({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <div className="sec-h">
      <span className="eyebrow m">{title}</span>
      {right ? <span className="eyebrow q">{right}</span> : null}
    </div>
  );
}
