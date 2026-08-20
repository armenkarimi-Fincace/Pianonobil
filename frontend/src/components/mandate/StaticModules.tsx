'use client';

import { Card, Plaque, QuietBlock } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Head } from '@/components/shared/Head';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { RingFigure } from '@/components/figures/RingFigure';
import { money } from '@/lib/format';
import { useAppStore } from '@/store/useAppStore';

/**
 * The Mandate Room's reference modules. Each is a register the House maintains
 * on the mandate, and each states plainly what it is and is not.
 */

/** Module 09 · Counterparties. Named, with direct contact. */
export function Counterparties() {
  const layers = useAppStore((s) => s.layers());
  const rows: [string, string, string, string][] = [
    [layers[0] ? layers[0].name : 'Liquidity', 'Awaiting your decision', 'On selection', 'Three candidates; all three disclosed before you choose.'],
    [layers[2] ? layers[2].name : 'Platform', 'Executed · 20 Jun', 'Disclosed', 'A named director, reachable directly. The House is not copied.'],
    ['Hosting & infrastructure', 'Executed · 28 Jun', 'Disclosed', 'A named account manager and a 24-hour incident line.'],
    ['Licensing agent', 'Executed · 5 Jul', 'Disclosed', 'The partner who signs your filing, by name.'],
  ];
  return (
    <>
      <Head
        title="Counterparties"
        right="The Capability Chain Register"
        lede="You may approach any of them independently, and the House expects you to."
      />
      <section>
        <DataTable
          columns={[
            { head: 'Counterparty', width: '26%' },
            { head: 'Contract', width: '20%' },
            { head: 'Contact', width: '130px' },
            { head: 'What you would reach' },
          ]}
        >
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <strong>{r[0]}</strong>
              </td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
              <td>{r[3]}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <QuietBlock title="Why the contact is disclosed">
        <p style={{ marginTop: '10px' }}>
          A House that selects its counterparties well has nothing to fear from a principal who calls
          them.
        </p>
      </QuietBlock>
      <Disclaimer />
    </>
  );
}

const MILESTONES: [string, string, string, string][] = [
  ['1', 'Jurisdiction analysis', 'Accepted', 'Complete · 2 June'],
  ['2', 'Entity formation', 'Accepted', 'Complete · 20 June'],
  ['3', 'Application pack lodged', 'In progress', 'With the agent'],
  ['4', 'Regulator response window', 'Not yet', 'Opens 2 September'],
  ['5', 'Interviews and clarifications', 'Not yet', '—'],
  ['6', 'In-principle approval', 'Not yet', '—'],
  ['7', 'Licence issued · conditions register opens', 'Not yet', '—'],
];

