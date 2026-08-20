'use client';

import { ZONE_NAMES, ZONES } from '@/lib/navigation';
import { useAppStore, zoneOpen } from '@/store/useAppStore';

/**
 * The sticky maroon bar: the five zones, The Map, and the two overlays.
 * A zone the principal cannot enter is dimmed and says why when pressed —
 * it is never hidden.
 */
export function ZoneBar() {
  const s = useAppStore();
  const unread = Math.max(0, s.N.length - s.nSeen);

  return (
    <div className="zbar">
      <div className="in">
        <span className="tag">
          The&#160;<b>Piano&#160;Nobile</b>
        </span>

        <div className="zgrp">
          {ZONES.map((z) => {
            const open = zoneOpen(s, z.k);
            return (
              <button
                key={z.k}
                type="button"
                data-locked={open ? 0 : 1}
                aria-current={s.zone === z.k ? 'page' : undefined}
                onClick={() => s.goZone(z.k)}
              >
                {z.n}
              </button>
            );
          })}
        </div>

        <div className="zgrp">
          <button type="button" onClick={() => (s.ov === 'map' ? s.closeOverlay() : s.openOverlay('map'))}>
            <span className="dm">&#9671;</span>The Map
          </button>
        </div>

        <div className="right">
          <span className="kbd flex items-center pr-m4">Private circulation</span>
          <button
            type="button"
            className="tb"
            onClick={() => (s.ov === 'search' ? s.closeOverlay() : s.openOverlay('search'))}
          >
            Search <span className="kbd">&#8984;K</span>
          </button>
          <button
            type="button"
            className="tb"
            onClick={() => (s.ov === 'notices' ? s.closeOverlay() : s.openOverlay('notices'))}
          >
            Notices{' '}
            <span className="nb" data-zero={unread ? '0' : '1'}>
              {unread > 99 ? '99+' : unread}
            </span>
          </button>
        </div>
      </div>
      <span className="sr-only">{ZONE_NAMES[s.zone]}</span>
    </div>
  );
}
