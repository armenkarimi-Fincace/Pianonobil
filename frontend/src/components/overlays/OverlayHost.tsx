'use client';

import { useAppStore } from '@/store/useAppStore';
import { MapOverlay } from './MapOverlay';
import { NoticesOverlay } from './NoticesOverlay';
import { SearchOverlay } from './SearchOverlay';

/** The modal chrome shared by The Map, Search and Notices. */
export function OverlayHost() {
  const ov = useAppStore((s) => s.ov);
  const noticeCount = useAppStore((s) => s.N.length);
  const close = useAppStore((s) => s.closeOverlay);

  const title = ov === 'map' ? 'The Map' : ov === 'search' ? 'Search' : 'Notices';
  const sub =
    ov === 'map'
      ? 'Five environments, thirty-four steps'
      : ov === 'search'
        ? 'Every room, step and layer'
        : noticeCount + (noticeCount === 1 ? ' notice' : ' notices') + ' this session';

  return (
    <div
      className={'ov' + (ov ? ' on' : '')}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="ov-in">
        {ov ? (
          <>
            <div className="ov-hd">
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,253,249,.62)' }}>
                  {sub}
                </span>
                <h2 className="mt-2">{title}</h2>
              </div>
              <button type="button" className="cl" onClick={close}>
                Close &nbsp;&times;
              </button>
            </div>
            <div className="ov-bd">
              {ov === 'map' ? <MapOverlay /> : ov === 'search' ? <SearchOverlay /> : <NoticesOverlay />}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
