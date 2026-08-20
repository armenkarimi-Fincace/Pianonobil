'use client';

import { useAppStore } from '@/store/useAppStore';

const DOORS: [('w' | 'm'), string, string, string, string, string][] = [
  [
    'w',
    'Door one',
    'I hold an institution',
    'It operates today. One discipline, or several, needs to be rebuilt, replaced, upgraded or defended.',
    'Diagnosis of what you run · works against each discipline · what the change interrupts · a single-service engagement',
    'Enter the Works Room',
  ],
  [
    'm',
    'Door two',
    'I intend to build one',
    'There is capital and an intention, and no institution yet. It must be designed, licensed, built and opened.',
    'Constitution · assembly layer by layer · economics · stress · the passage · the room you would hold',
    'Enter the Model Room',
  ],
];

/**
 * The Gateway. One question decides the room, and it is asked once — the door
 * not taken is closed for the session, exactly as it would be in the live
 * environment.
 */
export function Gateway() {
  const chosen = useAppStore((s) => s.entry);
  const chooseDoor = useAppStore((s) => s.chooseDoor);

  return (
    <>
      <div className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="seal" src="/seal.png" alt="" />
        <span className="eyebrow m">X&#8209;Chase</span>
        <h1>The Piano Nobile</h1>
        <hr className="rule" />
        <div className="sub">The principal floor of the House</div>
        <p className="note-t" style={{ maxWidth: '66ch', margin: '32px auto 12px' }}>
          In a great house the <em>piano nobile</em> is the floor above the street — reached by
          ascent, entered by invitation, and given over entirely to the rooms in which consequential
          matters are settled.
        </p>
        <p className="meta" style={{ maxWidth: '60ch', margin: '0 auto' }}>
          A private environment for sovereign offices, financial institutions, private capital, and
          the principals who direct them.
        </p>
      </div>

      <section style={{ marginTop: 0 }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="eyebrow q">Before anything else</span>
          <h2 style={{ marginTop: '12px' }}>One question decides the room</h2>
          <p className="note-t" style={{ maxWidth: '64ch', margin: '20px auto 0' }}>
            The House keeps two working rooms and they do not overlap. A principal who holds an
            institution is asking a different question from one who intends to build a first. Answer
            once, and you will not be asked again.
          </p>
        </div>

        <div className="doors">
          {DOORS.map((d) => {
            const off = !!(chosen && chosen !== d[0]);
            return (
              <button
                key={d[0]}
                type="button"
                className={'door' + (off ? ' off' : '')}
                onClick={() => chooseDoor(d[0])}
              >
                <span className={'eyebrow ' + (chosen === d[0] ? 'm' : 'q')}>{d[1]}</span>
                <h3>{d[2]}</h3>
                <p className="note-t">{d[3]}</p>
                <div className="path">{d[4]}</div>
                <span className={'btn' + (off ? ' off' : '')} style={{ marginTop: '28px' }}>
                  {off ? 'Closed' : chosen === d[0] ? 'Return to this room' : d[5]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="meta" style={{ textAlign: 'center', maxWidth: '60ch', margin: '40px auto 0' }}>
          {chosen
            ? 'You entered by ' +
              (chosen === 'w' ? 'the first door' : 'the second door') +
              '. The other room is closed for this session, as it would be in the live environment.'
            : 'Both doors lead to the same threshold. The Vestibule and the Mandate Room are common to every engagement the House accepts.'}
        </p>
      </section>
    </>
  );
}
