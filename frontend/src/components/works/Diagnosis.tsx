'use client';

import { Card } from '@/components/shared/Blocks';
import { DataTable, Mark } from '@/components/shared/DataTable';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Foot } from '@/components/shared/Foot';
import { Head } from '@/components/shared/Head';
import { NonagonFigure } from '@/components/figures/NonagonFigure';
import { RingFigure } from '@/components/figures/RingFigure';
import { curIndex, GRADE, gradeOf } from '@/lib/works';
import { useAppStore } from '@/store/useAppStore';

/**
 * Step 02 · The Diagnosis. Where a discipline is sound, no work is proposed
 * and none is invented.
 */
export function Diagnosis() {
  const s = useAppStore();
  const layers = s.layers();
  const grades: Record<string, number> = {};
  for (const l of layers) grades[l.key] = gradeOf(layers, s.W.cur, l.key);

  const weak = layers.filter((l) => grades[l.key] <= 2);
  const sound = layers.filter((l) => grades[l.key] > 2);
  const show = s.sub === 'weak' ? weak : s.sub === 'sound' ? sound : layers;

  return (
    <>
      <Head
        title="The Diagnosis"
        right={weak.length + ' of ' + layers.length + ' below standard'}
        lede="Where a discipline is sound, no work is proposed and none is invented."
      />

      <div className="g2 min0" style={{ marginBottom: '32px' }}>
        <Card lg>
          <NonagonFigure layers={layers} grades={grades} />
          <p className="fread">
            Each corner is one discipline. The further a corner reaches, the sounder the House
            considers it. Short corners are where work is proposed — and only there.
          </p>
        </Card>
        <Card lg>
          <div className="sec-h">
            <span className="eyebrow m">Standing</span>
          </div>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <RingFigure v={weak.length} total={layers.length} />
            <div style={{ flex: '1 1 200px', minWidth: 0 }}>
              <p className="note-t" style={{ margin: 0 }}>
                Disciplines the House would not sign off as they stand. Each is examined in The
                Works, and each may be left alone.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <section>
        <DataTable
          columns={[
            { head: 'Discipline', width: '22%' },
            { head: 'What you run', width: '24%' },
            { head: 'Assessment', width: '16%' },
            { head: 'Finding' },
          ]}
        >
          {!show.length ? (
            <tr>
              <td colSpan={4}>Nothing in this view.</td>
            </tr>
          ) : null}
          {show.map((l) => {
            const g = grades[l.key];
            const ci = curIndex(layers, s.W.cur, l.key);
            return (
              <tr key={l.key}>
                <td>
                  <strong>{l.name}</strong>
                </td>
                <td>{ci >= 0 ? l.options[ci].name : '—'}</td>
                <td>
                  <Mark tone={g <= 2 ? 'u' : 'ok'}>{GRADE[g]?.n}</Mark>
                </td>
                <td>{GRADE[g]?.f}</td>
              </tr>
            );
          })}
        </DataTable>
      </section>

      <Foot
        message={
          s.W.ack.diagnosis
            ? 'Acknowledged. The Works sets out what the House would undertake on each discipline.'
            : 'Read the diagnosis, then continue.'
        }
        label={s.W.ack.diagnosis ? 'Open the works' : 'I have read this'}
        onAdvance={() => s.act('wAckDiagnosis')}
        ready
      />
      <Disclaimer />
    </>
  );
}
