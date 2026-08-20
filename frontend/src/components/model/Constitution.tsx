'use client';

import { Card, GateNote, Plaque, QuietBlock } from '@/components/shared/Blocks';
import { Chip } from '@/components/shared/Chip';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { Metrics } from '@/components/shared/Metrics';
import { OptionRow } from '@/components/shared/OptionRow';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Slider } from '@/components/shared/Slider';
import { commas, money } from '@/lib/format';
import { constitutionDone, useAppStore } from '@/store/useAppStore';

const FAMILY_ORDER = ['cm', 'aw', 'bp', 'as'];

/**
 * Step 01 · Constitution. Four determinations settle everything downstream;
 * changing any one of them recomputes every figure in the room.
 */
export function Constitution() {
  const s = useAppStore();
  const engine = s.engine();
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const R = s.fam && s.type && s.jur ? s.build({ stress: false }) : null;
  const done = constitutionDone(s);

  return (
    <>
      <Head
        title="Constitution"
        right={F ? F.name + ' family' : 'Four determinations'}
        lede="Four determinations settle everything downstream. Change any one and every figure in this room recomputes."
      />
      <Metrics R={R} />

      <section>
        <SectionHeading title="A · What family" right="Four families, forty-seven institution types" />
        <Card>
          {FAMILY_ORDER.map((k) => (
            <Chip key={k} pressed={s.fam === k} onClick={() => s.setFamily(k)}>
              {s.catalog.families[k].name}
            </Chip>
          ))}
          {F ? (
            <p className="note-t" style={{ margin: '16px 0 0' }}>
              {F.blurb} Every family carries its own layers, its own second determination, its own
              capital pools and its own passage. Changing the family clears the specification below
              it, because nothing transfers between them.
            </p>
          ) : (
            <GateNote>
              <strong>Begin here.</strong> The family decides everything the room will ask you next.
            </GateNote>
          )}
        </Card>
      </section>

      {F ? (
        <section>
          <SectionHeading title="B · What you are building" right={F.name} />
          <Card>
            {Object.keys(F.types).map((t) => (
              <Chip key={t} pressed={s.type === t} onClick={() => s.setType(t)}>
                {F.types[t].n}
              </Chip>
            ))}
            {s.type ? (
              <p className="note-t" style={{ margin: '16px 0 0' }}>
                {F.types[s.type].note}
              </p>
            ) : null}
          </Card>
        </section>
      ) : null}

      {F && s.type ? (
        <section>
          <SectionHeading
            title="C · Where it sits"
            right={s.jur ? s.catalog.jurisdictions[s.jur].tn : 'Six routes'}
          />
          <Card>
            {Object.keys(s.catalog.jurisdictions).map((j) => (
              <Chip key={j} pressed={s.jur === j} onClick={() => s.setJurisdiction(j)}>
                {s.catalog.jurisdictions[j].n}
              </Chip>
            ))}
            {s.jur ? (
              <>
                <QuietBlock title="What this jurisdiction is">
                  <p style={{ marginTop: '10px' }}>{s.catalog.jurisdictions[s.jur].note}</p>
                </QuietBlock>
                <div style={{ marginTop: '20px' }}>
                  <div className="dl" style={{ padding: '10px 0', borderBottom: '1px dotted var(--line)' }}>
                    <span className="k">Licence and legal</span>
                    <span className="v">{money(engine.jFee(s.jur))}</span>
                  </div>
                  <div className="dl" style={{ padding: '10px 0', borderBottom: '1px dotted var(--line)' }}>
                    <span className="k">Regulatory capital held</span>
                    <span className="v">
                      {engine.jCap(s.jur) ? money(engine.jCap(s.jur)) : 'None required'}
                    </span>
                  </div>
                  <div className="dl" style={{ padding: '10px 0' }}>
                    <span className="k">Base time to permission</span>
                    <span className="v">{s.catalog.jurisdictions[s.jur].mo} months</span>
                  </div>
                </div>
              </>
            ) : null}
          </Card>
        </section>
      ) : null}

      {F && s.type && s.jur && R ? (
        <section>
          <SectionHeading
            title="D · Capital committed"
            right={s.ack.capital ? 'Settled' : 'Set both, then settle'}
          />
          <Card>
            <Slider
              label="Total commitment"
              display={money(s.cap * 1e6)}
              value={s.cap}
              min={0.5}
              max={60}
              step={0.5}
              onChange={s.setCap}
              onSettle={s.checkCapital}
            />
            <Slider
              className="mt-8"
              label={F.unit}
              display={commas(R.scale) + ' ' + F.u}
              value={R.scale}
              min={F.min}
              max={F.max}
              step={F.step}
              onChange={s.setScale}
              onSettle={s.checkCapital}
            />
            <Plaque title="Against the structure">
              {R.gap >= 0 ? (
                <p style={{ marginTop: '10px' }}>
                  Your commitment exceeds what this structure requires by{' '}
                  <strong>{money(R.gap)}</strong>. The surplus lengthens runway and widens the
                  contingency.
                </p>
              ) : (
                <p style={{ marginTop: '10px' }}>
                  This structure requires <strong>{money(-R.gap)}</strong> more than you have
                  committed. Either the specification, the jurisdiction or the commitment must move.
                  The House will not proceed on a structure that is underfunded at the outset.
                </p>
              )}
            </Plaque>
            <button type="button" className="btn o" onClick={() => s.act('ackCapital')}>
              {s.ack.capital ? 'Settled — amend' : 'Settle the commitment'}
            </button>
          </Card>
        </section>
      ) : null}

      {F && s.type && s.jur && s.ack.capital ? (
        <section>
          <SectionHeading title={'E · ' + F.second.label} right={s.second ? 'Settled' : 'Choose one'} />
          <div>
            {Object.keys(F.second.opts).map((o) => {
              const op = F.second.opts[o];
              return (
                <OptionRow
                  key={o}
                  title={op.n}
                  why={op.why}
                  pressed={s.second === o}
                  onSelect={() => s.setSecond(o)}
                  details={[{ k: 'Revenue ×', v: op.mult.toFixed(2) }]}
                />
              );
            })}
          </div>
        </section>
      ) : null}

      <Foot
        message={
          done
            ? 'The four determinations are settled. The Assembly specifies the institution layer by layer.'
            : 'All four determinations must be settled before The Assembly opens.'
        }
        label="Specify the institution"
        onAdvance={() => s.act('goAssembly')}
        ready={done}
      />
      <Disclaimer />
    </>
  );
}
