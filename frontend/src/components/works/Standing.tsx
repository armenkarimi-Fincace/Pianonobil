'use client';

import { Card, GateNote, QuietBlock } from '@/components/shared/Blocks';
import { Chip } from '@/components/shared/Chip';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { Mark } from '@/components/shared/DataTable';
import { SectionHeading } from '@/components/shared/SectionHeading';
import { Slider } from '@/components/shared/Slider';
import { useAppStore, wStepDone } from '@/store/useAppStore';

const FAMILY_ORDER = ['cm', 'aw', 'bp', 'as'];

/**
 * Step 01 · The Standing. Before anything is proposed the House establishes
 * what the principal actually runs today — every later recommendation is a
 * comparison against it, not against a blank page.
 */
export function Standing() {
  const s = useAppStore();
  const layers = s.layers();
  const F = s.fam ? s.catalog.families[s.fam] : null;
  const done = wStepDone(s, layers, 'standing');

  return (
    <>
      <Head
        title="The Standing"
        right={F ? F.name : 'Nine disciplines'}
        lede="You already hold an institution. Before anything is proposed, the House establishes what you actually run today — because every recommendation that follows is a comparison against it, not an ideal drawn on a blank page."
      />

      {s.sub === 'hold' ? (
        <section>
          <SectionHeading title="A · What you hold" right="Family, then institution" />
          <Card>
            {FAMILY_ORDER.map((k) => (
              <Chip key={k} pressed={s.fam === k} onClick={() => s.setFamily(k)}>
                {s.catalog.families[k].name}
              </Chip>
            ))}
            {F ? (
              <>
                <div
                  style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line-soft)' }}
                >
                  {Object.keys(F.types).map((t) => (
                    <Chip key={t} pressed={s.type === t} onClick={() => s.setType(t)}>
                      {F.types[t].n}
                    </Chip>
                  ))}
                </div>
                {s.type ? (
                  <p className="note-t" style={{ margin: '16px 0 0' }}>
                    {F.types[s.type].note}
                  </p>
                ) : null}
              </>
            ) : (
              <GateNote>
                <strong>Begin here.</strong> The family decides which nine disciplines the House will
                examine.
              </GateNote>
            )}
          </Card>
        </section>
      ) : s.sub === 'licence' ? (
        !F || !s.type ? (
          <GateNote>Declare what you hold first.</GateNote>
        ) : (
          <section>
            <SectionHeading
              title="B · Where it is licensed"
              right={s.jur ? s.catalog.jurisdictions[s.jur].tn : 'Six routes'}
            />
            <Card>
              {Object.keys(s.catalog.jurisdictions).map((j) => (
                <Chip key={j} pressed={s.jur === j} onClick={() => s.setJurisdiction(j)}>
                  {s.catalog.jurisdictions[j].n}
                </Chip>
              ))}
              {s.jur ? (
                <QuietBlock title="What this jurisdiction costs you">
                  <p style={{ marginTop: '10px' }}>{s.catalog.jurisdictions[s.jur].note}</p>
                </QuietBlock>
              ) : null}
              <Slider
                className="mt-7"
                label="Years in operation"
                display={s.W.age + ' years'}
                value={s.W.age}
                min={1}
                max={25}
                step={1}
                onChange={(v) => useAppStore.setState((st) => ({ W: { ...st.W, age: Math.round(v) } }))}
              />
            </Card>
          </section>
        )
      ) : !F || !s.type || !s.jur ? (
        <GateNote>Declare what you hold, and where it is licensed, first.</GateNote>
      ) : (
        <section>
          <SectionHeading
            title="C · What you run today"
            right={layers.filter((l) => s.W.cur[l.key]).length + ' of ' + layers.length + ' declared'}
          />
          <p className="note-t" style={{ marginBottom: '24px' }}>
            In each discipline, choose the configuration that is true of you today. This is the most
            valuable information the House collects, and you are giving it freely — so it is worth
            being exact.
          </p>
          {layers.map((lay) => {
            const cid = s.W.cur[lay.key];
            return (
              <Card key={lay.key} style={{ marginBottom: '16px' }}>
                <div className="sec-h" style={{ marginBottom: '14px' }}>
                  <span className="eyebrow m">{lay.name}</span>
                  {cid ? <Mark tone="ok">Declared</Mark> : <span className="eyebrow">Awaiting</span>}
                </div>
                {lay.options.map((o) => (
                  <Chip key={o.id} pressed={cid === o.id} onClick={() => s.setCurrent(lay.key, o.id)}>
                    {o.name}
                  </Chip>
                ))}
              </Card>
            );
          })}
        </section>
      )}

      <Foot
        message={
          done
            ? 'Everything is declared. The Diagnosis grades each discipline against the House standard.'
            : 'Declare the family, the institution, the jurisdiction and all nine disciplines.'
        }
        label="See the diagnosis"
        onAdvance={() => s.act('wGoDiagnosis')}
        ready={done}
      />
      <Disclaimer />
    </>
  );
}