/** Module 10 · Regulatory Pathway. The House manages it; the regulator determines it. */
export function Regulatory() {
  const s = useAppStore();
  const jur = s.jur ? s.catalog.jurisdictions[s.jur] : null;
  return (
    <>
      <Head
        title="Regulatory Pathway"
        right={(jur ? jur.n : '') + ' · milestone 3 of 7'}
        lede="The House manages the pathway; the regulator determines it."
      />
      <section>
        <DataTable
          columns={[
            { head: '', width: '70px' },
            { head: 'Milestone' },
            { head: 'Status', width: '150px' },
            { head: 'Note', width: '180px' },
          ]}
        >
          {MILESTONES.map((m) => (
            <tr key={m[0]}>
              <td className="num">{m[0]}</td>
              <td>
                <strong>{m[1]}</strong>
              </td>
              <td>
                <Mark tone={m[2] === 'Accepted' ? 'ok' : m[2] === 'In progress' ? 'u' : undefined}>{m[2]}</Mark>
              </td>
              <td>{m[3]}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <Plaque title="No outcome is guaranteed">
        <p style={{ marginTop: '10px' }}>
          The House manages the pathway and prepares the file. The regulator determines it, and no
          fee is contingent on that determination.
        </p>
      </Plaque>
      <Disclaimer />
    </>
  );
}

/** Module 05 · Deliverables. Acceptance is the unit of progress. */
export function Deliverables() {
  const s = useAppStore();
  const layers = s.layers();
  return (
    <>
      <Head
        title="Deliverables"
        right={s.M.accepted + ' of 81 accepted'}
        lede="Acceptance is the unit of progress. A count can be audited; a percentage cannot."
      />
      <section>
        <Card lg>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
            <RingFigure v={s.M.accepted} total={81} />
            <div style={{ flex: '1 1 240px', minWidth: 0 }}>
              <p className="note-t" style={{ margin: '0 0 20px' }}>
                Four are issued and awaiting your review. A deliverable accepted and later returned
                for revision moves the count backwards, and both movements are visible.
              </p>
              <button type="button" className="btn o" onClick={() => s.act('mAccept')}>
                Accept the brand book
              </button>
            </div>
          </div>
        </Card>
      </section>
      <section>
        <SectionHeading title="Under your review" right="Four" />
        <DataTable
          columns={[
            { head: 'Deliverable' },
            { head: 'Delivered by', width: '150px' },
            { head: 'Status', width: '150px' },
            { head: 'Issued', width: '110px' },
          ]}
        >
          <tr>
            <td>Brand book — v2</td>
            <td>House</td>
            <td>
              <Mark tone="u">Under review</Mark>
            </td>
            <td>24 Jul</td>
          </tr>
          <tr>
            <td>Operating model</td>
            <td>House</td>
            <td>
              <Mark tone="ok">Accepted</Mark>
            </td>
            <td>15 Jun</td>
          </tr>
          <tr>
            <td>{layers[0] ? layers[0].name : 'Liquidity'} architecture paper</td>
            <td>House</td>
            <td>
              <Mark tone="ok">Accepted</Mark>
            </td>
            <td>12 Jun</td>
          </tr>
          <tr>
            <td>Policy suite — fourteen policies</td>
            <td>House</td>
            <td>
              <Mark tone="ok">In progress</Mark>
            </td>
            <td>18 Aug</td>
          </tr>
        </DataTable>
      </section>
      <Disclaimer />
    </>
  );
}

/** Module 06 · Document Room. Watermarked on opening. */
export function Documents() {
  const entry = useAppStore((s) => s.entry);
  const rows: [string, string, string, string][] = [
    ['Executed engagement agreement', 'Agreement', '11 Aug', 'View only'],
    [entry === 'w' ? 'Works Record · WR-0207' : 'Model Record · MR-0114', 'Record', '14 Jul', 'Download permitted'],
    ['Requirements Record', 'Record', '22 Jul', 'Download permitted'],
    ['Institutional Blueprint', 'Deliverable', '30 May', 'View only'],
    ['Monthly mandate report — July', 'Report', '1 Aug', 'Download permitted'],
    ['Gate 2 determination', 'Report', '28 Jun', 'View only'],
  ];
  return (
    <>
      <Head
        title="Document Room"
        right="Watermarked on opening"
        lede="Every document opens in a viewer carrying your identity and the time of opening."
      />
      <section>
        <DataTable
          columns={[
            { head: 'Document', width: '34%' },
            { head: 'Type', width: '130px' },
            { head: 'Date', width: '110px' },
            { head: 'Access' },
          ]}
        >
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <strong>{r[0]}</strong>
              </td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
              <td>
                <span className={'eyebrow ' + (r[3] === 'View only' ? 'q' : 'm')}>{r[3]}</span>
              </td>
            </tr>
          ))}
        </DataTable>
        <p className="meta" style={{ marginTop: '14px' }}>
          Download is permitted per document, never globally. Every opening is logged and visible to
          you in module 15.
        </p>
      </section>
      <Disclaimer />
    </>
  );
}

/** Module 11 · Reporting. The cadence is the visible discipline of the engagement. */
export function Reporting() {
  return (
    <>
      <Head
        title="Reporting"
        right="Written, dated, attributed"
        lede="The cadence is the visible discipline of the engagement."
      />
      <section>
        <DataTable columns={[{ head: 'Report' }, { head: 'Class', width: '150px' }, { head: 'Issued', width: '130px' }]}>
          <tr>
            <td>Monthly mandate report — July</td>
            <td>Monthly</td>
            <td>1 August</td>
          </tr>
          <tr>
            <td>Quarterly review pack — Q2</td>
            <td>Quarterly</td>
            <td>5 July</td>
          </tr>
          <tr>
            <td>Gate 2 determination</td>
            <td>Gate</td>
            <td>28 June</td>
          </tr>
          <tr>
            <td>Monthly mandate report — June</td>
            <td>Monthly</td>
            <td>1 July</td>
          </tr>
        </DataTable>
      </section>
      <Disclaimer />
    </>
  );
}

