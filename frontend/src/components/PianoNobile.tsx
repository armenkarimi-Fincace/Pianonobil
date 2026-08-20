'use client';

import { useEffect, useRef } from 'react';
import { MandateStrip } from './chrome/MandateStrip';
import { Rail } from './chrome/Rail';
import { Toasts } from './chrome/Toasts';
import { ZoneBar } from './chrome/ZoneBar';
import { OverlayHost } from './overlays/OverlayHost';
import { Gateway } from './gateway/Gateway';
import { Assembly } from './model/Assembly';
import { Constitution } from './model/Constitution';
import { Economics } from './model/Economics';
import { ModelRecord } from './model/ModelRecord';
import { Passage } from './model/Passage';
import { Preview } from './model/Preview';
import { StressTable } from './model/StressTable';
import { Diagnosis } from './works/Diagnosis';
import { Interruption } from './works/Interruption';
import { Standing } from './works/Standing';
import { Works } from './works/Works';
import { WorksRecord } from './works/WorksRecord';
import { Admission } from './vestibule/Admission';
import { Agreement } from './vestibule/Agreement';
import { Identity } from './vestibule/Identity';
import { Requirements } from './vestibule/Requirements';
import { Response } from './vestibule/Response';
import { Selection } from './vestibule/Selection';
import { CapitalDeployment } from './mandate/CapitalDeployment';
import { Decisions } from './mandate/Decisions';
import { Mandate } from './mandate/Mandate';
import { Overview } from './mandate/Overview';
import { Settlements } from './mandate/Settlements';
import {
  Correspondence,
  Counterparties,
  Deliverables,
  Documents,
  Intelligence,
  Regulatory,
  Reporting,
  SettingsAudit,
  Team,
} from './mandate/StaticModules';
import { Workstreams } from './mandate/Workstreams';
import type { Catalog } from '@/lib/types';
import { useAppStore } from '@/store/useAppStore';

/**
 * The environment.
 *
 * Five zones, entered in order: the Gateway asks one question, and everything
 * after it follows from the answer. Routing is state, not URL — the original
 * was a single-document instrument and the ordering of the walk is the point,
 * so a back button that skipped a gate would be wrong.
 */
export function PianoNobile({ catalog }: { catalog: Catalog }) {
  const s = useAppStore();
  const booted = useRef(false);

  // Adopt the server-resolved catalog before the first interactive render.
  useEffect(() => {
    useAppStore.getState().setCatalog(catalog);
  }, [catalog]);

  // The opening notice, on the same delay the original used.
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const id = window.setTimeout(() => {
      useAppStore
        .getState()
        .toast(
          'info',
          'The Piano Nobile',
          'Five environments, entered in order. The Gateway asks one question, and everything after it follows from the answer.',
        );
    }, 800);
    return () => window.clearTimeout(id);
  }, []);

  // ⌘K opens search; Escape closes whatever overlay is open.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key || '';
      const store = useAppStore.getState();
      if ((e.metaKey || e.ctrlKey) && (k === 'k' || k === 'K')) {
        e.preventDefault();
        if (store.ov === 'search') store.closeOverlay();
        else store.openOverlay('search');
        return;
      }
      if (k === 'Escape' && store.ov) {
        e.preventDefault();
        store.closeOverlay();
        return;
      }
      if (store.ov === 'search' && k === 'Enter') {
        const first = document.querySelector<HTMLButtonElement>('.sr-r:not(.lk)');
        if (first) {
          e.preventDefault();
          first.click();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Every navigation returns to the top of the room, as the original did.
  useEffect(() => {
    if (!s.scrollNonce) return;
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [s.scrollNonce]);

  return (
    <>
      <ZoneBar />
      <MandateStrip />
      {/*
        The Gateway has no rail. `.body` is a two-column grid whose first track
        is the 288px rail, so without the single-column override `main` would be
        laid into that track and render 288px wide. The original set the same
        inline style for the same reason.
      */}
      <div
        className={'body' + (s.zone === 'g' ? ' solo' : '')}
        style={s.zone === 'g' ? { gridTemplateColumns: 'minmax(0,1fr)' } : undefined}
      >
        <Rail />
        <main id="app" tabIndex={-1}>
          <Screen />
        </main>
      </div>
      <OverlayHost />
      <Toasts />
    </>
  );
}

/** Picks the screen for the current zone, step and sub-step. */
function Screen() {
  const s = useAppStore();

  if (s.zone === 'g') return <Gateway />;

  if (s.zone === 'm') {
    switch (s.step) {
      case 'assembly':
        return <Assembly />;
      case 'economics':
        return <Economics />;
      case 'stress':
        return <StressTable />;
      case 'passage':
        return <Passage />;
      case 'preview':
        return <Preview />;
      case 'record':
        return <ModelRecord />;
      default:
        return <Constitution />;
    }
  }

  if (s.zone === 'w') {
    switch (s.wstep) {
      case 'diagnosis':
        return <Diagnosis />;
      case 'works':
        return <Works />;
      case 'interruption':
        return <Interruption />;
      case 'wrecord':
        return <WorksRecord />;
      default:
        return <Standing />;
    }
  }

  if (s.zone === 'v') {
    switch (s.vstep) {
      case 'selection':
        return <Selection />;
      case 'requirements':
        return <Requirements />;
      case 'response':
        return <Response />;
      case 'agreement':
        return <Agreement />;
      case 'admission':
        return <Admission />;
      default:
        return <Identity />;
    }
  }

  switch (s.M.mod) {
    case 'decisions':
      return <Decisions />;
    case 'mandate':
      return <Mandate />;
    case 'workstreams':
      return <Workstreams />;
    case 'settlements':
      return <Settlements />;
    case 'capital':
      return <CapitalDeployment />;
    case 'counterparties':
      return <Counterparties />;
    case 'regulatory':
      return <Regulatory />;
    case 'deliverables':
      return <Deliverables />;
    case 'documents':
      return <Documents />;
    case 'reporting':
      return <Reporting />;
    case 'intelligence':
      return <Intelligence />;
    case 'team':
      return <Team />;
    case 'correspondence':
      return <Correspondence />;
    case 'settings':
      return <SettingsAudit />;
    default:
      return <Overview />;
  }
}
