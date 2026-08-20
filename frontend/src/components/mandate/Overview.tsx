'use client';

import { Card } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { MetricBand } from '@/components/shared/Metrics';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { MosaicFigure } from '@/components/figures/MosaicFigure';
import { MosaicKeys } from '@/components/figures/Keys';
import { RingFigure } from '@/components/figures/RingFigure';
import { SpineFigure } from '@/components/figures/SpineFigure';
import { money, pad } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

const WORKSTREAM_STATUS = [
  'progress',
  'decision',
  'progress',
  'none',
  'review',
  'progress',
  'progress',
  'none',
  'progress',
];

const STATUS_LABEL: Record<string, string> = {
  decision: 'Requires decision',
  review: 'Under review',
  none: 'Not yet commenced',
  progress: 'In progress',
};

/** Module 01 · Overview. Everything that stands with you today. */
export function Overview() {
  const s = useAppStore();
  const R = s.fam && s.type && s.jur ? s.build({ stress: true }) : null;
  const layers = s.layers();
  const D = s.M.decisions;

  return (
    <>
      <Head
        title="Overview"
        right={s.M.mode + ' · Gate 3 scheduled 14 September'}
        lede={
          D.length
            ? 'Matters stand with you. Everything else is proceeding.'
            : 'Nothing awaits your determination. Everything is proceeding.'
        }
      />

      <MetricBand
        cells={[
          { k: 'Awaiting you', v: String(D.length), d: 'determinations', tone: D.length ? 'neg' : 'pos' },
          { k: 'Awaiting settlement', v: String(s.M.settle), d: 'across both ledgers' },
          { k: 'Deliverables accepted', v: s.M.accepted + ' of 81', d: 'counted, never estimated' },
          { k: 'Gate criteria met', v: '4 of 6', d: 'Gate 3' },
        ]}
      />

      <section>
        <SectionHeading title="A · Mandate position" right="Design · Build · Operate · Transfer" />
        <Card lg>
          <SpineFigure cur={2} gates={s.catalog.gates} />
          <div
            style={{
              display: 'flex',
              gap: '40px',
              flexWrap: 'wrap',
              marginTop: '36px',
              paddingTop: '24px',
              borderTop: '1px solid var(--line-soft)',
            }}
          >
            <RingFigure v={s.M.accepted} total={81} />
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <p className="note-t" style={{ margin: 0 }}>
                Acceptance is the unit of progress. A deliverable accepted and later returned for
                revision moves the count backwards, visibly. There is no progress bar anywhere in
                this environment.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <SectionHeading
          title="B · Awaiting your determination"
          right={D.length ? D.length + ' open' : 'Queue clear'}
        />
        <DataTable
          columns={[
            { head: 'Reference', width: '100px' },
            { head: 'Matter' },
            { head: 'By', width: '110px' },
            { head: 'Cost of delay', width: '170px', right: true },
          ]}
        >
          {!D.length ? (
            <tr>
              <td colSpan={4}>Nothing awaits you. This is the most valuable state this screen can hold.</td>
            </tr>
          ) : null}
          {D.map((d) => (
            <tr key={d.id}>
              <td className="num">{d.id}</td>
              <td>
                <strong>{d.t}</strong>
              </td>
              <td>{d.due}</td>
              <td className="r num" style={{ color: 'var(--maroon)' }}>
                +{money(d.money)} · +{d.days}d
              </td>
            </tr>
          ))}
        </DataTable>
        <p className="meta" style={{ marginTop: '14px' }}>
          Cost of delay is calculated from the contracted schedule and the counterparty terms in
          force. It is what waiting costs — not a penalty.
        </p>
      </section>

      <section>
        <SectionHeading title="C · Workstreams" right={layers.length + ' disciplines'} />
        <div className="modgrid">
          {layers.map((l, i) => {
            const st = WORKSTREAM_STATUS[i] || 'progress';
            return (
              <button key={l.key} type="button" onClick={() => s.goTo('b', 'workstreams', l.key)}>
                <span className="n">{pad(i + 1)}</span>
                <span className="t">{l.name}</span>
                <span className="s">{l.by}</span>
                <span style={{ display: 'block', marginTop: '12px' }}>
                  <Mark tone={st === 'decision' ? 'u' : 'ok'}>{STATUS_LABEL[st]}</Mark>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {R ? (
        <section>
          <SectionHeading title="D · Capital deployment" right="Reported, never transacted" />
          <Card lg>
            <MosaicFigure pools={R.pools} />
            <p className="fread">
              Each square is one pool. Its area is its share of your commitment; the solid portion is
              what has been spent. Two of the six are not expenditure at all.
            </p>
            <MosaicKeys />
          </Card>
          <p className="meta" style={{ marginTop: '14px' }}>
            No client capital passes through X-CHASE, and no funds move through this room.
          </p>
        </section>
      ) : null}

      <section>
        <SectionHeading title="E · The House on this mandate" right="Named, and contactable" />
        <DataTable columns={[{ head: 'Name', width: '28%' }, { head: 'Responsibility' }]}>
          <tr>
            <td>
              <strong>Sam Hesam</strong>
            </td>
            <td>Mandate Lead. Senior owner of the relationship. Responds within two business days.</td>
          </tr>
          <tr>
            <td>
              <strong>Legal desk</strong>
            </td>
            <td>Jurisdiction, filing, conditions.</td>
          </tr>
          <tr>
            <td>
              <strong>Compliance reviewer</strong>
            </td>
            <td>Verification. Structurally a different person from your Mandate Lead.</td>
          </tr>
        </DataTable>
      </section>
      <Disclaimer />
    </>
  );
}