/** Module 12 · Institutional Intelligence. The Keystone, and private briefings. */
export function Intelligence() {
  const studies: [string, string, string][] = [
    ['Study No. 01', 'The Liquidity Pyramid', 'On the architecture of market liquidity.'],
    ['Study No. 02', 'The Philosophy of Leverage', 'On what leverage is, and what it is not.'],
    ['Study No. 03', 'The Taxonomy of Liquidity', 'On classifying what the market calls liquidity.'],
    ['Study No. 04', 'The Trading Imperative', 'On why a bank must hold a trading division.'],
  ];
  return (
    <>
      <Head
        title="Institutional Intelligence"
        right="Private edition"
        lede="The Keystone in full, and briefings written for this mandate."
      />
      <section>
        <DataTable columns={[{ head: '', width: '130px' }, { head: 'Study' }, { head: 'On' }]}>
          {studies.map((r) => (
            <tr key={r[0]}>
              <td className="num">{r[0]}</td>
              <td>
                <strong>{r[1]}</strong>
              </td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <Disclaimer />
    </>
  );
}

/** Module 13 · The Team. Accountability with names attached. */
export function Team() {
  const rows: [string, string, string][] = [
    ['Principal', 'Everything', 'Sole decision authority unless scope is delegated in writing.'],
    [
      'Authorised delegate',
      'Within a written scope',
      'For example technology and operations only. You set the boundary.',
    ],
    ['Observer', 'Nothing', 'Typically counsel. Sees everything, decides nothing. Enforced at the record.'],
    ['Operating team', 'Nothing', 'Opens at Transfer, scoped to one workstream.'],
  ];
  return (
    <>
      <Head title="The Team" right="Named, both sides" lede="Accountability with names attached." />
      <section>
        <DataTable
          columns={[{ head: 'Role', width: '24%' }, { head: 'May decide', width: '22%' }, { head: 'Notes' }]}
        >
          {rows.map((r) => (
            <tr key={r[0]}>
              <td>
                <strong>{r[0]}</strong>
              </td>
              <td>{r[1]}</td>
              <td>{r[2]}</td>
            </tr>
          ))}
        </DataTable>
        <p className="meta" style={{ marginTop: '14px' }}>
          Your identity documents are visible only to the compliance reviewer and to you — never to
          the wider mandate team, and never to your Mandate Lead.
        </p>
      </section>
      <Disclaimer />
    </>
  );
}

/** Module 14 · Correspondence. A formal, dated, attributable register. Not a chat. */
export function Correspondence() {
  return (
    <>
      <Head
        title="Correspondence"
        right="Response within two business days"
        lede="A formal, dated, attributable register. Not a chat."
      />
      <section>
        <Card className="mb-4">
          <div className="sec-h">
            <span className="eyebrow m">The House</span>
            <span className="eyebrow q">24 July</span>
          </div>
          <h4>Brand book issued for review</h4>
          <p style={{ marginTop: '10px', marginBottom: 0 }}>
            The brand book is issued for your review. Website design begins on acceptance. A revision
            at this stage costs nothing; a revision after build begins costs approximately three
            weeks.
          </p>
        </Card>
        <Card>
          <div className="sec-h">
            <span className="eyebrow m">The Principal</span>
            <span className="eyebrow q">19 July</span>
          </div>
          <h4>Question on the execution model</h4>
          <p style={{ marginTop: '10px', marginBottom: 0 }}>
            Could you set out the practical difference between the two configurations, in terms of
            what I am exposed to?
          </p>
        </Card>
      </section>
      <Disclaimer />
    </>
  );
}

/** Module 15 · Settings & Audit. The log belongs to the principal, not to the House. */
export function SettingsAudit() {
  const s = useAppStore();
  const rows = s.catalog.coefficients.rows;
  return (
    <>
      <Head
        title="Settings & Audit"
        right="Immutable · exportable"
        lede="The log belongs to the principal, not to the House."
      />
      <section>
        <DataTable columns={[{ head: 'Event' }, { head: 'When', width: '180px' }, { head: 'Who', width: '160px' }]}>
          {s.M.log.map((l, i) => (
            <tr key={i}>
              <td>{l[0]}</td>
              <td>{l[1]}</td>
              <td>{l[2]}</td>
            </tr>
          ))}
        </DataTable>
      </section>
      <section>
        <SectionHeading title="Model inputs" right={'Version ' + s.catalog.coefficients.version} />
        <DataTable
          columns={[
            { head: 'Input' },
            { head: 'Value', width: '130px', right: true },
            { head: 'Source', width: '200px' },
            { head: 'Standing', width: '140px' },
          ]}
        >
          {rows.map((r) => (
            <tr key={r.k}>
              <td className="num">{r.k}</td>
              <td className="r num">{r.u === 'USD' ? money(r.v) : r.v + ' ' + r.u}</td>
              <td>{r.src}</td>
              <td>
                <Mark tone={r.ok ? 'ok' : 'u'}>{r.ok ? 'Validated' : 'Estimate'}</Mark>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
      <Disclaimer />
    </>
  );
}
