'use client';

import { useAppStore } from '@/store/useAppStore';

/** The standing disclaimer that closes every screen in the working rooms. */
export function Disclaimer() {
  const catalog = useAppStore((s) => s.catalog);
  const rows = catalog.coefficients.rows;
  const unvalidated = rows.filter((r) => !r.ok).length;
  return (
    <div className="disc">
      <p className="meta">
        X-CHASE is not a regulated bank, broker, asset manager or investment advisor. Figures shown
        in the Model Room are illustrative and are not a forecast, a projection, or a representation
        of expected results. No outcome is guaranteed. Model {catalog.coefficients.version} &#183;{' '}
        {unvalidated} of {rows.length} inputs are estimates awaiting a signed source.
      </p>
    </div>
  );
}
